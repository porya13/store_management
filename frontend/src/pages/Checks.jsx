import React from "react";
import { CreditCard, Plus, Search, Filter } from "lucide-react";

export default function Checks() {
	return (
		<div className="page-container" dir="rtl">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="lequied rounded-lg shadow-sm p-4 md:p-6 mb-6">
					<div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-gray-800">چک‌ها</h1>
							<p className="text-gray-600 mt-1 text-sm md:text-base">
								مدیریت چک‌های دریافتی و پرداختی
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-3">
							<button className="btn-mobile bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center gap-2">
								<Plus size={20} />
								<span className="hidden sm:inline">افزودن چک</span>
								<span className="sm:hidden">افزودن</span>
							</button>
						</div>
					</div>

					{/* Search and Filter */}
					<div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
						<div className="flex-1 relative w-full">
							<Search className="absolute right-3 top-3 text-gray-400" size={20} />
							<input
								type="text"
								placeholder="جستجو در چک‌ها..."
								className="form-input-mobile"
							/>
						</div>
						<button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg transition w-full sm:w-auto justify-center hover:bg-gray-50">
							<Filter size={20} />
							فیلترها
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="card p-8 text-center">
					<CreditCard size={64} className="mx-auto text-gray-400 mb-4" />
					<h3 className="text-xl font-semibold text-gray-600 mb-2">چکی یافت نشد</h3>
					<p className="text-gray-500 mb-6">
						هنوز چکی ثبت نشده است
					</p>
					<button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
						ثبت اولین چک
					</button>
				</div>
			</div>
		</div>
	);
}


