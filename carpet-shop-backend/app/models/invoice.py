from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, nullable=False, index=True, comment="شماره فاکتور")
    customer_name = Column(String(200), nullable=False, comment="نام خریدار")
    invoice_date = Column(DateTime, default=datetime.utcnow, comment="تاریخ فاکتور")
    payment_method = Column(String(50), nullable=False, comment="نوع پرداخت")
    total_amount = Column(Float, nullable=False, comment="مبلغ کل")
    description = Column(Text, nullable=True, comment="توضیحات")
    
    # امضا
    signature_path = Column(String(500), nullable=True, comment="مسیر امضا")
    is_signed = Column(Boolean, default=False, comment="امضا شده")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_edited_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # روابط
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    checks = relationship("Check", foreign_keys="[Check.invoice_id]", back_populates="invoice")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    carpet_id = Column(Integer, ForeignKey("carpets.id"), nullable=False)
    
    title = Column(String(200), nullable=False, comment="عنوان")
    size = Column(String(50), nullable=False, comment="سایز")
    brand = Column(String(100), nullable=False, comment="برند")
    quantity = Column(Integer, nullable=False, comment="تعداد")
    unit_price = Column(Float, nullable=False, comment="قیمت فی")
    total_price = Column(Float, nullable=False, comment="قیمت کل")
    description = Column(Text, nullable=True, comment="توضیحات")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    invoice = relationship("Invoice", back_populates="items")
    carpet = relationship("Carpet", back_populates="invoice_items")