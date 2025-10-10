"""
PDF Service - با پشتیبانی از حالت بدون reportlab
"""

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

from typing import List
import tempfile
from datetime import datetime


class PDFService:
    def __init__(self):
        if not REPORTLAB_AVAILABLE:
            print("⚠️  PDFService: reportlab is not available")
    
    def generate_carpets_pdf(self, carpets: List) -> str:
        """ایجاد PDF از لیست فرش‌ها"""
        
        if not REPORTLAB_AVAILABLE:
            raise ImportError(
                "reportlab is not installed. "
                "Please install it with: pip install reportlab"
            )
        
        # ایجاد فایل موقت
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        pdf_path = temp_file.name
        temp_file.close()
        
        # ایجاد PDF
        doc = SimpleDocTemplate(pdf_path, pagesize=A4)
        elements = []
        
        # استایل‌ها
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=20,
            alignment=1  # center
        )
        
        # عنوان
        title = Paragraph(
            f"Carpet Inventory Report - {datetime.now().strftime('%Y-%m-%d')}", 
            title_style
        )
        elements.append(title)
        elements.append(Spacer(1, 0.5*cm))
        
        # داده‌های جدول
        data = [['Image', 'Pattern', 'Brand', 'Size', 'Material', 'Quantity']]
        
        for carpet in carpets:
            row = [
                '',  # برای عکس - در نسخه ساده بدون عکس
                carpet.pattern,
                carpet.brand,
                carpet.size.value if hasattr(carpet.size, 'value') else str(carpet.size),
                carpet.material,
                str(carpet.quantity)
            ]
            data.append(row)
        
        # ایجاد جدول
        table = Table(data, colWidths=[3*cm, 4*cm, 3*cm, 3*cm, 3*cm, 2*cm])
        
        # استایل جدول
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4CAF50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
        ]))
        
        elements.append(table)
        
        # ساخت PDF
        doc.build(elements)
        
        return pdf_path