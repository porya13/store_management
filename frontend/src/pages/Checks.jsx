import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Checks() {
  const navigate = useNavigate();
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCheck, setEditingCheck] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    checkType: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const checkStatuses = [
    { value: "ثبت نشده", label: "ثبت نشده", color: "bg-gray-100 text-gray-700" },
    { value: "ثبت شده", label: "ثبت شده", color: "bg-blue-100 text-blue-700" },
    { value: "تایید شده", label: "تایید شده", color: "bg-green-100 text-green-700" },
    { value: "پاس شده", label: "پاس شده", color: "bg-purple-100 text-purple-700" },
    { value: "برگشت خورده", label: "برگشت خورده", color: "bg-red-100 text-red-700" },
  ];

  useEffect(() => {
    fetchChecks();
  }, [filters]);

  const fetchChecks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.checkType) params.append("check_type", filters.checkType);
      if (filters.status) params.append("status", filters.status);
      if (filters.startDate) params.append("start_date", filters.startDate);
      if (filters.endDate) params.append("end_date", filters.endDate);

      const response = await api.get(`checks?${params.toString()}`);
      let allChecks = response.data || [];

      if (filters.search) {
        allChecks = allChecks.filter(
          (check) =>
            check.check_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
            check.payee?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setChecks(allChecks);
      setError(null);
    } catch (err) {
      console.error("Error fetching checks:", err);
      setError(err.response?.data?.detail || "خطا در دریافت لیست چک‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این چک مطمئن هستید؟")) return;
    try {
      await api.delete(`checks/${id}`);
      fetchChecks();
      alert("چک با موفقیت حذف شد");
    } catch (err) {
      alert(err.response?.data?.detail || "خطا در حذف چک");
    }
  };

  const handleStatusChange = async (checkId, newStatus) => {
    try {
      await api.put(`checks/${checkId}`, { status: newStatus });
      fetchChecks();
    } catch (err) {
      alert(err.response?.data?.detail || "خطا در تغییر وضعیت");
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      checkType: "",
      status: "",
      startDate: "",
      endDate: "",
    });
  };

  const toJalali = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fa-IR");
  };

  const getStatusColor = (status) => {
    const statusObj = checkStatuses.find((s) => s.value === status);
    return statusObj?.color || "bg-gray-100 text-gray-700";
  };

  const getUpcomingDays = (checkDate) => {
    const today = new Date();
    const date = new Date(checkDate);
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading && checks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[100px] p-4 sm:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">مدیریت چک‌ها</h1>
              <p className="text-gray-600 mt-1">{checks.length} چک یافت شد</p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <Plus size={20} />
              افزودن چک
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute right-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="جستجو شماره چک یا در وجه..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition w-full sm:w-auto justify-center ${
                showFilters
                  ? "bg-blue-50 border-blue-500 text-blue-600"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter size={20} />
              فیلترها
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <FilterSelect
                  label="نوع چک"
                  value={filters.checkType}
                  onChange={(e) =>
                    setFilters({ ...filters, checkType: e.target.value })
                  }
                  options={[
                    { value: "", label: "همه" },
                    { value: "ورودی", label: "ورودی" },
                    { value: "خروجی", label: "خروجی" },
                  ]}
                />

                <FilterSelect
                  label="وضعیت"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  options={[
                    { value: "", label: "همه" },
                    ...checkStatuses.map((s) => ({
                      value: s.value,
                      label: s.label,
                    })),
                  ]}
                />

                <FilterInput
                  label="از تاریخ"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                />

                <FilterInput
                  label="تا تاریخ"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                />
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

        {/* Checks List */}
        {checks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CreditCard size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              چکی یافت نشد
            </h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.checkType || filters.status
                ? "با فیلترهای دیگری جستجو کنید"
                : "هنوز چکی ثبت نشده است"}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              افزودن اولین چک
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {checks.map((check) => {
              const daysUntilDue = getUpcomingDays(check.check_date);
              const isUpcoming = daysUntilDue >= 0 && daysUntilDue <= 7;

              return (
                <div
                  key={check.id}
                  className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4 sm:p-6 border flex flex-col gap-3 ${
                    isUpcoming ? "border-orange-300 bg-orange-50" : "border-gray-100"
                  }`}
                >
                  {/* Top Section */}
                  <div className="flex flex-wrap justify-between gap-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                        {check.check_number || "بدون شماره"}
                      </h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          check.check_type === "ورودی"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {check.check_type}
                      </span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                          check.status
                        )}`}
                      >
                        {check.status}
                      </span>
                      {isUpcoming && (
                        <span className="flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium">
                          <Bell size={14} />
                          {daysUntilDue === 0
                            ? "امروز"
                            : `${daysUntilDue} روز دیگر`}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                      <select
                        value={check.status}
                        onChange={(e) =>
                          handleStatusChange(check.id, e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        {checkStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingCheck(check)}
                          className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm"
                        >
                          <Edit size={16} />
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleDelete(check.id)}
                          className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">در وجه:</span>
                      <span className="font-medium text-gray-800 mr-2">
                        {check.payee}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-gray-700">
                        {toJalali(check.check_date)}
                      </span>
                      {daysUntilDue >= 0 && (
                        <span className="text-xs text-gray-500">
                          ({daysUntilDue} روز)
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-gray-500">مبلغ:</span>
                      <span className="font-bold text-green-600 mr-2">
                        {(check.amount || 0).toLocaleString()} تومان
                      </span>
                    </div>

                    {check.invoice_id && (
                      <div>
                        <span className="text-gray-500">فاکتور:</span>
                        <span className="text-blue-600 mr-2">
                          #{check.invoice_id}
                        </span>
                      </div>
                    )}
                  </div>

                  {check.description && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                      {check.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(showAddModal || editingCheck) && (
        <CheckModal
          check={editingCheck}
          onClose={() => {
            setShowAddModal(false);
            setEditingCheck(null);
          }}
          onSave={() => {
            setShowAddModal(false);
            setEditingCheck(null);
            fetchChecks();
          }}
        />
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
    </div>
  );
}

/* --- Modal --- */
function CheckModal({ check, onClose, onSave }) {
  const [formData, setFormData] = useState({
    check_number: check?.check_number || "",
    amount: check?.amount || 0,
    payee: check?.payee || "",
    check_date: check?.check_date
      ? check.check_date.split("T")[0]
      : new Date().toISOString().split("T")[0],
    check_type: check?.check_type || "ورودی",
    description: check?.description || "",
    invoice_id: check?.invoice_id || null,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        invoice_id: formData.invoice_id || null,
      };

      if (check) await api.put(`checks/${check.id}`, payload);
      else await api.post("checks/", payload);

      alert(check ? "چک بروزرسانی شد" : "چک اضافه شد");
      onSave();
    } catch (err) {
      alert(err.response?.data?.detail || "خطا در ذخیره چک");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" dir="rtl">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{check ? "ویرایش چک" : "افزودن چک جدید"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="شماره چک *" value={formData.check_number} onChange={(e) => setFormData({ ...formData, check_number: e.target.value })} required />
            <FormInput label="مبلغ (تومان) *" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
            <FormInput label="در وجه *" value={formData.payee} onChange={(e) => setFormData({ ...formData, payee: e.target.value })} required />
            <FormInput label="تاریخ سررسید *" type="date" value={formData.check_date} onChange={(e) => setFormData({ ...formData, check_date: e.target.value })} required />
            <FormSelect label="نوع چک *" value={formData.check_type} onChange={(e) => setFormData({ ...formData, check_type: e.target.value })} options={["ورودی", "خروجی"]} />
            <FormInput label="شماره فاکتور (اختیاری)" type="number" value={formData.invoice_id || ""} onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value ? Number(e.target.value) : null })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">توضیحات</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {loading ? "در حال ذخیره..." : check ? "بروزرسانی" : "افزودن"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input {...props} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <select value={value} onChange={onChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
