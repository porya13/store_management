
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class CarpetSize(str, enum.Enum):
    KOOCHIK = "کوچیک"
    POSHTI = "پشتی"
    ZARCHAHAROK = "زرچارک"
    ZARNIM = "زرنیم"
    QAALICHE = "قالیچه"
    PARDEEI = "پرده‌ای"
    SHESH_METRI = "شش متری"
    NOH_METRI = "نه متری"
    DAVAZDAH_METRI = "12 متری"
    BOZORGTAR = "بزرگ‌تر"

class PaymentMethod(str, enum.Enum):
    CASH = "نقدی"
    CHECK = "چک"
    INSTALLMENT = "قسطی"
    MIXED = "ترکیبی"

class Carpet(Base):
    __tablename__ = "carpets"
    
    id = Column(Integer, primary_key=True, index=True)
    pattern = Column(String(200), nullable=False, comment="نقشه")
    brand = Column(String(100), nullable=False, comment="برند")
    purchase_price = Column(Float, nullable=False, comment="قیمت خرید")
    sale_price = Column(Float, nullable=True, comment="قیمت فروش")
    material = Column(String(100), nullable=False, comment="جنس")
    size = Column(SQLEnum(CarpetSize), nullable=False, comment="اندازه")
    description = Column(Text, nullable=True, comment="توضیحات")
    purchase_date = Column(DateTime, nullable=False, default=datetime.utcnow, comment="تاریخ خرید")
    image_path = Column(String(500), nullable=True, comment="مسیر عکس")
    quantity = Column(Integer, default=1, comment="تعداد")
    
    # اطلاعات فروشنده
    seller_name = Column(String(200), nullable=True, comment="نام فروشنده")
    is_consignment = Column(Boolean, default=False, comment="آیا امانتی است")
    consignment_owner = Column(String(200), nullable=True, comment="نام صاحب امانت")
    owner_declared_price = Column(Float, nullable=True, comment="قیمت اعلامی مالک")
    consignment_date = Column(DateTime, nullable=True, comment="تاریخ امانت")
    
    # ویژگی‌های اضافی
    has_pair = Column(Boolean, default=False, comment="آیا جفت دارد")
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False, comment="نحوه پرداخت")
    
    # Soft Delete - اضافه شده
    is_deleted = Column(Boolean, default=False, comment="حذف شده؟")
    deleted_at = Column(DateTime, nullable=True, comment="تاریخ حذف")
    
    # تاریخچه ویرایش
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_edited_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # روابط
    operations = relationship("CarpetOperation", back_populates="carpet", cascade="all, delete-orphan")
    invoice_items = relationship("InvoiceItem", back_populates="carpet")
    purchase_checks = relationship("Check", foreign_keys="[Check.carpet_id]", back_populates="carpet")

    @property
    def total_operations_cost(self):
        """محاسبه جمع هزینه عملیات‌ها"""
        return sum(op.price for op in self.operations)
    
    @property
    def total_cost(self):
        """قیمت تمام شده (قیمت خرید + هزینه عملیات)"""
        base_price = self.owner_declared_price if self.is_consignment else self.purchase_price
        return base_price + self.total_operations_cost

class CarpetOperation(Base):
    __tablename__ = "carpet_operations"
    
    id = Column(Integer, primary_key=True, index=True)
    carpet_id = Column(Integer, ForeignKey("carpets.id"), nullable=False)
    operation_name = Column(String(200), nullable=False, comment="نام عملیات")
    price = Column(Float, nullable=False, comment="قیمت عملیات")
    description = Column(Text, nullable=True, comment="توضیحات")
    operation_date = Column(DateTime, default=datetime.utcnow, comment="تاریخ عملیات")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    carpet = relationship("Carpet", back_populates="operations")    