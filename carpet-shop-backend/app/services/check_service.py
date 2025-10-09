from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.models.check import Check, CheckStatus, CheckType
from app.schemas.check import CheckCreate, CheckUpdate

class CheckService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_check(self, check_data: CheckCreate) -> Check:
        """ایجاد چک جدید"""
        check = Check(**check_data.model_dump())
        self.db.add(check)
        self.db.commit()
        self.db.refresh(check)
        return check
    
    def get_check(self, check_id: int) -> Optional[Check]:
        """دریافت یک چک"""
        return self.db.query(Check).filter(Check.id == check_id).first()
    
    def list_checks(
        self,
        skip: int = 0,
        limit: int = 100,
        check_type: Optional[CheckType] = None,
        status: Optional[CheckStatus] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Check]:
        """لیست چک‌ها با فیلتر"""
        query = self.db.query(Check)
        
        if check_type:
            query = query.filter(Check.check_type == check_type)
        
        if status:
            query = query.filter(Check.status == status)
        
        if start_date:
            query = query.filter(Check.check_date >= start_date)
        
        if end_date:
            query = query.filter(Check.check_date <= end_date)
        
        return query.order_by(Check.check_date).offset(skip).limit(limit).all()
    
    def get_upcoming_checks(self, days: int = 7) -> List[Check]:
        """دریافت چک‌های نزدیک به سررسید"""
        today = datetime.now()
        target_date = today + timedelta(days=days)
        
        return self.db.query(Check).filter(
            Check.check_date >= today,
            Check.check_date <= target_date,
            Check.status.in_([CheckStatus.REGISTERED, CheckStatus.CONFIRMED])
        ).order_by(Check.check_date).all()
    
    def update_check(self, check_id: int, check_update: CheckUpdate) -> Optional[Check]:
        """ویرایش چک"""
        check = self.get_check(check_id)
        if not check:
            return None
        
        update_data = check_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(check, field, value)
        
        check.last_edited_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(check)
        return check
    
    def delete_check(self, check_id: int) -> bool:
        """حذف چک"""
        check = self.get_check(check_id)
        if not check:
            return False
        
        self.db.delete(check)
        self.db.commit()
        return True
    
    def get_checks_needing_notification(self) -> List[Check]:
        """دریافت چک‌هایی که نیاز به نوتیفیکیشن دارند (2 روز قبل)"""
        today = datetime.now()
        notification_date = today + timedelta(days=2)
        
        return self.db.query(Check).filter(
            Check.check_date.between(
                notification_date,
                notification_date + timedelta(days=1)
            ),
            Check.notification_sent.is_(None),
            Check.status.in_([CheckStatus.REGISTERED, CheckStatus.CONFIRMED])
        ).all()
    
    def mark_notification_sent(self, check_id: int) -> bool:
        """علامت‌گذاری چک به عنوان نوتیفیکیشن ارسال شده"""
        check = self.get_check(check_id)
        if not check:
            return False
        
        check.notification_sent = datetime.utcnow()
        self.db.commit()
        return True