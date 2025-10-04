from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Expense, User, UserRole, ExpenseStatus
from pydantic import BaseModel

router = APIRouter()

# Pydantic models for request/response
class ExpenseApprovalRequest(BaseModel):
    status: str  # "Approved" or "Rejected"
    comments: str = None

class ExpenseResponse(BaseModel):
    id: int
    amount: float
    currency: str
    date: str
    description: str
    status: str
    owner_id: int
    created_at: str
    updated_at: str = None
    
    class Config:
        from_attributes = True

class ApprovalResponse(BaseModel):
    message: str
    expense: ExpenseResponse

# Mock function to get current user (for now returns user_id=1)
def get_current_user_id():
    """Mock function to get current user ID. In real app, this would come from JWT token."""
    return 1

# Mock function to get current user role (for now returns Manager)
def get_current_user_role():
    """Mock function to get current user role. In real app, this would come from JWT token."""
    return UserRole.MANAGER  # For now, assume user_id=1 is a Manager

# Mock function to check if user can approve (Manager or Admin)
def can_approve(user_role: UserRole):
    """Check if user has approval privileges (Manager or Admin)"""
    return user_role in [UserRole.MANAGER, UserRole.ADMIN]

@router.get("/pending", response_model=List[ExpenseResponse])
async def get_pending_expenses(db: Session = Depends(get_db)):
    """Get all expenses with status Pending"""
    try:
        # Get current user role
        current_user_role = get_current_user_role()
        
        # Check if user can view pending expenses (Manager or Admin)
        if not can_approve(current_user_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Manager or Admin privileges required."
            )
        
        # Query all pending expenses
        pending_expenses = db.query(Expense).filter(
            Expense.status == ExpenseStatus.PENDING
        ).all()
        
        return pending_expenses
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch pending expenses: {str(e)}"
        )

@router.post("/{expense_id}", response_model=ApprovalResponse)
async def approve_or_reject_expense(
    expense_id: int, 
    approval_request: ExpenseApprovalRequest, 
    db: Session = Depends(get_db)
):
    """Approve or reject an expense"""
    try:
        # Get current user info
        current_user_id = get_current_user_id()
        current_user_role = get_current_user_role()
        
        # Check if user can approve (Manager or Admin)
        if not can_approve(current_user_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Manager or Admin privileges required."
            )
        
        # Validate status
        if approval_request.status not in ["Approved", "Rejected"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status must be either 'Approved' or 'Rejected'"
            )
        
        # Find the expense
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )
        
        # Check if expense is still pending
        if expense.status != ExpenseStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Expense is already {expense.status.value}. Cannot change status."
            )
        
        # Update expense status
        new_status = ExpenseStatus.APPROVED if approval_request.status == "Approved" else ExpenseStatus.REJECTED
        expense.status = new_status
        
        db.commit()
        db.refresh(expense)
        
        # Prepare response message
        action = "approved" if new_status == ExpenseStatus.APPROVED else "rejected"
        message = f"Expense {action} successfully"
        
        if approval_request.comments:
            message += f" with comments: {approval_request.comments}"
        
        return ApprovalResponse(
            message=message,
            expense=expense
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update expense status: {str(e)}"
        )

@router.get("/", response_model=List[ExpenseResponse])
async def get_all_expenses_for_approval(db: Session = Depends(get_db)):
    """Get all expenses for approval management (Manager/Admin only)"""
    try:
        # Get current user role
        current_user_role = get_current_user_role()
        
        # Check if user can view all expenses (Manager or Admin)
        if not can_approve(current_user_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Manager or Admin privileges required."
            )
        
        # Query all expenses
        expenses = db.query(Expense).all()
        
        return expenses
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch expenses: {str(e)}"
        )
