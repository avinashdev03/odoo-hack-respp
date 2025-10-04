from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import Expense, User, UserRole, ExpenseStatus
from pydantic import BaseModel

router = APIRouter()

# Pydantic models for request/response
class ExpenseCreate(BaseModel):
    amount: float
    currency: str = "USD"
    date: Optional[datetime] = None
    description: str

class ExpenseResponse(BaseModel):
    id: int
    amount: float
    currency: str
    date: datetime
    description: str
    status: str
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    currency: Optional[str] = None
    date: Optional[datetime] = None
    description: Optional[str] = None
    status: Optional[str] = None

# Mock function to get current user (for now returns user_id=1)
def get_current_user_id():
    """Mock function to get current user ID. In real app, this would come from JWT token."""
    return 1

# Mock function to check if user is admin (for now returns True for user_id=1)
def is_admin(user_id: int = 1):
    """Mock function to check if user is admin. In real app, this would check user role."""
    return True  # For now, assume user_id=1 is admin

@router.post("/", response_model=ExpenseResponse)
async def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    """Create a new expense"""
    try:
        # Get current user ID (mocked for now)
        current_user_id = get_current_user_id()
        
        # Create new expense
        db_expense = Expense(
            amount=expense.amount,
            currency=expense.currency,
            date=expense.date or datetime.utcnow(),
            description=expense.description,
            status=ExpenseStatus.PENDING,
            owner_id=current_user_id
        )
        
        db.add(db_expense)
        db.commit()
        db.refresh(db_expense)
        
        return db_expense
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create expense: {str(e)}"
        )

@router.get("/mine", response_model=List[ExpenseResponse])
async def get_my_expenses(db: Session = Depends(get_db)):
    """Get logged-in user's expenses"""
    try:
        # Get current user ID (mocked for now)
        current_user_id = get_current_user_id()
        
        # Query expenses for current user
        expenses = db.query(Expense).filter(Expense.owner_id == current_user_id).all()
        
        return expenses
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user expenses: {str(e)}"
        )

@router.get("/all", response_model=List[ExpenseResponse])
async def get_all_expenses(db: Session = Depends(get_db)):
    """Get all expenses (Admin only)"""
    try:
        # Get current user ID (mocked for now)
        current_user_id = get_current_user_id()
        
        # Check if user is admin
        if not is_admin(current_user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Admin privileges required."
            )
        
        # Query all expenses
        expenses = db.query(Expense).all()
        
        return expenses
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch all expenses: {str(e)}"
        )

@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(expense_id: int, db: Session = Depends(get_db)):
    """Get a specific expense by ID"""
    try:
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )
        
        return expense
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch expense: {str(e)}"
        )

@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: int, expense_update: ExpenseUpdate, db: Session = Depends(get_db)):
    """Update an expense"""
    try:
        # Get current user ID (mocked for now)
        current_user_id = get_current_user_id()
        
        # Find the expense
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )
        
        # Check if user owns the expense or is admin
        if expense.owner_id != current_user_id and not is_admin(current_user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only update your own expenses."
            )
        
        # Update fields
        update_data = expense_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(expense, field, value)
        
        db.commit()
        db.refresh(expense)
        
        return expense
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update expense: {str(e)}"
        )

@router.delete("/{expense_id}")
async def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    """Delete an expense"""
    try:
        # Get current user ID (mocked for now)
        current_user_id = get_current_user_id()
        
        # Find the expense
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )
        
        # Check if user owns the expense or is admin
        if expense.owner_id != current_user_id and not is_admin(current_user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only delete your own expenses."
            )
        
        db.delete(expense)
        db.commit()
        
        return {"message": "Expense deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete expense: {str(e)}"
        )
