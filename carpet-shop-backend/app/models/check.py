from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class CheckStatus(str, enum.Enum):
    NOT_REGISTERED = "ثبت نشده"
    REGISTERED = "ثبت شده"
    CONFIRMED = "تایید شده"
    PASSED = "پاس شده"
    BOUNCED = "برگشت خورده"

class CheckType(str, enum.Enum):
    INCOMING = "ورودی"
    OUTGOING = "خروجی"

class Check(Base):
    __tablename__ = "checks"
    
    id = Column(Integer, primary_key=True, index=True)
    check_number = Column(String(100), nullable=False, index=True, comment="شماره چک")
    amount = Column(Float, nullable=False, comment="مبلغ")
    payee = Column(String(200), nullable=False, comment="در وجه")
    check_date = Column(DateTime, nullable=False, comment="تاریخ چک")
    status = Column(SQLEnum(CheckStatus), default=CheckStatus.NOT_REGISTERED, comment="وضعیت چک")
    check_type = Column(SQLEnum(CheckType), nullable=False, comment="نوع چک")
    
    # ارتباط با فاکتور (اختیاری)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True)
    
    # ارتباط با فرش در صورت خرید با چک (اختیاری)
    carpet_id = Column(Integer, ForeignKey("carpets.id"), nullable=True)
    
    # نوتیفیکیشن
    notification_sent = Column(DateTime, nullable=True, comment="زمان ارسال نوتیفیکیشن")
    
    description = Column(String(500), nullable=True, comment="توضیحات")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_edited_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # روابط
    invoice = relationship("Invoice", foreign_keys=[invoice_id], back_populates="checks")
    carpet = relationship("Carpet", foreign_keys=[carpet_id], back_populates="purchase_checks")