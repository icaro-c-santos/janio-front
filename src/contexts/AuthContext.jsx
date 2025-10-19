import React, { createContext, useContext, useState } from "react";
import { API_CONFIG } from "../config/api";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export const USER_TYPES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("janio_erp_user");
    if (!savedUser) return null;
    try {
      const u = JSON.parse(savedUser);
      const up = u?.role ? String(u.role).toUpperCase() : undefined;
      const role =
        up === "ADMIN"
          ? "admin"
          : up === "CUSTOMER"
          ? "customer"
          : u?.role || undefined;
      return { ...u, role };
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data?.message ||
          (res.status === 401 ? "Credenciais inválidas" : `Erro ${res.status}`);
        return { success: false, message: msg };
      }

      const data = await res.json();
      // data: { accessToken, refreshToken, user: { id, login, role, status } }
      localStorage.setItem("janio_erp_token", data.accessToken);
      localStorage.setItem("janio_erp_refresh", data.refreshToken);
      const normalizeRole = (r) => {
        if (!r) return undefined;
        const up = String(r).toUpperCase();
        if (up === "ADMIN") return "admin";
        if (up === "CUSTOMER") return "customer";
        return up.toLowerCase();
      };
      const userData = {
        id: data.user?.id,
        email: data.user?.login,
        role: normalizeRole(data.user?.role),
        status: data.user?.status,
        name: data.user?.name || data.user?.login || "Usuário",
      };
      setUser(userData);
      localStorage.setItem("janio_erp_user", JSON.stringify(userData));
      return { success: true };
    } catch (e) {
      return { success: false, message: "Erro de conexão. Verifique a API." };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("janio_erp_user");
    localStorage.removeItem("janio_erp_token");
    localStorage.removeItem("janio_erp_refresh");
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasPermission = (requiredRole) => {
    if (!user) return false;
    if (user.role === USER_TYPES.ADMIN) return true;
    if (user.role === USER_TYPES.CUSTOMER && requiredRole === "home")
      return true;
    return false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
