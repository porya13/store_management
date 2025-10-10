import React, { useState } from "react";
import { Eye, Edit, Trash2, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CarpetCard({ carpet, onDelete }) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  return (
    <div className="card hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Image */}
      <div 
        className="h-40 md:h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center cursor-pointer relative group"
        onClick={() => navigate(`/carpets/${carpet.id}`)}
      >
        {carpet.image_path && !imageError ? (
          <img
            src={`http://127.0.0.1:8000/${carpet.image_path}`}
            alt={carpet.pattern}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Package size={40} className="text-gray-400 md:w-12 md:h-12" />
        )}
        
        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {carpet.quantity > 0 ? (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
              موجود ({carpet.quantity})
            </span>
          ) : (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
              ناموجود
            </span>
          )}
          {carpet.is_consignment && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
              امانتی
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2">{carpet.pattern}</h3>
        
        <div className="space-y-1 text-xs md:text-sm text-gray-600 mb-4">
          <p className="truncate"><span className="font-semibold">برند:</span> {carpet.brand}</p>
          <p className="truncate"><span className="font-semibold">اندازه:</span> {carpet.size}</p>
          <p className="truncate"><span className="font-semibold">جنس:</span> {carpet.material}</p>
          {carpet.sale_price && (
            <p className="text-base md:text-lg font-bold text-green-600 mt-2">
              {carpet.sale_price.toLocaleString('fa-IR')} تومان
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/carpets/${carpet.id}`)}
            className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white px-2 py-2 rounded text-xs md:text-sm hover:bg-blue-700 transition"
          >
            <Eye size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">مشاهده</span>
          </button>
          
          <button
            onClick={() => navigate(`/carpets/edit/${carpet.id}`)}
            className="flex items-center justify-center bg-yellow-500 text-white px-2 py-2 rounded hover:bg-yellow-600 transition"
            title="ویرایش"
          >
            <Edit size={14} className="md:w-4 md:h-4" />
          </button>
          
          <button
            onClick={() => onDelete(carpet.id)}
            className="flex items-center justify-center bg-red-600 text-white px-2 py-2 rounded hover:bg-red-700 transition"
            title="حذف"
          >
            <Trash2 size={14} className="md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}