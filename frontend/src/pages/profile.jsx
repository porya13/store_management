import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Calendar, Edit, Save, X, Users, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    current_password: "",
    new_password: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || "",
        email: user.email || "",
        current_password: "",
        new_password: "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      
      const updatePayload = {
        full_name: profileData.full_name,
        email: profileData.email,
      };
      
      // اگر پسورد جدید وارد شده، اضافه کن
      if (profileData.new_password) {
        updatePayload.password = profileData.new_password;
      }

      await api.put(`/users/${user.id}`, updatePayload);
      
      alert("پروفایل با موفقیت به‌روزرسانی شد");
      setEditMode(false);
      
      // اگر پسورد عوض شده، دوباره لاگین کن
      if (profileData.new_password) {
        logout();
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "خطا در به‌روزرسانی پروفایل");
    } finally {
      setLoading(false);
    }
  };

  const toJalali = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fa-IR");
  };

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
          <Shield size={14} />
          مدیر سیستم
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
        <User size={14} />
        کاربر عادی
      </span>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="mt-[100px] p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                  <User size={40} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user.full_name || user.username}</h1>
                  <p className="text-blue-100 mt-1">@{user.username}</p>
                  <div className="mt-2">{getRoleBadge(user.role)}</div>
                </div>
              </div>
              
              {user.role === "admin" && (
                <button
                  onClick={() => navigate('/users')}
                  className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
                >
                  <Users size={18} />
                  مدیریت کاربران
                </button>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">اطلاعات حساب کاربری</h2>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Edit size={18} />
                  ویرایش پروفایل
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    <Save size={18} />
                    ذخیره
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setProfileData({
                        full_name: user.full_name || "",
                        email: user.email || "",
                        current_password: "",
                        new_password: "",
                      });
                    }}
                    className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    <X size={18} />
                    انصراف
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} />
                  نام و نام خانوادگی
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-lg text-gray-800">{user.full_name || "-"}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} />
                  ایمیل
                </label>
                {editMode ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-lg text-gray-800">{user.email}</p>
                )}
              </div>

              {/* Username (Read Only) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} />
                  نام کاربری
                </label>
                <p className="text-lg text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 mt-1">نام کاربری قابل تغییر نیست</p>
              </div>

              {/* Role (Read Only) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Shield size={16} />
                  نقش کاربری
                </label>
                <div className="bg-gray-50 px-4 py-2 rounded-lg">
                  {getRoleBadge(user.role)}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} />
                    تاریخ عضویت
                  </label>
                  <p className="text-gray-800">{toJalali(user.created_at)}</p>
                </div>
                
                {user.last_login && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} />
                      آخرین ورود
                    </label>
                    <p className="text-gray-800">{toJalali(user.last_login)}</p>
                  </div>
                )}
              </div>

              {/* Change Password */}
              {editMode && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-semibold text-gray-800 mb-4">تغییر رمز عبور</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رمز عبور جدید
                      </label>
                      <input
                        type="password"
                        value={profileData.new_password}
                        onChange={(e) => setProfileData({ ...profileData, new_password: e.target.value })}
                        placeholder="اگر می‌خواهید رمز عبور را تغییر دهید، وارد کنید"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        حداقل 6 کاراکتر
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}