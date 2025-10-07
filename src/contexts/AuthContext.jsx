import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export const USER_TYPES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("janio_erp_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);

    // Simulação simples de login
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUsers = [
      {
        id: 1,
        email: "admin@janio.com",
        password: "admin123",
        name: "Administrador",
        role: USER_TYPES.ADMIN,
      },
      {
        id: 2,
        email: "customer@janio.com",
        password: "customer123",
        name: "Cliente",
        role: USER_TYPES.CUSTOMER,
      },
    ];

    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userData } = foundUser;
      setUser(userData);
      localStorage.setItem("janio_erp_user", JSON.stringify(userData));
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      return { success: false, message: "Email ou senha incorretos" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("janio_erp_user");
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
