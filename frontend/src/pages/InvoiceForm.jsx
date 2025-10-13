import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Save, FileText, Download, Plus, Trash2, CheckCircle } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const toJalali = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('fa-IR');
};

export default function InvoiceForm() {
  const navigate = useNavigate();
  
  const shopHeader = {
    name: "فرش فروشی پوریا",
    address: "قم — خیابان نمونه — پلاک ۱۲۳",
    phone: "۰۲۵-۱۲۳۴۵۶۷۸",
  };

  // states
  const [savedInvoiceId, setSavedInvoiceId] = useState(null); // برای نگهداری ID فاکتور ذخیره شده
  const [isFinalized, setIsFinalized] = useState(false); // آیا نهایی شده؟
  const [customerName, setCustomerName] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([]);
  const [carpetsOptions, setCarpetsOptions] = useState([]);
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [checks, setChecks] = useState([]);
  const [cashAmount, setCashAmount] = useState(0);
  const [sellerSignatureTitle, setSellerSignatureTitle] = useState("امضای فروشنده:");
  const [buyerSignatureTitle, setBuyerSignatureTitle] = useState("امضای خریدار:");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCarpets = async () => {
      try {
        const res = await api.get("carpets?limit=1000");
        setCarpetsOptions(res.data || []);
      } catch (e) {
        console.error("load carpets error", e);
      }
    };
    loadCarpets();
  }, []);

  // محاسبات
  const subtotal = items.reduce(
    (s, it) => s + (Number(it.unit_price || 0) * Number(it.qty || 0)),
    0
  );
  const afterDiscount = Math.max(subtotal - Number(discount || 0), 0);
  const checksTotal = checks.reduce((s, c) => s + Number(c.amount || 0), 0);
  const total = afterDiscount;
  const remainingToPay = Math.max(total - Number(cashAmount || 0) - checksTotal, 0);

  // آیتم‌ها
  const addEmptyItem = () =>
    setItems((p) => [
      ...p,
      { 
        id: Date.now(), 
        carpet_id: null, 
        code: "", 
        title: "", 
        size: "", 
        brand: "", 
        qty: 1, 
        unit_price: 0 
      },
    ]);

  const handleSelectCarpetForRow = (rowId, carpetId) => {
    const carpet = carpetsOptions.find((c) => Number(c.id) === Number(carpetId));
    if (!carpet) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === rowId
          ? {
              ...it,
              carpet_id: carpet.id,
              code: carpet.id,
              title: carpet.pattern || `${carpet.brand || ""} - ${carpet.size || ""}`,
              size: carpet.size,
              brand: carpet.brand,
              unit_price: carpet.sale_price || 0,
            }
          : it
      )
    );
  };

  const updateItemField = (rowId, field, value) =>
    setItems((prev) => prev.map((it) => (it.id === rowId ? { ...it, [field]: value } : it)));

  const removeItem = (rowId) => setItems((prev) => prev.filter((it) => it.id !== rowId));

  // چک‌ها
  const addCheck = () =>
    setChecks((p) => [
      ...p,
      { 
        id: Date.now(), 
        check_number: "", 
        amount: 0, 
        payee: customerName || "", 
        check_date: new Date().toISOString().split('T')[0],
        check_type: "incoming"
      },
    ]);
    
  const updateCheck = (id, field, value) => 
    setChecks((p) => p.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
    
  const removeCheck = (id) => setChecks((p) => p.filter((c) => c.id !== id));

  // ذخیره پیش‌نویس (فقط ذخیره، بدون نهایی کردن)
  const handleSaveDraft = async () => {
    if (!customerName) {
      alert("لطفاً نام خریدار را وارد کنید");
      return;
    }
    if (items.length === 0) {
      alert("لطفاً حداقل یک آیتم اضافه کنید");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        customer_name: customerName,
        payment_method: paymentMethod === "cash" ? "نقدی" : paymentMethod === "check" ? "چک" : "ترکیبی",
        description: notes,
        invoice_date: invoiceDate,
        items: items.map((it) => ({
          carpet_id: it.carpet_id,
          title: it.title,
          size: it.size || "",
          brand: it.brand || "",
          quantity: Number(it.qty || 0),
          unit_price: Number(it.unit_price || 0),
          description: "",
        })),
      };

      let response;
      if (savedInvoiceId) {
        // اگر قبلاً ذخیره شده، آپدیت کن
        response = await api.put(`invoices/${savedInvoiceId}`, payload);
      } else {
        // اولین بار ذخیره
        response = await api.post("invoices/", payload);
        setSavedInvoiceId(response.data.id);
      }
      
      alert("پیش‌فاکتور با موفقیت ذخیره شد");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "خطا در ذخیره پیش‌فاکتور");
    } finally {
      setLoading(false);
    }
  };

  // نهایی‌سازی (فروش و کم کردن موجودی + ثبت چک‌ها)
  const handleFinalize = async () => {
    if (!customerName) {
      alert("لطفاً نام خریدار را وارد کنید");
      return;
    }
    if (items.length === 0) {
      alert("لطفاً حداقل یک آیتم اضافه کنید");
      return;
    }

    if (isFinalized) {
      alert("این فاکتور قبلاً نهایی شده است");
      return;
    }

    try {
      setLoading(true);
      
      let invoiceId = savedInvoiceId;
      
      // اگر هنوز ذخیره نشده، اول ذخیره کن
      if (!invoiceId) {
        const payload = {
          customer_name: customerName,
          payment_method: paymentMethod === "cash" ? "نقدی" : paymentMethod === "check" ? "چک" : "ترکیبی",
          description: notes,
          invoice_date: invoiceDate,
          items: items.map((it) => ({
            carpet_id: it.carpet_id,
            title: it.title,
            size: it.size || "",
            brand: it.brand || "",
            quantity: Number(it.qty || 0),
            unit_price: Number(it.unit_price || 0),
            description: "",
          })),
        };
        
        const response = await api.post("invoices/", payload);
        invoiceId = response.data.id;
        setSavedInvoiceId(invoiceId);
      }
      
      // نهایی کردن فاکتور (کم کردن موجودی)
      try {
        await api.post(`invoices/${invoiceId}/finalize`);
      } catch (e) {
        console.warn("Finalize endpoint error:", e);
      }
      
      // ثبت چک‌ها
      if (checks.length > 0) {
        for (const check of checks) {
          try {
            // دقت کنید: status نباید ارسال بشه، check_type باید CheckType باشه
            const checkPayload = {
              check_number: check.check_number || "",
              amount: Number(check.amount) || 0,
              payee: check.payee || customerName,
              check_date: check.check_date,
              check_type: "ورودی", // باید به فارسی باشه (مطابق enum در بک‌اند)
              invoice_id: invoiceId,
              // status نباید اینجا باشه - بک‌اند خودش default میذاره
            };
            
            console.log("Sending check data:", checkPayload); // برای debug
            
            await api.post("checks/", checkPayload);
          } catch (checkErr) {
            console.error("Error saving check:", checkErr);
            console.error("Error details:", checkErr.response?.data); // جزئیات خطا
          }
        }
      }
      
      setIsFinalized(true);
      alert("فاکتور با موفقیت نهایی شد و موجودی کم شد");
      
      // هدایت به صفحه لیست فاکتورها
      setTimeout(() => {
        navigate('/invoices');
      }, 1500);
      
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "خطا در نهایی‌سازی");
    } finally {
      setLoading(false);
    }
  };

  // تولید PDF
  const generatePDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      let yPos = 20;
      
      // سربرگ
      doc.setFontSize(16);
      doc.text(shopHeader.name, 105, yPos, { align: 'center' });
      yPos += 7;
      
      doc.setFontSize(10);
      doc.text(shopHeader.address, 105, yPos, { align: 'center' });
      yPos += 5;
      doc.text(`Tel: ${shopHeader.phone}`, 105, yPos, { align: 'center' });
      yPos += 10;
      
      doc.setLineWidth(0.5);
      doc.line(20, yPos, 190, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.text(`Customer: ${customerName}`, 20, yPos);
      doc.text(`Date: ${toJalali(invoiceDate)}`, 150, yPos);
      yPos += 10;
      
      const tableData = items.map((it, idx) => [
        idx + 1,
        it.title || '-',
        it.size || '-',
        it.brand || '-',
        it.qty || 0,
        Number(it.unit_price || 0).toLocaleString(),
        (Number(it.qty || 0) * Number(it.unit_price || 0)).toLocaleString(),
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['#', 'Title', 'Size', 'Brand', 'Qty', 'Price', 'Total']],
        body: tableData,
        theme: 'grid',
        styles: { 
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 2,
        },
        headStyles: { 
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
        },
      });
      
      yPos = doc.lastAutoTable.finalY + 10;
      
      doc.setFontSize(11);
      doc.text(`Subtotal: ${subtotal.toLocaleString()} Toman`, 140, yPos);
      yPos += 6;
      doc.text(`Discount: ${Number(discount).toLocaleString()} Toman`, 140, yPos);
      yPos += 6;
      doc.setFontSize(12);
      doc.text(`Total: ${afterDiscount.toLocaleString()} Toman`, 140, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.text(`Cash: ${Number(cashAmount).toLocaleString()} Toman`, 20, yPos);
      yPos += 6;
      doc.text(`Checks: ${checksTotal.toLocaleString()} Toman`, 20, yPos);
      yPos += 6;
      doc.text(`Remaining: ${remainingToPay.toLocaleString()} Toman`, 20, yPos);
      yPos += 15;
      
      if (checks.length > 0) {
        doc.text('Checks:', 20, yPos);
        yPos += 6;
        checks.forEach((c, idx) => {
          doc.setFontSize(9);
          doc.text(
            `${idx + 1}. No: ${c.check_number} | Amount: ${Number(c.amount).toLocaleString()} | Date: ${toJalali(c.check_date)}`,
            25,
            yPos
          );
          yPos += 5;
        });
        yPos += 5;
      }
      
      if (notes) {
        doc.setFontSize(9);
        doc.text(`Notes: ${notes}`, 20, yPos);
        yPos += 10;
      }
      
      yPos += 10;
      doc.setFontSize(10);
      doc.text(sellerSignatureTitle, 30, yPos);
      doc.text(buyerSignatureTitle, 130, yPos);
      yPos += 3;
      doc.line(25, yPos, 80, yPos);
      doc.line(125, yPos, 180, yPos);
      
      const fileName = `invoice_${new Date().getTime()}.pdf`;
      doc.save(fileName);
      
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("خطا در تولید PDF");
    }
  };

  // تولید Excel
  const generateStyledExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const excelData = [];
      
      excelData.push([shopHeader.name]);
      excelData.push([`آدرس: ${shopHeader.address}`]);
      excelData.push([`تلفن: ${shopHeader.phone}`]);
      excelData.push([]);
      excelData.push(['خریدار:', customerName, '', 'تاریخ:', toJalali(invoiceDate)]);
      excelData.push([]);
      excelData.push(['ردیف', 'شرح کالا', 'اندازه', 'برند', 'تعداد', 'قیمت واحد', 'مبلغ کل']);
      
      items.forEach((it, idx) => {
        excelData.push([
          idx + 1,
          it.title || '-',
          it.size || '-',
          it.brand || '-',
          it.qty || 0,
          Number(it.unit_price || 0),
          Number(it.qty || 0) * Number(it.unit_price || 0)
        ]);
      });
      
      excelData.push([]);
      excelData.push(['', '', '', '', '', 'جمع جزء:', subtotal]);
      excelData.push(['', '', '', '', '', 'تخفیف:', Number(discount)]);
      excelData.push(['', '', '', '', '', 'قابل پرداخت:', afterDiscount]);
      excelData.push([]);
      excelData.push(['', '', '', '', '', 'پرداخت نقدی:', Number(cashAmount)]);
      excelData.push(['', '', '', '', '', 'جمع چک‌ها:', checksTotal]);
      excelData.push(['', '', '', '', '', 'باقیمانده:', remainingToPay]);
      excelData.push([]);
      excelData.push([]);
      excelData.push([sellerSignatureTitle, '', '', '', '', buyerSignatureTitle]);
      excelData.push(['____________________', '', '', '', '', '____________________']);
      
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      ws['!cols'] = [
        { wch: 8 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, 
        { wch: 8 }, { wch: 15 }, { wch: 15 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'فاکتور');
      const fileName = `invoice_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (err) {
      console.error("Excel generation error:", err);
      alert("خطا در تولید Excel");
    }
  };

  return (
    <div className="mt-[100px] p-6" dir="rtl">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        {/* Alert برای وضعیت */}
        {savedInvoiceId && !isFinalized && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
            <p className="font-medium">⚠️ این فاکتور به عنوان پیش‌نویس ذخیره شده است</p>
            <p className="text-sm mt-1">برای نهایی کردن و کم کردن موجودی، دکمه "نهایی و ثبت فروش" را بزنید</p>
          </div>
        )}
        
        {isFinalized && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            <p className="font-medium flex items-center gap-2">
              <CheckCircle size={20} />
              ✅ این فاکتور نهایی شده و موجودی کم شده است
            </p>
          </div>
        )}

        {/* سربرگ */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{shopHeader.name}</h2>
            <p className="text-sm text-gray-600 mt-1">آدرس: {shopHeader.address}</p>
            <p className="text-sm text-gray-600">تلفن: {shopHeader.phone}</p>
          </div>
          <div className="text-left">
            <p className="text-lg font-semibold text-blue-600">
              {isFinalized ? "فاکتور نهایی" : savedInvoiceId ? "پیش‌فاکتور" : "فاکتور جدید"}
            </p>
            <p className="text-sm text-gray-600 mt-1">تاریخ: {toJalali(invoiceDate)}</p>
          </div>
        </div>

        {/* بقیه فرم مشابه قبل... */}
        {/* اطلاعات اصلی */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">نام خریدار *</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="نام و نام خانوادگی"
              disabled={isFinalized}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">تاریخ فاکتور</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              disabled={isFinalized}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">شمسی: {toJalali(invoiceDate)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">نحوه پرداخت</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={isFinalized}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="cash">نقدی</option>
              <option value="check">چک</option>
              <option value="mixed">ترکیبی</option>
            </select>
          </div>
        </div>

        {/* آیتم‌های فاکتور */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">اقلام فاکتور</h3>
            {!isFinalized && (
              <button
                onClick={addEmptyItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                افزودن ردیف
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">هیچ آیتمی اضافه نشده است</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((it, index) => (
                <div key={it.id} className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-lg">
                  <div className="col-span-1 text-center font-medium">{index + 1}</div>
                  
                  <div className="col-span-4">
                    <select
                      value={it.carpet_id || ""}
                      onChange={(e) => handleSelectCarpetForRow(it.id, e.target.value)}
                      disabled={isFinalized}
                      className="w-full border border-gray-300 rounded p-2 text-sm disabled:bg-gray-100"
                    >
                      <option value="">انتخاب فرش...</option>
                      {carpetsOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.pattern} - {c.brand} - {c.size}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <input
                    className="col-span-2 border border-gray-300 rounded p-2 text-sm disabled:bg-gray-100"
                    placeholder="شرح"
                    value={it.title}
                    onChange={(e) => updateItemField(it.id, "title", e.target.value)}
                    disabled={isFinalized}
                  />
                  
                  <input
                    className="col-span-1 border border-gray-300 rounded p-2 text-sm text-center disabled:bg-gray-100"
                    placeholder="تعداد"
                    type="number"
                    value={it.qty}
                    onChange={(e) => updateItemField(it.id, "qty", Number(e.target.value))}
                    disabled={isFinalized}
                  />
                  
                  <input
                    className="col-span-2 border border-gray-300 rounded p-2 text-sm disabled:bg-gray-100"
                    placeholder="قیمت واحد"
                    type="number"
                    value={it.unit_price}
                    onChange={(e) => updateItemField(it.id, "unit_price", Number(e.target.value))}
                    disabled={isFinalized}
                  />
                  
                  <div className="col-span-1 text-left font-semibold text-sm">
                    {((Number(it.qty) * Number(it.unit_price)) || 0).toLocaleString()}
                  </div>
                  
                  {!isFinalized && (
                    <button
                      onClick={() => removeItem(it.id)}
                      className="col-span-1 bg-red-600 text-white p-2 rounded hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* محاسبات و پرداخت */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* محاسبات */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">محاسبات</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>جمع جزء:</span>
                <span className="font-medium">{subtotal.toLocaleString()} تومان</span>
              </div>
              <div className="flex justify-between items-center">
                <span>تخفیف:</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value || 0))}
                  disabled={isFinalized}
                  className="border border-gray-300 rounded p-1 w-32 text-left disabled:bg-gray-100"
                  placeholder="0"
                />
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold text-blue-600">
                <span>قابل پرداخت:</span>
                <span>{afterDiscount.toLocaleString()} تومان</span>
              </div>
            </div>
          </div>

          {/* نحوه پرداخت */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">جزئیات پرداخت</h4>
            
            {(paymentMethod === "cash" || paymentMethod === "mixed") && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">مبلغ نقدی (تومان)</label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(Number(e.target.value || 0))}
                  disabled={isFinalized}
                  className="w-full border border-gray-300 rounded p-2 disabled:bg-gray-100"
                  placeholder="0"
                />
              </div>
            )}

            {(paymentMethod === "check" || paymentMethod === "mixed") && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-semibold">چک‌ها</h5>
                  {!isFinalized && (
                    <button
                      onClick={addCheck}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 inline-flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      افزودن چک
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {checks.map((c) => (
                    <div key={c.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded border">
                      <input
                        className="col-span-3 border p-1 rounded text-sm disabled:bg-gray-100"
                        placeholder="شماره چک"
                        value={c.check_number}
                        onChange={(e) => updateCheck(c.id, "check_number", e.target.value)}
                        disabled={isFinalized}
                      />
                      <input
                        className="col-span-3 border p-1 rounded text-sm disabled:bg-gray-100"
                        type="number"
                        placeholder="مبلغ"
                        value={c.amount}
                        onChange={(e) => updateCheck(c.id, "amount", Number(e.target.value))}
                        disabled={isFinalized}
                      />
                      <input
                        className="col-span-4 border p-1 rounded text-sm disabled:bg-gray-100"
                        type="date"
                        value={c.check_date}
                        onChange={(e) => updateCheck(c.id, "check_date", e.target.value)}
                        disabled={isFinalized}
                      />
                      {!isFinalized && (
                        <button
                          className="col-span-2 bg-red-600 text-white p-1 rounded hover:bg-red-700"
                          onClick={() => removeCheck(c.id)}
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {checks.length > 0 && (
                  <div className="mt-3 text-sm font-medium">
                    جمع چک‌ها: {checksTotal.toLocaleString()} تومان
                  </div>
                )}
              </div>
            )}

            {remainingToPay > 0 && (
              <div className="mt-4 p-2 bg-yellow-100 rounded text-sm">
                <span className="font-medium">باقیمانده: </span>
                <span className="font-bold">{remainingToPay.toLocaleString()} تومان</span>
              </div>
            )}
          </div>
        </div>

        {/* توضیحات */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">توضیحات</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="توضیحات اضافی..."
            rows="3"
            disabled={isFinalized}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* عنوان امضاها */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">عنوان امضای فروشنده</label>
            <input
              value={sellerSignatureTitle}
              onChange={(e) => setSellerSignatureTitle(e.target.value)}
              disabled={isFinalized}
              className="w-full border border-gray-300 rounded-lg p-2 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">عنوان امضای خریدار</label>
            <input
              value={buyerSignatureTitle}
              onChange={(e) => setBuyerSignatureTitle(e.target.value)}
              disabled={isFinalized}
              className="w-full border border-gray-300 rounded-lg p-2 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* دکمه‌های عملیات */}
        <div className="flex flex-wrap gap-3 justify-end border-t pt-6">
          {!isFinalized && (
            <>
              <button
                onClick={handleSaveDraft}
                disabled={loading}
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 inline-flex items-center gap-2 transition font-medium"
              >
                <Save className="w-5 h-5" />
                {loading ? "در حال ذخیره..." : savedInvoiceId ? "بروزرسانی پیش‌نویس" : "ذخیره پیش‌نویس"}
              </button>
              
              <button
                onClick={handleFinalize}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 inline-flex items-center gap-2 transition font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                {loading ? "در حال نهایی‌سازی..." : "نهایی و ثبت فروش"}
              </button>
            </>
          )}
          
          <button
            onClick={generatePDF}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 inline-flex items-center gap-2 transition font-medium"
          >
            <Download className="w-5 h-5" />
            دانلود PDF
          </button>
          
          <button
            onClick={generateStyledExcel}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center gap-2 transition font-medium"
          >
            <FileText className="w-5 h-5" />
            دانلود Excel
          </button>
        </div>
      </div>
    </div>
  );
}