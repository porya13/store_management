from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserResponse, Token, LoginRequest
from app.utils.auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_user,
    require_admin,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=201)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)  # فقط ادمین می‌تونه یوزر جدید بسازه
):
    """ثبت‌نام کاربر جدید (فقط ادمین)"""
    
    # بررسی تکراری نبودن username
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="این نام کاربری قبلاً استفاده شده"
        )
    
    # بررسی تکراری نبودن email
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="این ایمیل قبلاً استفاده شده"
        )
    
    # ایجاد کاربر جدید
    user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user

@router.post("/login", response_model=Token)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """ورود به سیستم"""
    user = authenticate_user(db, login_data.username, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="نام کاربری یا رمز عبور اشتباه است",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # آپدیت آخرین ورود
    user.last_login = datetime.utcnow()
    db.commit()
    
    # ایجاد token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/token", response_model=Token)
def login_for_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """ورود برای Swagger UI (OAuth2)"""
    user = authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="نام کاربری یا رمز عبور اشتباه است",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user.last_login = datetime.utcnow()
    db.commit()
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """دریافت اطلاعات کاربر فعلی"""
    return current_user

@router.post("/init-admin", response_model=UserResponse)
def create_initial_admin(db: Session = Depends(get_db)):
    """ایجاد ادمین اولیه (فقط اگر هیچ کاربری وجود نداشته باشد)"""
    
    # بررسی اینکه آیا قبلاً کاربری وجود دارد
    if db.query(User).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="قبلاً کاربر ساخته شده است"
        )
    
    # ایجاد ادمین پیش‌فرض
    admin = User(
        username="admin",
        email="admin@carpet-shop.com",
        full_name="حسین غفاری",
        hashed_password=get_password_hash("admin123"),  # پسورد پیش‌فرض
        role=UserRole.ADMIN
    )
    
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    return admin