import React from "react";
import { BarChart3, Download, Calendar, TrendingUp } from "lucide-react";

export default function Reports() {
	return (
		<div className="page-container" dir="rtl">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="lequied rounded-lg shadow-sm p-4 md:p-6 mb-6">
					<div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-gray-800">گزارشات</h1>
							<p className="text-gray-600 mt-1 text-sm md:text-base">
								گزارشات فروش و عملکرد
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-3">
							<button className="btn-mobile bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center gap-2">
								<Download size={20} />
								<span className="hidden sm:inline">دانلود گزارش</span>
								<span className="sm:hidden">دانلود</span>
							</button>
						</div>
					</div>
				</div>

				{/* Report Cards */}
				<div className="grid-mobile gap-4 md:gap-6 mb-6">
					<div className="card p-4 md:p-6">
						<div className="flex items-center gap-4">
							<div className="bg-blue-100 p-3 rounded-lg">
								<TrendingUp className="w-6 h-6 text-blue-600" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-800">فروش ماهانه</h3>
								<p className="text-gray-600 text-sm">گزارش فروش این ماه</p>
							</div>
						</div>
					</div>

					<div className="card p-4 md:p-6">
						<div className="flex items-center gap-4">
							<div className="bg-green-100 p-3 rounded-lg">
								<BarChart3 className="w-6 h-6 text-green-600" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-800">آمار فرش‌ها</h3>
								<p className="text-gray-600 text-sm">گزارش موجودی و فروش</p>
							</div>
						</div>
					</div>

					<div className="card p-4 md:p-6">
						<div className="flex items-center gap-4">
							<div className="bg-purple-100 p-3 rounded-lg">
								<Calendar className="w-6 h-6 text-purple-600" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-800">گزارش دوره‌ای</h3>
								<p className="text-gray-600 text-sm">گزارش‌های دوره‌ای</p>
							</div>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="card p-8 text-center">
					<BarChart3 size={64} className="mx-auto text-gray-400 mb-4" />
					<h3 className="text-xl font-semibold text-gray-600 mb-2">گزارشی موجود نیست</h3>
					<p className="text-gray-500 mb-6">
						هنوز داده‌ای برای تولید گزارش وجود ندارد
					</p>
					<button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
						ایجاد اولین گزارش
					</button>
				</div>
			</div>
		</div>
	);
}


