from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.check import CheckStatus, CheckType

class CheckBase(BaseModel):
    check_number: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., ge=0)
    payee: str = Field(..., min_length=1, max_length=200)
    check_date: datetime
    check_type: CheckType
    description: Optional[str] = None

class CheckCreate(CheckBase):
    status: CheckStatus = CheckStatus.NOT_REGISTERED
    invoice_id: Optional[int] = None
    carpet_id: Optional[int] = None

class CheckUpdate(BaseModel):
    check_number: Optional[str] = Field(None, min_length=1, max_length=100)
    amount: Optional[float] = Field(None, ge=0)
    payee: Optional[str] = Field(None, min_length=1, max_length=200)
    check_date: Optional[datetime] = None
    status: Optional[CheckStatus] = None
    check_type: Optional[CheckType] = None
    description: Optional[str] = None

class CheckResponse(CheckBase):
    id: int
    status: CheckStatus
    invoice_id: Optional[int]
    carpet_id: Optional[int]
    notification_sent: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    last_edited_at: datetime

    class Config:
        from_attributes = True