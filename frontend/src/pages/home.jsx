import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/api';
import { Loader2, TrendingUp, CheckCircle2, CreditCard, FileText, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCarpets: 0,
    availableCarpets: 0,
    invoicesCount: 0,
    checksCount: 0,
    usersCount: 0,
  });
  const [recentCarpets, setRecentCarpets] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [carpets, available, invoices, checks, users] = await Promise.all([
          api.get('/carpets/?skip=0&limit=1000&available_only=false'),
          api.get('/carpets?available_only=true'),
          api.get('/invoices'),
          api.get('/checks?limit=0'),
          api.get('/users?limit=0'),
        ]);

        setStats({
          totalCarpets: carpets.data.length,
          availableCarpets: available.data.length,
          invoicesCount: invoices.data.length,
          checksCount: checks.data.length,
          usersCount: users.data.length,
        });

        // فرش‌های اخیر
        const sortedCarpets = carpets.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setRecentCarpets(sortedCarpets);

        // فاکتورهای اخیر
        const sortedInvoices = invoices.data
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        setRecentInvoices(sortedInvoices);

        // نمودار فروش (نمونه ساختگی)
        const mockChartData = [
          { name: 'فروردین', sales: 12 },
          { name: 'اردیبهشت', sales: 18 },
          { name: 'خرداد', sales: 25 },
          { name: 'تیر', sales: 20 },
          { name: 'مرداد', sales: 30 },
          { name: 'شهریور', sales: 22 },
        ];
        setChartData(mockChartData);

        setError(null);
      } catch (err) {
        console.error(err);
        setError('خطا در بارگذاری اطلاعات');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-blue-600">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="containerr mt-[100px] flex flex-col p-6" dir="rtl">
      {/* Header */}
     

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <StatCard icon={<TrendingUp />} title="کل فرش‌ها" value={stats.totalCarpets} color="text-blue-600" />
        <StatCard icon={<CheckCircle2 />} title="فرش‌های موجود" value={stats.availableCarpets} color="text-green-600" />
        <StatCard icon={<FileText />} title="تعداد فاکتورها" value={stats.invoicesCount} color="text-purple-600" />
        <StatCard icon={<CreditCard />} title="تعداد چک‌ها" value={stats.checksCount} color="text-orange-600" />
        <StatCard icon={<Users />} title="کاربران سیستم" value={stats.usersCount} color="text-pink-600" />
      </div>

      {/* Chart Section */}
      <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl shadow-md mb-10">
        <h2 className="text-xl font-semibold mb-4">نمودار فروش ماهیانه</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">آخرین فرش‌های اضافه‌شده</h2>
          <ul className="space-y-3">
            {recentCarpets.map((carpet) => (
              <li
                key={carpet.id}
                className="flex justify-between items-center p-3 bg-white/70 rounded-lg shadow-sm hover:bg-white/90 transition"
              >
                <span>{carpet.name || 'بدون نام'}</span>
                <span className="text-sm text-gray-600">
                  {new Date(carpet.created_at).toLocaleDateString('fa-IR')}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">آخرین فاکتورها</h2>
          <ul className="space-y-3">
            {recentInvoices.map((invoice) => (
              <li
                key={invoice.id}
                className="flex justify-between items-center p-3 bg-white/70 rounded-lg shadow-sm hover:bg-white/90 transition"
              >
                <span>فاکتور #{invoice.id}</span>
                <span className="text-sm text-gray-600">
                  {new Date(invoice.date).toLocaleDateString('fa-IR')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg text-center">
          {error}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center shadow-md hover:scale-[1.02] transition">
      <div className={`${color} mb-2`}>{icon}</div>
      <h3 className="text-gray-700 text-sm">{title}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
