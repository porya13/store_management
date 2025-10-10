import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(() => localStorage.getItem("token") || "");
	const [user, setUser] = useState(() => {
		const raw = localStorage.getItem("user");
		return raw ? JSON.parse(raw) : null;
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (token) {
			localStorage.setItem("token", token);
			api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
		} else {
			localStorage.removeItem("token");
			delete api.defaults.headers.common["Authorization"];
		}
	}, [token]);

	useEffect(() => {
		if (user) {
			localStorage.setItem("user", JSON.stringify(user));
		} else {
			localStorage.removeItem("user");
		}
	}, [user]);

	const login = async (username, password) => {
		setLoading(true);
		try {
			const response = await api.post("auth/login", { username, password });
			const { access_token, user: userData } = response.data;
			setToken(access_token);
			setUser(userData);
			return { success: true };
		} catch (error) {
			return {
				success: false,
				message: error?.response?.data?.detail || "خطا در ورود",
			};
		} finally {
			setLoading(false);
		}
	};

	const logout = () => {
		setToken("");
		setUser(null);
	};

	const value = useMemo(
		() => ({ token, user, loading, login, logout, isAuthenticated: Boolean(token) }),
		[token, user, loading]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
};


