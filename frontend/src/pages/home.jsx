import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/api';
import { Loader2, TrendingUp, CheckCircle2, CreditCard, FileText, Package, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCarpets: 0,
    availableCarpets: 0,
    totalValue: 0,
    invoicesCount: 0,
    checksCount: 0,
    totalRevenue: 0,
  });
  const [recentCarpets, setRecentCarpets] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [upcomingChecks, setUpcomingChecks] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [carpetsRes, invoicesRes, checksRes, inventoryRes] = await Promise.all([
        api.get('/carpets?limit=1000'),
        api.get('/invoices?limit=100'),
        api.get('/checks/upcoming?days=7'),
        api.get('/reports/inventory'),
      ]);

      const allCarpets = carpetsRes.data;
      const availableCarpets = allCarpets.filter(c => c.quantity > 0);
      const totalValue = allCarpets.reduce((sum, c) => sum + (c.total_cost * c.quantity), 0);

      const allInvoices = invoicesRes.data;
      const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);

      setStats({
        totalCarpets: allCarpets.length,
        availableCarpets: availableCarpets.length,
        totalValue: totalValue,
        invoicesCount: allInvoices.length,
        checksCount: checksRes.data.length,
        totalRevenue: totalRevenue,
      });

      setRecentCarpets(allCarpets.slice(0, 5));
      setRecentInvoices(allInvoices.slice(0, 5));
      setUpcomingChecks(checksRes.data.slice(0, 5));

      if (inventoryRes.data.by_size) {
        const chartData = inventoryRes.data.by_size.map(item => ({
          name: item.size,
          count: item.count
        }));
        setInventoryData(chartData);
      }

      setError(null);
    } catch (err) {
      console.error('خطا در دریافت داده‌ها:', err);
      setError(err.response?.data?.detail || 'خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-[100px] p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Package className="w-6 h-6" />}
            title="کل فرش‌ها"
            value={stats.totalCarpets}
            subtitle={`${stats.availableCarpets} موجود`}
            color="bg-blue-500"
            onClick={() => navigate('/carpets')}
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            title="ارزش موجودی"
            value={`${(stats.totalValue / 1000000).toFixed(1)}M`}
            subtitle="میلیون تومان"
            color="bg-green-500"
          />
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            title="فاکتورها"
            value={stats.invoicesCount}
            subtitle={`${(stats.totalRevenue / 1000000).toFixed(1)}M فروش`}
            color="bg-purple-500"
            onClick={() => navigate('/invoices')}
          />
          <StatCard
            icon={<CreditCard className="w-6 h-6" />}
            title="چک‌های نزدیک"
            value={stats.checksCount}
            subtitle="تا 7 روز آینده"
            color="bg-orange-500"
            onClick={() => navigate('/checks')}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="درآمد کل"
            value={`${(stats.totalRevenue / 1000000).toFixed(1)}M`}
            subtitle="میلیون تومان"
            color="bg-pink-500"
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            title="نرخ موجودی"
            value={`${stats.totalCarpets > 0 ? ((stats.availableCarpets / stats.totalCarpets) * 100).toFixed(0) : 0}%`}
            subtitle="فرش‌های موجود"
            color="bg-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">توزیع موجودی بر اساس اندازه</h2>
            {inventoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">داده‌ای برای نمایش وجود ندارد</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">چک‌های نزدیک به سررسید</h2>
              <button
                onClick={() => navigate('/checks')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                مشاهده همه
              </button>
            </div>
            {upcomingChecks.length > 0 ? (
              <div className="space-y-3">
                {upcomingChecks.map((check) => (
                  <div
                    key={check.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div>
                      <p className="font-medium">{check.check_number}</p>
                      <p className="text-sm text-gray-600">{check.payee}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-orange-600">
                        {check.amount.toLocaleString()} تومان
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(check.check_date).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">چک نزدیک به سررسیدی وجود ندارد</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">آخرین فرش‌های اضافه شده</h2>
              <button
                onClick={() => navigate('/carpets')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                مشاهده همه
              </button>
            </div>
            {recentCarpets.length > 0 ? (
              <div className="space-y-3">
                {recentCarpets.map((carpet) => (
                  <div
                    key={carpet.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => navigate(`/carpets/${carpet.id}`)}
                  >
                    <div>
                      <p className="font-medium">{carpet.pattern}</p>
                      <p className="text-sm text-gray-600">{carpet.brand} - {carpet.size}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-green-600">
                        {carpet.quantity} عدد
                      </p>
                      <p className="text-sm text-gray-600">{carpet.material}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">فرشی اضافه نشده است</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">آخرین فاکتورها</h2>
              <button
                onClick={() => navigate('/invoices')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                مشاهده همه
              </button>
            </div>
            {recentInvoices.length > 0 ? (
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-gray-600">{invoice.customer_name}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-green-600">
                        {invoice.total_amount.toLocaleString()} تومان
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(invoice.invoice_date).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">فاکتوری صادر نشده است</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color, onClick }) {
  return (
    <div
      className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}