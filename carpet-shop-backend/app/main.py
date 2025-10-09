from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import carpets, invoices, checks, reports
from app.database import Base, engine
import os

# ایجاد جداول دیتابیس
Base.metadata.create_all(bind=engine)

# ایجاد پوشه uploads
os.makedirs("uploads", exist_ok=True)

app = FastAPI(
    title="Carpet Shop Management System",
    description="سامانه مدیریت انبار و فروشگاه فرش",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # در production باید محدود شود
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(carpets.router, prefix="/api")
app.include_router(invoices.router, prefix="/api")
app.include_router(checks.router, prefix="/api")
app.include_router(reports.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Carpet Shop Management System API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}