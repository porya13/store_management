import React, { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, Shield, User, Mail, ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    role: "user",
  });

  useEffect(() => {
    // فقط ادمین می‌تونه این صفحه رو ببینه
    if (currentUser?.role !== "admin") {
      navigate('/profile');
      return;
    }
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert("لطفاً تمام فیلدهای ضروری را پر کنید");
      return;
    }

    try {
      await api.post('/auth/register', newUser);
      alert("کاربر جدید با موفقیت اضافه شد");
      setShowAddModal(false);
      setNewUser({
        username: "",
        email: "",
        full_name: "",
        password: "",
        role: "user",
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "خطا در افزودن کاربر");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      alert("شما نمی‌توانید حساب خود را حذف کنید");
      return;
    }

    if (!window.confirm("آیا از حذف این کاربر مطمئن هستید؟")) return;

    try {
      await api.delete(`/users/${userId}`);
      alert("کاربر با موفقیت حذف شد");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "خطا در حذف کاربر");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toJalali = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fa-IR");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowRight size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">مدیریت کاربران</h1>
                <p className="text-gray-600 mt-1">{users.length} کاربر ثبت شده</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              افزودن کاربر
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="جستجو بر اساس نام، ایمیل یا نام کاربری..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{user.full_name || user.username}</h3>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>

                {user.role === "admin" ? (
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                    <Shield size={12} className="inline" /> ادمین
                  </span>
                ) : (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    <User size={12} className="inline" /> کاربر
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="text-xs text-gray-500">
                  عضویت: {toJalali(user.created_at)}
                </div>
              </div>

              {user.id !== currentUser.id && (
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 transition text-sm"
                  >
                    <Trash2 size={14} />
                    حذف
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <Users size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">کاربری یافت نشد</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">افزودن کاربر جدید</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">نام کاربری *</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ایمیل *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="نام کامل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">رمز عبور *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="حداقل 6 کاراکتر"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">نقش کاربری</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">کاربر عادی</option>
                  <option value="admin">مدیر سیستم (ادمین)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddUser}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                افزودن
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}