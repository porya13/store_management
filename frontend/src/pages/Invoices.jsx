import React, { useState, useEffect } from "react";
import { FileText, Plus, Search, Filter, Eye, Download, Calendar, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append("customer_name", filters.search);
      if (filters.startDate) params.append("start_date", filters.startDate);
      if (filters.endDate) params.append("end_date", filters.endDate);

      const response = await api.get(`invoices?${params.toString()}`);
      setInvoices(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(err.response?.data?.detail || "خطا در دریافت لیست فاکتورها");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این فاکتور مطمئن هستید؟")) return;

    try {
      await api.delete(`invoices/${id}`);
      fetchInvoices();
      alert("فاکتور با موفقیت حذف شد");
    } catch (err) {
      alert(err.response?.data?.detail || "خطا در حذف فاکتور");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      startDate: "",
      endDate: "",
    });
  };

  const toJalali = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fa-IR");
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="mt-[100px] flex items-center justify-center ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[100px]   p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="lequied rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">فاکتورها</h1>
              <p className="text-gray-600 mt-1">
                {invoices.length} فاکتور یافت شد
              </p>
            </div>
            <Link
              to="/InvoiceForm"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <Plus size={20} />
              افزودن فاکتور
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="جستجو بر اساس نام خریدار..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${
                showFilters ? "bg-blue-50 border-blue-500 text-blue-600" : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter size={20} />
              فیلترها
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">از تاریخ</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">تا تاریخ</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                پاک کردن فیلترها
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Invoices List */}
        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">فاکتوری یافت نشد</h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.startDate || filters.endDate
                ? "با فیلترهای دیگری جستجو کنید"
                : "هنوز فاکتوری ایجاد نشده است"}
            </p>
            <Link
              to="/InvoiceForm"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              ایجاد اولین فاکتور
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 cursor-pointer border border-gray-100"
                onClick={() => navigate(`/invoices/${invoice.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800">
                        {invoice.invoice_number}
                      </h3>
                      {invoice.is_signed && (
                        <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                          امضا شده
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-medium text-gray-500">خریدار:</span>
                        <span className="font-semibold">{invoice.customer_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{toJalali(invoice.invoice_date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">پرداخت:</span>
                        <span className="font-medium text-blue-600">{invoice.payment_method}</span>
                      </div>
                    </div>

                    {invoice.description && (
                      <p className="text-sm text-gray-500 mt-3 line-clamp-2 bg-gray-50 p-2 rounded">
                        {invoice.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3 mr-6">
                    <div className="text-left">
                      <p className="text-xs text-gray-500 mb-1">مبلغ کل</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(invoice.total_amount || 0).toLocaleString()}
                        <span className="text-sm mr-1">تومان</span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/invoices/${invoice.id}`);
                        }}
                        className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                      >
                        <Eye size={16} />
                        جزئیات
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(invoice.id);
                        }}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}