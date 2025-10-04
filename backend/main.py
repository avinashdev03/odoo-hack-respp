from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, create_tables
from routers import users, expenses, approvals

# Create database tables
create_tables()

# Initialize FastAPI app
app = FastAPI(
    title="Expense Management System API",
    description="Backend API for Expense Management System with React frontend support",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server
        "http://localhost:5173",  # Vite development server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])
app.include_router(approvals.router, prefix="/api/approvals", tags=["approvals"])

@app.get("/")
async def root():
    return {
        "message": "Expense Management System API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "users": "/api/users",
            "expenses": "/api/expenses", 
            "approvals": "/api/approvals"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "tables_created": True
    }

@app.get("/api")
async def api_info():
    return {
        "message": "Expense Management System API",
        "endpoints": {
            "users": {
                "base_url": "/api/users",
                "description": "User management endpoints"
            },
            "expenses": {
                "base_url": "/api/expenses",
                "endpoints": {
                    "create": "POST /api/expenses",
                    "my_expenses": "GET /api/expenses/mine",
                    "all_expenses": "GET /api/expenses/all (Admin only)"
                }
            },
            "approvals": {
                "base_url": "/api/approvals",
                "endpoints": {
                    "pending": "GET /api/approvals/pending",
                    "approve_reject": "POST /api/approvals/{expense_id}"
                }
            }
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting Expense Management System API...")
    print("API Documentation available at: http://localhost:8000/docs")
    print("React frontend should connect to: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
