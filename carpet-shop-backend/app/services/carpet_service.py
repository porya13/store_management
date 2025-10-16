
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime
from fastapi import UploadFile
import os
import uuid
from app.models.carpet import Carpet, CarpetOperation, CarpetSize
from app.schemas.carpet import (
    CarpetCreate, CarpetUpdate, CarpetOperationCreate, CarpetOperationUpdate
)
from app.config import settings

class CarpetService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_carpet(self, carpet_data: CarpetCreate) -> Carpet:
        """ایجاد فرش جدید"""
        carpet = Carpet(**carpet_data.model_dump())
        self.db.add(carpet)
        self.db.commit()
        self.db.refresh(carpet)
        return carpet
    
    def get_carpet(self, carpet_id: int) -> Optional[Carpet]:
        """دریافت یک فرش با ID (فقط فرش‌های حذف نشده)"""
        return self.db.query(Carpet).filter(
            Carpet.id == carpet_id,
            Carpet.is_deleted == False
        ).first()
    
    def list_carpets(
        self,
        skip: int = 0,
        limit: int = 100,
        size: Optional[CarpetSize] = None,
        material: Optional[str] = None,
        search: Optional[str] = None,
        available_only: bool = False,
        include_deleted: bool = False  # پارامتر جدید
    ) -> List[Carpet]:
        """لیست فرش‌ها با فیلتر (فقط فرش‌های حذف نشده)"""
        query = self.db.query(Carpet)
        
        # فیلتر حذف نشده‌ها
        if not include_deleted:
            query = query.filter(Carpet.is_deleted == False)
        
        if size:
            query = query.filter(Carpet.size == size)
        
        if material:
            query = query.filter(Carpet.material.ilike(f"%{material}%"))
        
        if search:
            query = query.filter(
                or_(
                    Carpet.pattern.ilike(f"%{search}%"),
                    Carpet.brand.ilike(f"%{search}%"),
                    Carpet.description.ilike(f"%{search}%")
                )
            )
        
        if available_only:
            query = query.filter(Carpet.quantity > 0)
        
        return query.offset(skip).limit(limit).all()
    
    def update_carpet(self, carpet_id: int, carpet_update: CarpetUpdate) -> Optional[Carpet]:
        """ویرایش فرش"""
        carpet = self.get_carpet(carpet_id)
        if not carpet:
            return None
        
        update_data = carpet_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(carpet, field, value)
        
        carpet.last_edited_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(carpet)
        return carpet
    
    def delete_carpet(self, carpet_id: int) -> bool:
        """حذف نرم (Soft Delete) فرش"""
        carpet = self.get_carpet(carpet_id)
        if not carpet:
            return False
        
        # به جای حذف واقعی، فقط علامت‌گذاری می‌کنیم
        carpet.is_deleted = True
        carpet.deleted_at = datetime.utcnow()
        
        self.db.commit()
        return True
    
    def restore_carpet(self, carpet_id: int) -> bool:
        """بازگردانی فرش حذف شده"""
        carpet = self.db.query(Carpet).filter(
            Carpet.id == carpet_id,
            Carpet.is_deleted == True
        ).first()
        
        if not carpet:
            return False
        
        carpet.is_deleted = False
        carpet.deleted_at = None
        
        self.db.commit()
        return True
    
    def permanent_delete_carpet(self, carpet_id: int) -> bool:
        """حذف واقعی و دائمی فرش (فقط برای ادمین)"""
        carpet = self.db.query(Carpet).filter(Carpet.id == carpet_id).first()
        if not carpet:
            return False
        
        self.db.delete(carpet)
        self.db.commit()
        return True
    
    def upload_image(self, carpet_id: int, file: UploadFile) -> Optional[str]:
        """آپلود عکس فرش"""
        carpet = self.get_carpet(carpet_id)
        if not carpet:
            return None
        
        os.makedirs(settings.upload_dir, exist_ok=True)
        
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(settings.upload_dir, unique_filename)
        
        with open(file_path, "wb") as buffer:
            content = file.file.read()
            buffer.write(content)
        
        if carpet.image_path and os.path.exists(carpet.image_path):
            os.remove(carpet.image_path)
        
        carpet.image_path = file_path
        carpet.last_edited_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(carpet)
        
        return file_path
    
    def add_operation(self, carpet_id: int, operation_data: CarpetOperationCreate) -> Optional[CarpetOperation]:
        """افزودن عملیات به فرش"""
        carpet = self.get_carpet(carpet_id)
        if not carpet:
            return None
        
        operation = CarpetOperation(
            carpet_id=carpet_id,
            **operation_data.model_dump()
        )
        self.db.add(operation)
        
        carpet.last_edited_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(operation)
        return operation
    
    def update_operation(self, operation_id: int, operation_update: CarpetOperationUpdate) -> Optional[CarpetOperation]:
        """ویرایش عملیات"""
        operation = self.db.query(CarpetOperation).filter(
            CarpetOperation.id == operation_id
        ).first()
        
        if not operation:
            return None
        
        update_data = operation_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(operation, field, value)
        
        operation.updated_at = datetime.utcnow()
        
        carpet = self.get_carpet(operation.carpet_id)
        if carpet:
            carpet.last_edited_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(operation)
        return operation
    
    def delete_operation(self, operation_id: int) -> bool:
        """حذف عملیات"""
        operation = self.db.query(CarpetOperation).filter(
            CarpetOperation.id == operation_id
        ).first()
        
        if not operation:
            return False
        
        carpet = self.get_carpet(operation.carpet_id)
        if carpet:
            carpet.last_edited_at = datetime.utcnow()
        
        self.db.delete(operation)
        self.db.commit()
        return True
