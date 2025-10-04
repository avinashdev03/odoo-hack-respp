from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base

# Enum for user roles
class UserRole(str, enum.Enum):
    EMPLOYEE = "Employee"
    MANAGER = "Manager"
    ADMIN = "Admin"

# Enum for expense status
class ExpenseStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.EMPLOYEE)
    email = Column(String(255), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    expenses = relationship("Expense", back_populates="owner", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', role='{self.role}')>"

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False, default="USD")  # ISO currency code
    date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    description = Column(Text, nullable=False)
    status = Column(Enum(ExpenseStatus), nullable=False, default=ExpenseStatus.PENDING)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="expenses")
    
    def __repr__(self):
        return f"<Expense(id={self.id}, amount={self.amount}, status='{self.status}')>"