from celery import Celery
from app.config import settings
from app.database import SessionLocal
from app.services.check_service import CheckService

# ایجاد Celery app
celery_app = Celery(
    'carpet_shop',
    broker=settings.redis_url,
    backend=settings.redis_url
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Tehran',
    enable_utc=True,
)

@celery_app.task
def check_upcoming_checks():
    """بررسی چک‌های نزدیک به سررسید و ارسال نوتیفیکیشن"""
    db = SessionLocal()
    try:
        check_service = CheckService(db)
        checks = check_service.get_checks_needing_notification()
        
        notifications = []
        for check in checks:
            # اینجا می‌توانید نوتیفیکیشن را به روش‌های مختلف ارسال کنید:
            # - ایمیل
            # - SMS
            # - Webhook
            # - Push Notification
            
            notification_message = (
                f"یادآوری: چک شماره {check.check_number} "
                f"به مبلغ {check.amount:,} ریال "
                f"در تاریخ {check.check_date.strftime('%Y-%m-%d')} سررسید دارد."
            )
            
            notifications.append({
                'check_id': check.id,
                'check_number': check.check_number,
                'amount': check.amount,
                'check_date': check.check_date.isoformat(),
                'message': notification_message
            })
            
            # علامت‌گذاری به عنوان ارسال شده
            check_service.mark_notification_sent(check.id)
        
        return {
            'success': True,
            'notifications_sent': len(notifications),
            'notifications': notifications
        }
    
    finally:
        db.close()

# تنظیم Schedule برای اجرای خودکار
celery_app.conf.beat_schedule = {
    'check-upcoming-checks-daily': {
        'task': 'app.tasks.notification_tasks.check_upcoming_checks',
        'schedule': 86400.0,  # هر 24 ساعت
    },
}