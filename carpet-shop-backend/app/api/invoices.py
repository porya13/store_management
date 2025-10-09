from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.schemas.invoice import (
    InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceListResponse
)
from app.services.invoice_service import InvoiceService

router = APIRouter(prefix="/invoices", tags=["Invoices"])

@router.post("/", response_model=InvoiceResponse, status_code=201)
def create_invoice(
    invoice: InvoiceCreate,
    db: Session = Depends(get_db)
):
    """ایجاد فاکتور جدید"""
    service = InvoiceService(db)
    return service.create_invoice(invoice)

@router.get("/", response_model=List[InvoiceListResponse])
def list_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    customer_name: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """لیست فاکتورها با فیلتر"""
    service = InvoiceService(db)
    return service.list_invoices(
        skip=skip,
        limit=limit,
        customer_name=customer_name,
        start_date=start_date,
        end_date=end_date
    )

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    """دریافت اطلاعات کامل یک فاکتور"""
    service = InvoiceService(db)
    invoice = service.get_invoice(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="فاکتور یافت نشد")
    return invoice

@router.put("/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceUpdate,
    db: Session = Depends(get_db)
):
    """ویرایش فاکتور"""
    service = InvoiceService(db)
    invoice = service.update_invoice(invoice_id, invoice_update)
    if not invoice:
        raise HTTPException(status_code=404, detail="فاکتور یافت نشد")
    return invoice

@router.delete("/{invoice_id}", status_code=204)
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    """حذف فاکتور"""
    service = InvoiceService(db)
    success = service.delete_invoice(invoice_id)
    if not success:
        raise HTTPException(status_code=404, detail="فاکتور یافت نشد")
    return None

@router.post("/{invoice_id}/signature")
def upload_signature(
    invoice_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """آپلود امضا برای فاکتور"""
    service = InvoiceService(db)
    signature_path = service.upload_signature(invoice_id, file)
    if not signature_path:
        raise HTTPException(status_code=404, detail="فاکتور یافت نشد")
    return {"signature_path": signature_path}

@router.post("/{invoice_id}/finalize", response_model=InvoiceResponse)
def finalize_invoice(invoice_id: int, db: Session = Depends(get_db)):
    """نهایی کردن فاکتور و کم کردن از موجودی"""
    service = InvoiceService(db)
    invoice = service.finalize_invoice(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="فاکتور یافت نشد یا قبلا نهایی شده")
    return invoice