import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { API_CONFIG } from "../config/constants";

// Hook personalizado para fazer chamadas à API
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();

  // Função genérica para fazer requisições
  const request = useCallback(
    async (endpoint, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        const url = `${API_CONFIG.baseURL}${endpoint}`;

        const config = {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
          },
          ...options,
        };

        const response = await fetch(url, config);

        // Se a resposta for 401 (não autorizado), fazer logout
        if (response.status === 401) {
          logout();
          throw new Error("Sessão expirada");
        }

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, logout]
  );

  // Métodos específicos
  const get = useCallback(
    (endpoint, options = {}) => {
      return request(endpoint, { ...options, method: "GET" });
    },
    [request]
  );

  const post = useCallback(
    (endpoint, data, options = {}) => {
      return request(endpoint, {
        ...options,
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    [request]
  );

  const put = useCallback(
    (endpoint, data, options = {}) => {
      return request(endpoint, {
        ...options,
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    [request]
  );

  const del = useCallback(
    (endpoint, options = {}) => {
      return request(endpoint, { ...options, method: "DELETE" });
    },
    [request]
  );

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    delete: del,
  };
};

// Hook específico para autenticação
export const useAuthApi = () => {
  const { login: contextLogin, logout: contextLogout } = useAuth();
  const { loading, error, post } = useApi();

  const login = useCallback(
    async (email, password) => {
      try {
        const response = await post(API_CONFIG.endpoints.auth.login, {
          email,
          password,
        });

        if (response.success) {
          contextLogin(response.data.user, response.data.token);
          return { success: true };
        } else {
          return { success: false, message: response.message };
        }
      } catch (err) {
        return { success: false, message: err.message };
      }
    },
    [post, contextLogin]
  );

  const logout = useCallback(async () => {
    try {
      await post(API_CONFIG.endpoints.auth.logout);
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    } finally {
      contextLogout();
    }
  }, [post, contextLogout]);

  return {
    loading,
    error,
    login,
    logout,
  };
};
