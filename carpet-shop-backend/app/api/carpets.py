from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.utils.auth import get_current_user, require_admin
from app.schemas.carpet import (
    CarpetCreate, CarpetUpdate, CarpetResponse, CarpetListResponse,
    CarpetOperationCreate, CarpetOperationUpdate, CarpetOperationResponse
)
from app.services.carpet_service import CarpetService
from app.models.carpet import CarpetSize
from fastapi.responses import FileResponse, JSONResponse
import os

router = APIRouter(prefix="/carpets", tags=["Carpets"])

@router.post("/", response_model=CarpetResponse, status_code=201)
def create_carpet(
    carpet: CarpetCreate,
    db: Session = Depends(get_db)
):
    """ایجاد فرش جدید"""
    service = CarpetService(db)
    return service.create_carpet(carpet)

@router.get("/", response_model=List[CarpetListResponse])
def list_carpets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    size: Optional[CarpetSize] = None,
    material: Optional[str] = None,
    search: Optional[str] = None,
    available_only: bool = False,
    db: Session = Depends(get_db)
):
    """لیست فرش‌ها با فیلتر و جستجو"""
    service = CarpetService(db)
    return service.list_carpets(
        skip=skip,
        limit=limit,
        size=size,
        material=material,
        search=search,
        available_only=available_only
    )

@router.get("/{carpet_id}", response_model=CarpetResponse)
def get_carpet(carpet_id: int, db: Session = Depends(get_db)):
    """دریافت اطلاعات کامل یک فرش"""
    service = CarpetService(db)
    carpet = service.get_carpet(carpet_id)
    if not carpet:
        raise HTTPException(status_code=404, detail="فرش یافت نشد")
    return carpet

@router.put("/{carpet_id}", response_model=CarpetResponse)
def update_carpet(
    carpet_id: int,
    carpet_update: CarpetUpdate,
    db: Session = Depends(get_db)
):
    """ویرایش اطلاعات فرش"""
    service = CarpetService(db)
    carpet = service.update_carpet(carpet_id, carpet_update)
    if not carpet:
        raise HTTPException(status_code=404, detail="فرش یافت نشد")
    return carpet

@router.delete("/{carpet_id}", status_code=204)
def delete_carpet(carpet_id: int, db: Session = Depends(get_db)):
    """حذف فرش"""
    service = CarpetService(db)
    success = service.delete_carpet(carpet_id)
    if not success:
        raise HTTPException(status_code=404, detail="فرش یافت نشد")
    return None

@router.post("/{carpet_id}/image")
def upload_carpet_image(
    carpet_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """آپلود عکس فرش"""
    service = CarpetService(db)
    image_path = service.upload_image(carpet_id, file)
    if not image_path:
        raise HTTPException(status_code=404, detail="فرش یافت نشد")
    return {"image_path": image_path}

@router.post("/{carpet_id}/operations", response_model=CarpetOperationResponse, status_code=201)
def add_operation(
    carpet_id: int,
    operation: CarpetOperationCreate,
    db: Session = Depends(get_db)
):
    """افزودن عملیات به فرش"""
    service = CarpetService(db)
    return service.add_operation(carpet_id, operation)

@router.put("/operations/{operation_id}", response_model=CarpetOperationResponse)
def update_operation(
    operation_id: int,
    operation_update: CarpetOperationUpdate,
    db: Session = Depends(get_db)
):
    """ویرایش عملیات"""
    service = CarpetService(db)
    operation = service.update_operation(operation_id, operation_update)
    if not operation:
        raise HTTPException(status_code=404, detail="عملیات یافت نشد")
    return operation

@router.delete("/operations/{operation_id}", status_code=204)
def delete_operation(operation_id: int, db: Session = Depends(get_db)):
    """حذف عملیات"""
    service = CarpetService(db)
    success = service.delete_operation(operation_id)
    if not success:
        raise HTTPException(status_code=404, detail="عملیات یافت نشد")
    return None

@router.get("/export/pdf")
def export_carpets_pdf(
    size: Optional[CarpetSize] = None,
    material: Optional[str] = None,
    search: Optional[str] = None,
    available_only: bool = False,
    db: Session = Depends(get_db)
):
    """خروجی PDF فرش‌های فیلتر شده"""
    # بررسی اینکه reportlab نصب هست یا نه
    try:
        from app.services.pdf_service import PDFService, REPORTLAB_AVAILABLE
        
        if not REPORTLAB_AVAILABLE:
            return JSONResponse(
                status_code=503,
                content={
                    "error": "PDF generation not available",
                    "message": "reportlab is not installed. Install it with: pip install reportlab"
                }
            )
        
        carpet_service = CarpetService(db)
        pdf_service = PDFService()
        
        carpets = carpet_service.list_carpets(
            skip=0,
            limit=10000,
            size=size,
            material=material,
            search=search,
            available_only=available_only
        )
        
        pdf_path = pdf_service.generate_carpets_pdf(carpets)
        
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="خطا در ایجاد PDF")
        
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename="carpets_export.pdf"
        )
    except ImportError as e:
        return JSONResponse(
            status_code=503,
            content={
                "error": "PDF generation not available",
                "message": str(e)
            }
        )