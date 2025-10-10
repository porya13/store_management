import React, { useState, useEffect } from "react";
import { ArrowRight, Edit, Trash2, Plus, Package } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function CarpetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [carpet, setCarpet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddOperation, setShowAddOperation] = useState(false);
  const [operationData, setOperationData] = useState({
    operation_name: "",
    price: 0,
    description: ""
  });

  useEffect(() => {
    if (id) {
      fetchCarpet();
    }
  }, [id]);

  const fetchCarpet = async () => {
    try {
      const response = await api.get(`carpets/${id}`);
      setCarpet(response.data);
      setError(null);
    } catch (err) {
      setError("خطا در دریافت اطلاعات فرش");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("آیا از حذف این فرش مطمئن هستید؟")) return;
    try {
      await api.delete(`carpets/${id}`);
      alert("فرش با موفقیت حذف شد");
      navigate('/carpets');
    } catch (err) {
      alert("خطا در حذف فرش");
    }
  };

  const handleAddOperation = async () => {
    try {
      await api.post(`carpets/${id}/operations`, operationData);
      setShowAddOperation(false);
      setOperationData({ operation_name: "", price: 0, description: "" });
      fetchCarpet();
    } catch (err) {
      alert("خطا در افزودن عملیات");
    }
  };

  const handleDeleteOperation = async (operationId) => {
    if (!window.confirm("آیا از حذف این عملیات مطمئن هستید؟")) return;
    try {
      await api.delete(`carpets/operations/${operationId}`);
      fetchCarpet();
    } catch (err) {
      alert("خطا در حذف عملیات");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !carpet) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || "فرش یافت نشد"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="lequied rounded-lg shadow p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">جزئیات فرش</h1>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => navigate(`/carpets/edit/${id}`)}
                className="btn-mobile bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                <span className="hidden sm:inline">ویرایش</span>
              </button>
              <button
                onClick={handleDelete}
                className="btn-mobile bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">حذف</span>
              </button>
              <button
                onClick={() => navigate('/carpets')}
                className="btn-mobile text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2"
              >
                <ArrowRight size={18} />
                <span className="hidden sm:inline">بازگشت</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {carpet.image_path ? (
                  <img
                    src={`http://127.0.0.1:8000/${carpet.image_path}`}
                    alt={carpet.pattern}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={96} className="text-gray-400" />
                )}
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">{carpet.pattern}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">برند:</span>
                    <span className="font-medium mr-2">{carpet.brand}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">جنس:</span>
                    <span className="font-medium mr-2">{carpet.material}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">اندازه:</span>
                    <span className="font-medium mr-2">{carpet.size}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">تعداد:</span>
                    <span className="font-medium mr-2">{carpet.quantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">نحوه پرداخت:</span>
                    <span className="font-medium mr-2">{carpet.payment_method}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">جفت دارد:</span>
                    <span className="font-medium mr-2">{carpet.has_pair ? "بله" : "خیر"}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold mb-3">اطلاعات مالی</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-sm text-gray-600">قیمت خرید</div>
                    <div className="text-lg font-bold text-blue-600">
                      {carpet.purchase_price.toLocaleString()} تومان
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-sm text-gray-600">قیمت فروش</div>
                    <div className="text-lg font-bold text-green-600">
                      {carpet.sale_price?.toLocaleString() || "-"} تومان
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <div className="text-sm text-gray-600">هزینه عملیات</div>
                    <div className="text-lg font-bold text-orange-600">
                      {carpet.total_operations_cost.toLocaleString()} تومان
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <div className="text-sm text-gray-600">قیمت تمام شده</div>
                    <div className="text-lg font-bold text-purple-600">
                      {carpet.total_cost.toLocaleString()} تومان
                    </div>
                  </div>
                </div>
              </div>

              {carpet.is_consignment && (
                <div className="border-t pt-4">
                  <h3 className="font-bold mb-3 text-yellow-700">اطلاعات امانت</h3>
                  <div className="bg-yellow-50 p-4 rounded">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-600">صاحب امانت:</span>
                        <span className="font-medium mr-2">{carpet.consignment_owner}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">قیمت اعلامی:</span>
                        <span className="font-medium mr-2">
                          {carpet.owner_declared_price?.toLocaleString()} تومان
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {carpet.description && (
                <div className="border-t pt-4">
                  <h3 className="font-bold mb-2">توضیحات</h3>
                  <p className="text-gray-700">{carpet.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lequied rounded-lg shadow p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
            <h2 className="text-xl font-bold">عملیات‌های انجام شده</h2>
            <button
              onClick={() => setShowAddOperation(!showAddOperation)}
              className="btn-mobile bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">افزودن عملیات</span>
              <span className="sm:hidden">افزودن</span>
            </button>
          </div>

          {showAddOperation && (
            <div className="mb-4 p-4 lequied rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="نام عملیات"
                  value={operationData.operation_name}
                  onChange={(e) => setOperationData({...operationData, operation_name: e.target.value})}
                  className="form-input-mobile"
                />
                <input
                  type="number"
                  placeholder="قیمت"
                  value={operationData.price}
                  onChange={(e) => setOperationData({...operationData, price: parseFloat(e.target.value)})}
                  className="form-input-mobile"
                />
                <input
                  type="text"
                  placeholder="توضیحات"
                  value={operationData.description}
                  onChange={(e) => setOperationData({...operationData, description: e.target.value})}
                  className="form-input-mobile sm:col-span-2 md:col-span-1"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleAddOperation}
                  className="btn-mobile bg-green-600 text-white hover:bg-green-700"
                >
                  ذخیره
                </button>
                <button
                  onClick={() => setShowAddOperation(false)}
                  className="btn-mobile bg-gray-200 hover:bg-gray-300"
                >
                  انصراف
                </button>
              </div>
            </div>
          )}

          {carpet.operations && carpet.operations.length > 0 ? (
            <div className="space-y-3">
              {carpet.operations.map((operation) => (
                <div key={operation.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm md:text-base">{operation.operation_name}</h4>
                    {operation.description && (
                      <p className="text-xs md:text-sm text-gray-600 mt-1">{operation.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(operation.operation_date).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:gap-4">
                    <span className="font-bold text-green-600 text-sm md:text-base">
                      {operation.price.toLocaleString()} تومان
                    </span>
                    <button
                      onClick={() => handleDeleteOperation(operation.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="حذف عملیات"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">هیچ عملیاتی ثبت نشده است</p>
          )}
        </div>
      </div>
    </div>
  );
}