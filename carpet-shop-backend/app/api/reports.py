from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from app.database import get_db
from app.services.report_service import ReportService
from pydantic import BaseModel

router = APIRouter(prefix="/reports", tags=["Reports"])

class FinancialReport(BaseModel):
    total_revenue: float
    total_cost: float
    profit: float
    total_invoices: int
    total_sold_carpets: int
    total_incoming_checks: float
    total_outgoing_checks: float
    net_check_balance: float

class PeriodRequest(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

@router.post("/financial", response_model=FinancialReport)
def get_financial_report(
    period: PeriodRequest,
    db: Session = Depends(get_db)
):
    """گزارش مالی با بازه زمانی دلخواه"""
    service = ReportService(db)
    return service.get_financial_report(period.start_date, period.end_date)

@router.get("/financial/daily", response_model=FinancialReport)
def get_daily_report(db: Session = Depends(get_db)):
    """گزارش روزانه"""
    service = ReportService(db)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=1)
    return service.get_financial_report(start_date, end_date)

@router.get("/financial/weekly", response_model=FinancialReport)
def get_weekly_report(db: Session = Depends(get_db)):
    """گزارش هفتگی"""
    service = ReportService(db)
    end_date = datetime.now()
    start_date = end_date - timedelta(weeks=1)
    return service.get_financial_report(start_date, end_date)

@router.get("/financial/monthly", response_model=FinancialReport)
def get_monthly_report(db: Session = Depends(get_db)):
    """گزارش ماهانه"""
    service = ReportService(db)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    return service.get_financial_report(start_date, end_date)

@router.get("/financial/quarterly", response_model=FinancialReport)
def get_quarterly_report(db: Session = Depends(get_db)):
    """گزارش سه ماهه"""
    service = ReportService(db)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90)
    return service.get_financial_report(start_date, end_date)

@router.get("/financial/semi-annual", response_model=FinancialReport)
def get_semi_annual_report(db: Session = Depends(get_db)):
    """گزارش شش ماهه"""
    service = ReportService(db)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)
    return service.get_financial_report(start_date, end_date)

@router.get("/financial/annual", response_model=FinancialReport)
def get_annual_report(db: Session = Depends(get_db)):
    """گزارش یکساله"""
    service = ReportService(db)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    return service.get_financial_report(start_date, end_date)

@router.get("/inventory")
def get_inventory_report(db: Session = Depends(get_db)):
    """گزارش موجودی انبار"""
    service = ReportService(db)
    return service.get_inventory_report()