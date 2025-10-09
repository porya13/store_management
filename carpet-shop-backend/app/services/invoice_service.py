from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from fastapi import UploadFile
import os
import uuid
from app.models.invoice import Invoice, InvoiceItem
from app.models.carpet import Carpet
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate
from app.config import settings

class InvoiceService:
    def __init__(self, db: Session):
        self.db = db
    
    def generate_invoice_number(self) -> str:
        """ایجاد شماره فاکتور یونیک"""
        # گرفتن آخرین شماره فاکتور
        last_invoice = self.db.query(Invoice).order_by(Invoice.id.desc()).first()
        
        if last_invoice and last_invoice.invoice_number:
            try:
                # استخراج شماره از فرمت INV-YYYYMMDD-XXXX
                parts = last_invoice.invoice_number.split('-')
                if len(parts) == 3 and parts[1] == datetime.now().strftime("%Y%m%d"):
                    last_number = int(parts[2])
                    return f"INV-{datetime.now().strftime('%Y%m%d')}-{last_number + 1:04d}"
            except:
                pass
        
        # اگر فاکتوری نیست یا روز جدید است
        return f"INV-{datetime.now().strftime('%Y%m%d')}-0001"
    
    def create_invoice(self, invoice_data: InvoiceCreate) -> Invoice:
        """ایجاد فاکتور جدید"""
        # ایجاد فاکتور
        invoice = Invoice(
            invoice_number=self.generate_invoice_number(),
            customer_name=invoice_data.customer_name,
            payment_method=invoice_data.payment_method,
            description=invoice_data.description,
            invoice_date=invoice_data.invoice_date,
            total_amount=0
        )
        self.db.add(invoice)
        self.db.flush()
        
        # افزودن آیتم‌های فاکتور
        total = 0
        for item_data in invoice_data.items:
            # بررسی موجودی فرش
            carpet = self.db.query(Carpet).filter(Carpet.id == item_data.carpet_id).first()
            if not carpet or carpet.quantity < item_data.quantity:
                self.db.rollback()
                raise ValueError(f"موجودی کافی برای فرش {item_data.title} وجود ندارد")
            
            total_price = item_data.unit_price * item_data.quantity
            item = InvoiceItem(
                invoice_id=invoice.id,
                carpet_id=item_data.carpet_id,
                title=item_data.title,
                size=item_data.size,
                brand=item_data.brand,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                total_price=total_price,
                description=item_data.description
            )
            self.db.add(item)
            total += total_price
        
        invoice.total_amount = total
        self.db.commit()
        self.db.refresh(invoice)
        return invoice
    
    def get_invoice(self, invoice_id: int) -> Optional[Invoice]:
        """دریافت یک فاکتور"""
        return self.db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    def list_invoices(
        self,
        skip: int = 0,
        limit: int = 100,
        customer_name: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Invoice]:
        """لیست فاکتورها با فیلتر"""
        query = self.db.query(Invoice)
        
        if customer_name:
            query = query.filter(Invoice.customer_name.ilike(f"%{customer_name}%"))
        
        if start_date:
            query = query.filter(Invoice.invoice_date >= start_date)
        
        if end_date:
            query = query.filter(Invoice.invoice_date <= end_date)
        
        return query.order_by(Invoice.invoice_date.desc()).offset(skip).limit(limit).all()
    
    def update_invoice(self, invoice_id: int, invoice_update: InvoiceUpdate) -> Optional[Invoice]:
        """ویرایش فاکتور"""
        invoice = self.get_invoice(invoice_id)
        if not invoice:
            return None
        
        update_data = invoice_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(invoice, field, value)
        
        invoice.last_edited_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(invoice)
        return invoice
    
    def delete_invoice(self, invoice_id: int) -> bool:
        """حذف فاکتور"""
        invoice = self.get_invoice(invoice_id)
        if not invoice:
            return False
        
        # برگشت موجودی فرش‌ها اگر فاکتور نهایی شده بود
        for item in invoice.items:
            carpet = self.db.query(Carpet).filter(Carpet.id == item.carpet_id).first()
            if carpet:
                carpet.quantity += item.quantity
        
        self.db.delete(invoice)
        self.db.commit()
        return True
    
    def upload_signature(self, invoice_id: int, file: UploadFile) -> Optional[str]:
        """آپلود امضا برای فاکتور"""
        invoice = self.get_invoice(invoice_id)
        if not invoice:
            return None
        
        os.makedirs(settings.upload_dir, exist_ok=True)
        
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"signature_{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(settings.upload_dir, unique_filename)
        
        with open(file_path, "wb") as buffer:
            content = file.file.read()
            buffer.write(content)
        
        if invoice.signature_path and os.path.exists(invoice.signature_path):
            os.remove(invoice.signature_path)
        
        invoice.signature_path = file_path
        invoice.is_signed = True
        invoice.last_edited_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(invoice)
        
        return file_path
    
    def finalize_invoice(self, invoice_id: int) -> Optional[Invoice]:
        """نهایی کردن فاکتور و کم کردن از موجودی"""
        invoice = self.get_invoice(invoice_id)
        if not invoice:
            return None
        
        # کم کردن موجودی فرش‌ها
        for item in invoice.items:
            carpet = self.db.query(Carpet).filter(Carpet.id == item.carpet_id).first()
            if carpet:
                carpet.quantity -= item.quantity
                if carpet.quantity < 0:
                    carpet.quantity = 0
        
        invoice.last_edited_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(invoice)
        return invoice