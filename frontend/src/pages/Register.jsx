import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
	const { register, loading } = useAuth();
	const navigate = useNavigate();
	
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: ""
	});
	const [error, setError] = useState("");

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		
		if (formData.password !== formData.confirmPassword) {
			setError("رمز عبور و تأیید رمز عبور مطابقت ندارند");
			return;
		}
		
		const result = await register(formData.username, formData.email, formData.password);
		if (result.success) {
			navigate("/login");
		} else {
			setError(result.message || "ثبت‌نام ناموفق بود");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
			<div className="w-full max-w-md">
				<form onSubmit={handleSubmit} className="card p-6 md:p-8">
					<h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">ثبت‌نام</h1>
					
					<div className="form-mobile">
						<div className="mb-4">
							<label className="block text-sm font-medium mb-2 text-gray-700">نام کاربری</label>
							<input
								type="text"
								name="username"
								value={formData.username}
								onChange={handleChange}
								className="form-input-mobile"
								placeholder="نام کاربری خود را وارد کنید"
								required
							/>
						</div>
						
						<div className="mb-4">
							<label className="block text-sm font-medium mb-2 text-gray-700">ایمیل</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								className="form-input-mobile"
								placeholder="ایمیل خود را وارد کنید"
								required
							/>
						</div>
						
						<div className="mb-4">
							<label className="block text-sm font-medium mb-2 text-gray-700">رمز عبور</label>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								className="form-input-mobile"
								placeholder="رمز عبور خود را وارد کنید"
								required
							/>
						</div>
						
						<div className="mb-6">
							<label className="block text-sm font-medium mb-2 text-gray-700">تأیید رمز عبور</label>
							<input
								type="password"
								name="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleChange}
								className="form-input-mobile"
								placeholder="رمز عبور را مجدداً وارد کنید"
								required
							/>
						</div>
						
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
								{error}
							</div>
						)}
						
						<button
							type="submit"
							disabled={loading}
							className="btn-mobile bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
						>
							{loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
						</button>
						
						<div className="mt-4 text-center">
							<p className="text-sm text-gray-600">
								قبلاً حساب کاربری دارید؟{" "}
								<button
									type="button"
									onClick={() => navigate("/login")}
									className="text-blue-600 hover:text-blue-700 font-medium"
								>
									ورود
								</button>
							</p>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}


