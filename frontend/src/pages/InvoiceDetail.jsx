import React, { useState, useEffect } from "react";
import { ArrowRight, Download, Printer, Trash2, Package, Calendar, User, CreditCard, CheckCircle, DollarSign, AlertCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState(null);
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoice();
    fetchChecks();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await api.get(`invoices/${id}`);
      setInvoice(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setError(err.response?.data?.detail || "خطا در دریافت اطلاعات فاکتور");
    } finally {
      setLoading(false);
    }
  };

  const fetchChecks = async () => {
    try {
      // دریافت چک‌های مرتبط با این فاکتور
      const response = await api.get(`checks?invoice_id=${id}`);
      setChecks(response.data || []);
    } catch (err) {
      console.error("Error fetching checks:", err);
      setChecks([]);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("آیا از حذف این فاکتور مطمئن هستید؟")) return;

    try {
      await api.delete(`invoices/${id}`);
      alert("فاکتور با موفقیت حذف شد");
      navigate("/invoices");
    } catch (err) {
      alert(err.response?.data?.detail || "خطا در حذف فاکتور");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = () => {
    if (!invoice) return;

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      let yPos = 20;

      doc.setFontSize(16);
      doc.text("Invoice / Faktor", 105, yPos, { align: "center" });
      yPos += 10;

      doc.setFontSize(12);
      doc.text(`Invoice No: ${invoice.invoice_number}`, 20, yPos);
      doc.text(`Date: ${toJalali(invoice.invoice_date)}`, 150, yPos);
      yPos += 10;

      doc.text(`Customer: ${invoice.customer_name}`, 20, yPos);
      doc.text(`Payment: ${invoice.payment_method}`, 150, yPos);
      yPos += 10;

      const tableData = (invoice.items || []).map((item, idx) => [
        idx + 1,
        item.title || "-",
        item.size || "-",
        item.brand || "-",
        item.quantity || 0,
        (item.unit_price || 0).toLocaleString(),
        (item.total_price || 0).toLocaleString(),
      ]);

      doc.autoTable({
        startY: yPos,
        head: [["#", "Title", "Size", "Brand", "Qty", "Price", "Total"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(14);
      doc.text(`Total: ${(invoice.total_amount || 0).toLocaleString()} Toman`, 150, yPos);

      // اضافه کردن اطلاعات چک‌ها
      if (checks.length > 0) {
        yPos += 15;
        doc.setFontSize(12);
        doc.text("Checks:", 20, yPos);
        yPos += 7;
        doc.setFontSize(10);
        checks.forEach((check, idx) => {
          doc.text(
            `${idx + 1}. No: ${check.check_number} - Amount: ${check.amount.toLocaleString()} - Date: ${toJalali(check.check_date)} - Status: ${getCheckStatusLabel(check.status)}`,
            25,
            yPos
          );
          yPos += 5;
        });
      }

      doc.save(`invoice_${invoice.invoice_number}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("خطا در تولید PDF");
    }
  };

  const toJalali = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fa-IR");
  };

  const getCheckStatusLabel = (status) => {
    const labels = {
      "NOT_REGISTERED": "ثبت نشده",
      "REGISTERED": "ثبت شده",
      "CONFIRMED": "تایید شده",
      "PASSED": "پاس شده",
      "BOUNCED": "برگشت خورده"
    };
    return labels[status] || status;
  };

  const getCheckStatusColor = (status) => {
    const colors = {
      "NOT_REGISTERED": "bg-gray-100 text-gray-700",
      "REGISTERED": "bg-blue-100 text-blue-700",
      "CONFIRMED": "bg-green-100 text-green-700",
      "PASSED": "bg-purple-100 text-purple-700",
      "BOUNCED": "bg-red-100 text-red-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  // محاسبه مبالغ پرداخت
  const totalChecksAmount = checks.reduce((sum, check) => sum + (check.amount || 0), 0);
  const cashAmount = (invoice?.total_amount || 0) - totalChecksAmount;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || "فاکتور یافت نشد"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[100px] p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 print:hidden">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/invoices")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowRight size={20} />
              <span className="font-medium">بازگشت به لیست</span>
            </button>

            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                <Printer size={18} />
                چاپ
              </button>
              <button
                onClick={generatePDF}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <Download size={18} />
                دانلود PDF
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <Trash2 size={18} />
                حذف
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">فاکتور فروش</h1>
              <p className="text-gray-600">
                <span className="font-medium">شماره فاکتور:</span> {invoice.invoice_number}
              </p>
              {invoice.is_signed && (
                <span className="inline-block mt-2 bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                  ✓ امضا شده
                </span>
              )}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar size={18} />
                <span className="font-medium">تاریخ:</span>
              </div>
              <p className="text-lg font-semibold">{toJalali(invoice.invoice_date)}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <User size={20} />
                <h3 className="font-semibold">اطلاعات خریدار</h3>
              </div>
              <p className="text-lg font-medium text-gray-800">{invoice.customer_name}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <CreditCard size={20} />
                <h3 className="font-semibold">نحوه پرداخت</h3>
              </div>
              <p className="text-lg font-medium text-gray-800">{invoice.payment_method}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={20} className="text-green-600" />
              <h3 className="text-xl font-semibold">جزئیات پرداخت</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* مبلغ کل */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 mb-1">مبلغ کل فاکتور</p>
                <p className="text-2xl font-bold text-green-700">
                  {(invoice.total_amount || 0).toLocaleString()}
                  <span className="text-sm mr-1">تومان</span>
                </p>
              </div>

              {/* پرداخت نقدی */}
              {(invoice.payment_method === "نقدی" || invoice.payment_method === "ترکیبی") && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 mb-1">پرداخت نقدی</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {cashAmount > 0 ? cashAmount.toLocaleString() : (invoice.total_amount || 0).toLocaleString()}
                    <span className="text-sm mr-1">تومان</span>
                  </p>
                </div>
              )}

              {/* مبلغ چک‌ها */}
              {(invoice.payment_method === "چک" || invoice.payment_method === "ترکیبی") && checks.length > 0 && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700 mb-1">جمع چک‌ها ({checks.length} چک)</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {totalChecksAmount.toLocaleString()}
                    <span className="text-sm mr-1">تومان</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Checks List */}
          {checks.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={20} className="text-orange-600" />
                <h3 className="text-xl font-semibold">لیست چک‌ها</h3>
              </div>

              <div className="space-y-3">
                {checks.map((check, index) => (
                  <div
                    key={check.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">شماره چک</p>
                          <p className="font-semibold text-gray-800">{check.check_number || "-"}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">مبلغ</p>
                          <p className="font-bold text-green-600">
                            {(check.amount || 0).toLocaleString()} تومان
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">تاریخ سررسید</p>
                          <p className="font-medium text-gray-700">{toJalali(check.check_date)}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 mb-1">وضعیت</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCheckStatusColor(check.status)}`}>
                            {getCheckStatusLabel(check.status)}
                          </span>
                        </div>
                      </div>

                      <div className="mr-4">
                        <span className="bg-gray-200 text-gray-700 text-sm font-bold px-3 py-2 rounded-full">
                          #{index + 1}
                        </span>
                      </div>
                    </div>

                    {check.payee && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">در وجه:</span> {check.payee}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Checks Message */}
          {(invoice.payment_method === "چک" || invoice.payment_method === "ترکیبی") && checks.length === 0 && (
            <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertCircle size={20} />
                <p className="font-medium">هیچ چکی برای این فاکتور ثبت نشده است</p>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Package size={20} className="text-gray-600" />
              <h3 className="text-xl font-semibold">اقلام فاکتور</h3>
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-right p-4 font-semibold text-gray-700">#</th>
                    <th className="text-right p-4 font-semibold text-gray-700">شرح کالا</th>
                    <th className="text-center p-4 font-semibold text-gray-700">اندازه</th>
                    <th className="text-center p-4 font-semibold text-gray-700">برند</th>
                    <th className="text-center p-4 font-semibold text-gray-700">تعداد</th>
                    <th className="text-left p-4 font-semibold text-gray-700">قیمت واحد</th>
                    <th className="text-left p-4 font-semibold text-gray-700">مبلغ کل</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || []).map((item, index) => (
                    <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="p-4 font-medium">{index + 1}</td>
                      <td className="p-4">{item.title}</td>
                      <td className="p-4 text-center">{item.size || "-"}</td>
                      <td className="p-4 text-center">{item.brand || "-"}</td>
                      <td className="p-4 text-center font-medium">{item.quantity}</td>
                      <td className="p-4 text-left">{(item.unit_price || 0).toLocaleString()}</td>
                      <td className="p-4 text-left font-semibold text-green-600">
                        {(item.total_price || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-1/2 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-300">
              <div className="flex justify-between items-center py-3">
                <span className="text-xl font-bold text-gray-800">جمع کل:</span>
                <span className="text-3xl font-bold text-green-600">
                  {(invoice.total_amount || 0).toLocaleString()}
                  <span className="text-lg mr-2">تومان</span>
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {invoice.description && (
            <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 font-medium mb-2">توضیحات:</p>
              <p className="text-gray-700">{invoice.description}</p>
            </div>
          )}

          {/* Signature Section */}
          <div className="grid grid-cols-2 gap-12 mt-16 pt-8 border-t-2 border-gray-300">
            <div className="text-center">
              <div className="mb-16">
                <p className="text-gray-600 font-medium">امضای فروشنده</p>
              </div>
              <div className="border-t-2 border-gray-400 pt-2">
                <p className="text-sm text-gray-500">نام و امضا</p>
              </div>
            </div>
            <div className="text-center">
              <div className="mb-16">
                <p className="text-gray-600 font-medium">امضای خریدار</p>
              </div>
              <div className="border-t-2 border-gray-400 pt-2">
                <p className="text-sm text-gray-500">نام و امضا</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}