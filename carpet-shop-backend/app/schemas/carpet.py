from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List
from app.models.carpet import CarpetSize, PaymentMethod

# CarpetOperation Schemas
class CarpetOperationBase(BaseModel):
    operation_name: str = Field(..., min_length=1, max_length=200)
    price: float = Field(..., ge=0)
    description: Optional[str] = None
    operation_date: datetime = Field(default_factory=datetime.utcnow)

class CarpetOperationCreate(CarpetOperationBase):
    pass

class CarpetOperationUpdate(BaseModel):
    operation_name: Optional[str] = Field(None, min_length=1, max_length=200)
    price: Optional[float] = Field(None, ge=0)
    description: Optional[str] = None
    operation_date: Optional[datetime] = None

class CarpetOperationResponse(CarpetOperationBase):
    id: int
    carpet_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Carpet Schemas
class CarpetBase(BaseModel):
    pattern: str = Field(..., min_length=1, max_length=200)
    brand: str = Field(..., min_length=1, max_length=100)
    material: str = Field(..., min_length=1, max_length=100)
    size: CarpetSize
    quantity: int = Field(default=1, ge=0)
    description: Optional[str] = None
    has_pair: bool = False
    payment_method: PaymentMethod

class CarpetCreate(CarpetBase):
    purchase_price: float = Field(..., ge=0)
    sale_price: Optional[float] = Field(None, ge=0)
    purchase_date: datetime = Field(default_factory=datetime.utcnow)
    seller_name: Optional[str] = None
    is_consignment: bool = False
    consignment_owner: Optional[str] = None
    owner_declared_price: Optional[float] = Field(None, ge=0)
    consignment_date: Optional[datetime] = None

    @field_validator('consignment_owner', 'owner_declared_price', 'consignment_date')
    def validate_consignment_fields(cls, v, info):
        if info.data.get('is_consignment') and v is None:
            raise ValueError(f"{info.field_name} is required when is_consignment is True")
        return v

class CarpetUpdate(BaseModel):
    pattern: Optional[str] = Field(None, min_length=1, max_length=200)
    brand: Optional[str] = Field(None, min_length=1, max_length=100)
    material: Optional[str] = Field(None, min_length=1, max_length=100)
    size: Optional[CarpetSize] = None
    quantity: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    purchase_price: Optional[float] = Field(None, ge=0)
    sale_price: Optional[float] = Field(None, ge=0)
    seller_name: Optional[str] = None
    has_pair: Optional[bool] = None
    payment_method: Optional[PaymentMethod] = None
    is_consignment: Optional[bool] = None
    consignment_owner: Optional[str] = None
    owner_declared_price: Optional[float] = Field(None, ge=0)

class CarpetResponse(CarpetBase):
    id: int
    purchase_price: float
    sale_price: Optional[float]
    purchase_date: datetime
    image_path: Optional[str]
    seller_name: Optional[str]
    is_consignment: bool
    consignment_owner: Optional[str]
    owner_declared_price: Optional[float]
    consignment_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    last_edited_at: datetime
    operations: List[CarpetOperationResponse] = []
    total_operations_cost: float
    total_cost: float

    class Config:
        from_attributes = True

class CarpetListResponse(BaseModel):
    id: int
    pattern: str
    brand: str
    material: str
    size: CarpetSize
    quantity: int
    sale_price: Optional[float]
    image_path: Optional[str]
    is_consignment: bool

    class Config:
        from_attributes = True