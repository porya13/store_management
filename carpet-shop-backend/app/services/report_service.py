from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime
from typing import Optional, Dict, List
from app.models.invoice import Invoice, InvoiceItem
from app.models.check import Check, CheckType
from app.models.carpet import Carpet

class ReportService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_financial_report(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict:
        """گزارش مالی با بازه زمانی"""
        
        # فیلتر تاریخ برای فاکتورها
        invoice_query = self.db.query(Invoice)
        if start_date:
            invoice_query = invoice_query.filter(Invoice.invoice_date >= start_date)
        if end_date:
            invoice_query = invoice_query.filter(Invoice.invoice_date <= end_date)
        
        # محاسبه درآمد کل
        total_revenue = invoice_query.with_entities(
            func.sum(Invoice.total_amount)
        ).scalar() or 0
        
        # محاسبه تعداد فاکتورها
        total_invoices = invoice_query.count()
        
        # محاسبه تعداد فرش‌های فروخته شده
        item_query = self.db.query(InvoiceItem).join(Invoice)
        if start_date:
            item_query = item_query.filter(Invoice.invoice_date >= start_date)
        if end_date:
            item_query = item_query.filter(Invoice.invoice_date <= end_date)
        
        total_sold_carpets = item_query.with_entities(
            func.sum(InvoiceItem.quantity)
        ).scalar() or 0
        
        # محاسبه هزینه کل (قیمت خرید فرش‌های فروخته شده)
        sold_carpets_cost = 0
        for item in item_query.all():
            carpet = self.db.query(Carpet).filter(Carpet.id == item.carpet_id).first()
            if carpet:
                sold_carpets_cost += carpet.total_cost * item.quantity
        
        # محاسبه سود
        profit = total_revenue - sold_carpets_cost
        
        # گزارش چک‌ها
        check_query = self.db.query(Check)
        if start_date:
            check_query = check_query.filter(Check.check_date >= start_date)
        if end_date:
            check_query = check_query.filter(Check.check_date <= end_date)
        
        # چک‌های ورودی
        total_incoming_checks = check_query.filter(
            Check.check_type == CheckType.INCOMING
        ).with_entities(func.sum(Check.amount)).scalar() or 0
        
        # چک‌های خروجی
        total_outgoing_checks = check_query.filter(
            Check.check_type == CheckType.OUTGOING
        ).with_entities(func.sum(Check.amount)).scalar() or 0
        
        return {
            "total_revenue": float(total_revenue),
            "total_cost": float(sold_carpets_cost),
            "profit": float(profit),
            "total_invoices": total_invoices,
            "total_sold_carpets": int(total_sold_carpets),
            "total_incoming_checks": float(total_incoming_checks),
            "total_outgoing_checks": float(total_outgoing_checks),
            "net_check_balance": float(total_incoming_checks - total_outgoing_checks)
        }
    
    def get_inventory_report(self) -> Dict:
        """گزارش موجودی انبار"""
        
        # تعداد کل فرش‌ها
        total_carpets = self.db.query(func.sum(Carpet.quantity)).scalar() or 0
        
        # ارزش کل موجودی (قیمت تمام شده)
        carpets = self.db.query(Carpet).filter(Carpet.quantity > 0).all()
        total_inventory_value = sum(carpet.total_cost * carpet.quantity for carpet in carpets)
        
        # گروه‌بندی بر اساس اندازه
        by_size = self.db.query(
            Carpet.size,
            func.sum(Carpet.quantity).label('count')
        ).filter(Carpet.quantity > 0).group_by(Carpet.size).all()
        
        # گروه‌بندی بر اساس جنس
        by_material = self.db.query(
            Carpet.material,
            func.sum(Carpet.quantity).label('count')
        ).filter(Carpet.quantity > 0).group_by(Carpet.material).all()
        
        # فرش‌های امانتی
        consignment_count = self.db.query(func.sum(Carpet.quantity)).filter(
            Carpet.is_consignment == True,
            Carpet.quantity > 0
        ).scalar() or 0
        
        return {
            "total_carpets": int(total_carpets),
            "total_inventory_value": float(total_inventory_value),
            "by_size": [{"size": size, "count": int(count)} for size, count in by_size],
            "by_material": [{"material": material, "count": int(count)} for material, count in by_material],
            "consignment_count": int(consignment_count),
            "owned_count": int(total_carpets - consignment_count)
        }