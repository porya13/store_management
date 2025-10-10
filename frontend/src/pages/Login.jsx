import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
	const { login, loading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from?.pathname || "/home";

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		const result = await login(username, password);
		if (result.success) {
			navigate(from, { replace: true });
		} else {
			setError(result.message || "ورود ناموفق بود");
		}
	};

	return (
		<div className="min-h-screen  flex items-center justify-center p-4" dir="rtl">
			<div className="w-full lequied max-w-md">
				<form onSubmit={handleSubmit} className="card  lequied p-6 md:p-8">
					<h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">ورود</h1>
					
					<div className="form-mobile">
						<div className="mb-4 ">
							<label className="block text-sm font-medium mb-2 text-gray-700">نام کاربری</label>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="form-input-mobile lequied text-white"
								placeholder="نام کاربری خود را وارد کنید"
								required
							/>
						</div>
						
						<div className="mb-6">
							<label className="block text-sm font-medium mb-2 text-gray-700">رمز عبور</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="form-input-mobile"
								placeholder="رمز عبور خود را وارد کنید"
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
							{loading ? "در حال ورود..." : "ورود"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}