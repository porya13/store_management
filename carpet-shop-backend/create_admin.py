"""
اسکریپت ایجاد یا ریست کردن ادمین
"""
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.utils.auth import get_password_hash

def create_admin():
    db = SessionLocal()
    
    try:
        # بررسی وجود ادمین
        admin = db.query(User).filter(User.username == "admin").first()
        
        if admin:
            print("⚠️  کاربر admin قبلاً وجود دارد")
            print("آیا می‌خواهید پسورد را ریست کنید؟ (y/n)")
            choice = input().lower()
            
            if choice == 'y':
                admin.hashed_password = get_password_hash("admin123")
                db.commit()
                print("✅ پسورد ادمین به admin123 تغییر کرد")
            else:
                print("❌ عملیات لغو شد")
        else:
            # ایجاد ادمین جدید
            admin = User(
                username="admin",
                email="admin@carpet-shop.com",
                full_name="مدیر سیستم",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("✅ ادمین با موفقیت ساخته شد:")
            print(f"   Username: admin")
            print(f"   Password: admin123")
    
    except Exception as e:
        print(f"❌ خطا: {e}")
        db.rollback()
    
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()