from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.schemas.check import CheckCreate, CheckUpdate, CheckResponse
from app.services.check_service import CheckService
from app.models.check import CheckStatus, CheckType

router = APIRouter(prefix="/checks", tags=["Checks"])

@router.post("/", response_model=CheckResponse, status_code=201)
def create_check(
    check: CheckCreate,
    db: Session = Depends(get_db)
):
    """ایجاد چک جدید"""
    service = CheckService(db)
    return service.create_check(check)

@router.get("/", response_model=List[CheckResponse])
def list_checks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    check_type: Optional[CheckType] = None,
    status: Optional[CheckStatus] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """لیست چک‌ها با فیلتر"""
    service = CheckService(db)
    return service.list_checks(
        skip=skip,
        limit=limit,
        check_type=check_type,
        status=status,
        start_date=start_date,
        end_date=end_date
    )

@router.get("/upcoming", response_model=List[CheckResponse])
def get_upcoming_checks(
    days: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db)
):
    """دریافت چک‌های نزدیک به سررسید"""
    service = CheckService(db)
    return service.get_upcoming_checks(days)

@router.get("/{check_id}", response_model=CheckResponse)
def get_check(check_id: int, db: Session = Depends(get_db)):
    """دریافت اطلاعات یک چک"""
    service = CheckService(db)
    check = service.get_check(check_id)
    if not check:
        raise HTTPException(status_code=404, detail="چک یافت نشد")
    return check

@router.put("/{check_id}", response_model=CheckResponse)
def update_check(
    check_id: int,
    check_update: CheckUpdate,
    db: Session = Depends(get_db)
):
    """ویرایش چک"""
    service = CheckService(db)
    check = service.update_check(check_id, check_update)
    if not check:
        raise HTTPException(status_code=404, detail="چک یافت نشد")
    return check

@router.delete("/{check_id}", status_code=204)
def delete_check(check_id: int, db: Session = Depends(get_db)):
    """حذف چک"""
    service = CheckService(db)
    success = service.delete_check(check_id)
    if not success:
        raise HTTPException(status_code=404, detail="چک یافت نشد")
    return None