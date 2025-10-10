import React, { useState, useEffect } from "react";
import { ArrowRight, Save, Upload } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function CarpetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    pattern: "",
    brand: "",
    material: "",
    size: "شش متری",
    quantity: 1,
    purchase_price: 0,
    sale_price: 0,
    description: "",
    seller_name: "",
    has_pair: false,
    payment_method: "نقدی",
    is_consignment: false,
    consignment_owner: "",
    owner_declared_price: 0,
  });

  const carpetSizes = [
    "کوچیک", "پشتی", "زرچارک", "زرنیم", "قالیچه",
    "پرده‌ای", "شش متری", "نه متری", "12 متری", "بزرگ‌تر"
  ];

  const paymentMethods = ["نقدی", "چک", "قسطی", "ترکیبی"];

  useEffect(() => {
    if (isEdit) {
      fetchCarpet();
    }
  }, [id]);

  const fetchCarpet = async () => {
    try {
      const response = await api.get(`carpets/${id}`);
      setFormData(response.data);
    } catch (err) {
      setError("خطا در دریافت اطلاعات فرش");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let carpetData = { ...formData };
      
      carpetData.purchase_price = parseFloat(carpetData.purchase_price);
      carpetData.sale_price = parseFloat(carpetData.sale_price) || null;
      carpetData.quantity = parseInt(carpetData.quantity);
      
      if (carpetData.is_consignment) {
        carpetData.owner_declared_price = parseFloat(carpetData.owner_declared_price);
      }

      let response;
      if (isEdit) {
        response = await api.put(`carpets/${id}`, carpetData);
      } else {
        response = await api.post('carpets/', carpetData);
      }

      if (imageFile && response.data.id) {
        const formDataImage = new FormData();
        formDataImage.append('file', imageFile);
        await api.post(`carpets/${response.data.id}/image`, formDataImage, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      alert(isEdit ? 'فرش با موفقیت ویرایش شد' : 'فرش با موفقیت اضافه شد');
      navigate('/carpets');
    } catch (err) {
      setError(err.response?.data?.detail || 'خطا در ذخیره اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-[100px]  p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="lequied rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {isEdit ? 'ویرایش فرش' : 'افزودن فرش جدید'}
            </h1>
            <button
              onClick={() => navigate('/carpets')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowRight size={20} />
              بازگشت
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4">اطلاعات پایه</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">نقشه *</label>
                  <input
                    type="text"
                    name="pattern"
                    value={formData.pattern}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">برند *</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">جنس *</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">اندازه *</label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {carpetSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">تعداد *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">نحوه پرداخت *</label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4">قیمت‌ها</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">قیمت خرید (تومان) *</label>
                  <input
                    type="number"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">قیمت فروش (تومان)</label>
                  <input
                    type="number"
                    name="sale_price"
                    value={formData.sale_price}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold mb-4">اطلاعات فروشنده</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">نام فروشنده</label>
                  <input
                    type="text"
                    name="seller_name"
                    value={formData.seller_name}
                    onChange={handleChange}
                    disabled={formData.is_consignment}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_consignment"
                    checked={formData.is_consignment}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span>امانی است</span>
                </label>

                {formData.is_consignment && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-yellow-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium mb-2">نام صاحب امانت *</label>
                      <input
                        type="text"
                        name="consignment_owner"
                        value={formData.consignment_owner}
                        onChange={handleChange}
                        required={formData.is_consignment}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">قیمت اعلامی مالک (تومان) *</label>
                      <input
                        type="number"
                        name="owner_declared_price"
                        value={formData.owner_declared_price}
                        onChange={handleChange}
                        min="0"
                        required={formData.is_consignment}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="has_pair"
                    checked={formData.has_pair}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span>جفت دارد</span>
                </label>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">عکس و توضیحات</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">عکس فرش</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                      <Upload size={20} />
                      انتخاب فایل
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {imageFile && (
                      <span className="text-sm text-gray-600">{imageFile.name}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">توضیحات</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                <Save size={20} />
                {loading ? 'در حال ذخیره...' : (isEdit ? 'ذخیره تغییرات' : 'افزودن فرش')}
              </button>
              <button
                onClick={() => navigate('/carpets')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}