import { useState, useEffect } from "react";
import axios from "axios";

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    role: "USER",
  });

  const token = localStorage.getItem("token");

  // گرفتن اطلاعات کاربر فعلی
  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:8000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setIsAdmin(res.data.role === "ADMIN");
      })
      .catch(() => console.log("Error loading user info"));
  }, [token]);

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async () => {
    try {
      await axios.post("http://localhost:8000/auth/register", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("کاربر جدید ساخته شد ✅");
      setNewUser({
        username: "",
        email: "",
        full_name: "",
        password: "",
        role: "USER",
      });
    } catch (err) {
      alert(err.response?.data?.detail || "خطا در ساخت کاربر");
    }
  };

  if (!user)
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        در حال بارگذاری اطلاعات...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-md rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">تنظیمات کاربری</h2>

      {/* بخش اطلاعات شخصی */}
      <div className="mb-6 border-b pb-4">
        <h3 className="text-xl font-semibold mb-2 text-blue-600">اطلاعات من</h3>
        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <div><strong>نام کامل:</strong> {user.full_name}</div>
          <div><strong>ایمیل:</strong> {user.email}</div>
          <div><strong>نام کاربری:</strong> {user.username}</div>
          <div><strong>نقش:</strong> {user.role}</div>
        </div>
      </div>

      {/* بخش مخصوص ادمین */}
      {isAdmin && (
        <div>
          <h3 className="text-xl font-semibold mb-3 text-green-600">افزودن کاربر جدید</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="username"
              placeholder="نام کاربری"
              value={newUser.username}
              onChange={handleChange}
              className="border rounded-lg p-2"
            />
            <input
              type="email"
              name="email"
              placeholder="ایمیل"
              value={newUser.email}
              onChange={handleChange}
              className="border rounded-lg p-2"
            />
            <input
              type="text"
              name="full_name"
              placeholder="نام کامل"
              value={newUser.full_name}
              onChange={handleChange}
              className="border rounded-lg p-2"
            />
            <input
              type="password"
              name="password"
              placeholder="رمز عبور"
              value={newUser.password}
              onChange={handleChange}
              className="border rounded-lg p-2"
            />
            <select
              name="role"
              value={newUser.role}
              onChange={handleChange}
              className="border rounded-lg p-2"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <button
            onClick={handleCreateUser}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            افزودن کاربر
          </button>
        </div>
      )}
    </div>
  );
}
