import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Calendar,
  Download,
  RefreshCw,
  BarChart3
} from "lucide-react";
import api from "../api/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [financialReport, setFinancialReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [error, setError] = useState(null);
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });

  const periods = [
    { value: "daily", label: "روزانه", endpoint: "/reports/financial/daily" },
    { value: "weekly", label: "هفتگی", endpoint: "/reports/financial/weekly" },
    { value: "monthly", label: "ماهانه", endpoint: "/reports/financial/monthly" },
    { value: "quarterly", label: "سه‌ماهه", endpoint: "/reports/financial/quarterly" },
    { value: "semi-annual", label: "شش‌ماهه", endpoint: "/reports/financial/semi-annual" },
    { value: "annual", label: "سالانه", endpoint: "/reports/financial/annual" },
    { value: "custom", label: "سفارشی", endpoint: "/reports/financial" },
  ];

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const period = periods.find((p) => p.value === selectedPeriod);
      
      let financialPromise;
      if (selectedPeriod === "custom" && customDateRange.start && customDateRange.end) {
        financialPromise = api.post("/reports/financial", {
          start_date: customDateRange.start,
          end_date: customDateRange.end,
        });
      } else if (period && period.endpoint !== "/reports/financial") {
        financialPromise = api.get(period.endpoint);
      } else {
        financialPromise = api.get("/reports/financial/monthly");
      }

      const [financialRes, inventoryRes] = await Promise.all([
        financialPromise,
        api.get("/reports/inventory"),
      ]);

      setFinancialReport(financialRes.data);
      setInventoryReport(inventoryRes.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err.response?.data?.detail || "خطا در دریافت گزارشات");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateSubmit = () => {
    if (customDateRange.start && customDateRange.end) {
      fetchReports();
    } else {
      alert("لطفاً هر دو تاریخ را انتخاب کنید");
    }
  };

  const formatNumber = (num) => {
    return (num || 0).toLocaleString("fa-IR");
  };

  const formatMillion = (num) => {
    return ((num || 0) / 1000000).toFixed(2);
  };

  const profitMargin = financialReport
    ? ((financialReport.profit / financialReport.total_revenue) * 100).toFixed(1)
    : 0;

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری گزارشات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[100px] p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="lequied rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">گزارشات و تحلیل</h1>
              <p className="text-gray-600 mt-1">تحلیل عملکرد مالی و موجودی</p>
            </div>
            <button
              onClick={fetchReports}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw size={18} />
              بروزرسانی
            </button>
          </div>

          {/* Period Selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedPeriod === period.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          {selectedPeriod === "custom" && (
            <div className="flex gap-4 items-end mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">از تاریخ</label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) =>
                    setCustomDateRange({ ...customDateRange, start: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">تا تاریخ</label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) =>
                    setCustomDateRange({ ...customDateRange, end: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleCustomDateSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                اعمال
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {financialReport && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                icon={<DollarSign className="w-6 h-6" />}
                title="درآمد کل"
                value={`${formatMillion(financialReport.total_revenue)} M`}
                subtitle="میلیون تومان"
                color="bg-blue-500"
                trend={financialReport.total_revenue > 0 ? "up" : "neutral"}
              />
              <StatCard
                icon={<ShoppingCart className="w-6 h-6" />}
                title="هزینه کل"
                value={`${formatMillion(financialReport.total_cost)} M`}
                subtitle="میلیون تومان"
                color="bg-orange-500"
              />
              <StatCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="سود خالص"
                value={`${formatMillion(financialReport.profit)} M`}
                subtitle={`حاشیه سود: ${profitMargin}%`}
                color={financialReport.profit >= 0 ? "bg-green-500" : "bg-red-500"}
                trend={financialReport.profit >= 0 ? "up" : "down"}
              />
              <StatCard
                icon={<Package className="w-6 h-6" />}
                title="تعداد فاکتورها"
                value={financialReport.total_invoices}
                subtitle={`${financialReport.total_sold_carpets} فرش فروخته شده`}
                color="bg-purple-500"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Revenue vs Cost */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 size={20} />
                  مقایسه درآمد و هزینه
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: "درآمد",
                        value: financialReport.total_revenue / 1000000,
                      },
                      {
                        name: "هزینه",
                        value: financialReport.total_cost / 1000000,
                      },
                      {
                        name: "سود",
                        value: Math.max(financialReport.profit / 1000000, 0),
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toFixed(2)} میلیون تومان`} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Check Balance */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">تراز چک‌ها</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "چک ورودی",
                          value: financialReport.total_incoming_checks,
                        },
                        {
                          name: "چک خروجی",
                          value: financialReport.total_outgoing_checks,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) =>
                        `${name}: ${(value / 1000000).toFixed(1)}M`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${formatNumber(value)} تومان`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">تراز خالص</p>
                  <p
                    className={`text-2xl font-bold ${
                      financialReport.net_check_balance >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatNumber(financialReport.net_check_balance)} تومان
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Inventory Report */}
        {inventoryReport && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Inventory by Size */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">توزیع موجودی بر اساس اندازه</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inventoryReport.by_size || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="size" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Inventory Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">خلاصه موجودی انبار</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 font-medium">کل فرش‌ها</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {inventoryReport.total_carpets}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">ارزش کل موجودی</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatMillion(inventoryReport.total_inventory_value)} M
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <span className="text-gray-700 font-medium">فرش‌های امانی</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {inventoryReport.consignment_count}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg">
                  <span className="text-gray-700 font-medium">فرش‌های مالکیتی</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {inventoryReport.owned_count}
                  </span>
                </div>
              </div>
            </div>

            {/* Inventory by Material */}
            {inventoryReport.by_material && inventoryReport.by_material.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">
                  توزیع موجودی بر اساس جنس
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={inventoryReport.by_material}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ material, count }) => `${material}: ${count}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {inventoryReport.by_material.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Download Report Button */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <button
            onClick={() => {
              // TODO: Implement PDF download
              alert("قابلیت دانلود گزارش به زودی اضافه می‌شود");
            }}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            <Download size={20} />
            دانلود گزارش PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color, trend }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
        {trend && (
          <div
            className={`flex items-center gap-1 ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp size={20} />
            ) : (
              <TrendingDown size={20} />
            )}
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}