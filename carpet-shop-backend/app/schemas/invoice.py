from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# InvoiceItem Schemas
class InvoiceItemBase(BaseModel):
    carpet_id: int
    title: str = Field(..., min_length=1, max_length=200)
    size: str = Field(..., min_length=1, max_length=50)
    brand: str = Field(..., min_length=1, max_length=100)
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)
    description: Optional[str] = None

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    size: Optional[str] = Field(None, min_length=1, max_length=50)
    brand: Optional[str] = Field(None, min_length=1, max_length=100)
    quantity: Optional[int] = Field(None, gt=0)
    unit_price: Optional[float] = Field(None, ge=0)
    description: Optional[str] = None

class InvoiceItemResponse(InvoiceItemBase):
    id: int
    invoice_id: int
    total_price: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Invoice Schemas
class InvoiceBase(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=200)
    payment_method: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]
    invoice_date: datetime = Field(default_factory=datetime.utcnow)

class InvoiceUpdate(BaseModel):
    customer_name: Optional[str] = Field(None, min_length=1, max_length=200)
    payment_method: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    is_signed: Optional[bool] = None

class InvoiceResponse(InvoiceBase):
    id: int
    invoice_number: str
    invoice_date: datetime
    total_amount: float
    signature_path: Optional[str]
    is_signed: bool
    created_at: datetime
    updated_at: datetime
    last_edited_at: datetime
    items: List[InvoiceItemResponse] = []

    class Config:
        from_attributes = True

class InvoiceListResponse(BaseModel):
    id: int
    invoice_number: str
    customer_name: str
    invoice_date: datetime
    total_amount: float
    is_signed: bool

    class Config:
        from_attributes = True