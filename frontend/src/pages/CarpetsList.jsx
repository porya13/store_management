import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import CarpetCard from "../components/CarpetCard";

export default function CarpetsList() {
  const navigate = useNavigate();
  const [carpets, setCarpets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    size: "",
    material: "",
    available_only: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  const carpetSizes = [
    "کوچیک", "پشتی", "زرچارک", "زرنیم", "قالیچه",
    "پرده‌ای", "شش متری", "نه متری", "12 متری", "بزرگ‌تر"
  ];

  useEffect(() => {
    fetchCarpets();
  }, [filters]);

  const fetchCarpets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.size) params.append("size", filters.size);
      if (filters.material) params.append("material", filters.material);
      if (filters.available_only) params.append("available_only", "true");

      const response = await api.get(`carpets?${params.toString()}`);
      setCarpets(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || "خطا در دریافت لیست فرش‌ها");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("آیا از حذف این فرش مطمئن هستید؟")) return;
    try {
      await api.delete(`carpets/${id}`);
      fetchCarpets();
      alert("فرش با موفقیت حذف شد");
    } catch (err) {
      alert(err.response?.data?.detail || "خطا در حذف فرش");
    }
  };

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.size) params.append("size", filters.size);
      if (filters.material) params.append("material", filters.material);
      if (filters.search) params.append("search", filters.search);
      if (filters.available_only) params.append("available_only", "true");

      const response = await api.get(`carpets/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `carpets_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("خطا در دریافت PDF");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      size: "",
      material: "",
      available_only: false,
    });
  };

  if (loading && carpets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="lequied rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">مدیریت فرش‌ها</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                {carpets.length} فرش یافت شد
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExportPDF}
                className="btn-mobile bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Download size={20} />
                <span className="hidden sm:inline">خروجی PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
              <button
                onClick={() => navigate('/carpets/add')}
                className="btn-mobile bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">افزودن فرش جدید</span>
                <span className="sm:hidden">افزودن</span>
              </button>
            </div>
          </div>

          {/* Search and Filter Toggle */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <div className="flex-1 relative w-full">
              <Search className="absolute right-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="جستجو در نقشه، برند، توضیحات..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="form-input-mobile"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition w-full sm:w-auto justify-center ${
                showFilters ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter size={20} />
              فیلترها
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اندازه</label>
                  <select
                    value={filters.size}
                    onChange={(e) => handleFilterChange("size", e.target.value)}
                    className="form-input-mobile"
                  >
                    <option value="">همه اندازه‌ها</option>
                    {carpetSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">جنس</label>
                  <input
                    type="text"
                    placeholder="مثلاً: ابریشم، پشم..."
                    value={filters.material}
                    onChange={(e) => handleFilterChange("material", e.target.value)}
                    className="form-input-mobile"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-1 flex items-end">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 w-full">
                    <input
                      type="checkbox"
                      checked={filters.available_only}
                      onChange={(e) => handleFilterChange("available_only", e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 text-sm">فقط موجود در انبار</span>
                  </label>
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && carpets.length > 0 && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              در حال بروزرسانی...
            </div>
          </div>
        )}

        {/* Carpets Grid */}
        <div className="grid-mobile gap-4 md:gap-6">
          {carpets.map((carpet) => (
            <CarpetCard
              key={carpet.id}
              carpet={carpet}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Empty State */}
        {carpets.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">فرشی یافت نشد</h3>
            <p className="text-gray-500 mb-6">
              {Object.values(filters).some(f => f) 
                ? "با فیلترهای انتخابی فرشی یافت نشد" 
                : "هنوز فرشی اضافه نشده است"
              }
            </p>
            <button
              onClick={() => navigate('/carpets/add')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              افزودن اولین فرش
            </button>
          </div>
        )}

        {/* Results Count */}
        {carpets.length > 0 && (
          <div className="mt-6 text-center text-gray-600">
            تعداد: {carpets.length} فرش
          </div>
        )}
      </div>
    </div>
  );
}