import { useState, useEffect } from "react";
import { API_CONFIG, apiRequest, uploadFile } from "../config/api";

export const useSalesApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para fazer chamadas HTTP
  const apiCall = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest(endpoint, options);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { apiCall, loading, error };
};

// Hook específico para vendas
export const useSales = () => {
  const { apiCall, loading, error } = useSalesApi();
  const [sales, setSales] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Buscar vendas
  const fetchSales = async (
    page = API_CONFIG.PAGINATION.DEFAULT_PAGE,
    pageSize = API_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE
  ) => {
    try {
      const data = await apiCall(
        `${API_CONFIG.ENDPOINTS.SALES}?page=${page}&pageSize=${pageSize}`
      );
      setSales(data.sales || []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(page);
      return data;
    } catch (err) {
      console.error("Erro ao buscar vendas:", err);
      throw err;
    }
  };

  // Criar nova venda
  const createSale = async (saleData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      // Adicionar dados da venda
      Object.keys(saleData).forEach((key) => {
        if (key === "file" && saleData[key]) {
          formData.append(key, saleData[key]);
        } else if (saleData[key] !== null && saleData[key] !== undefined) {
          formData.append(key, saleData[key]);
        }
      });

      const data = await uploadFile(API_CONFIG.ENDPOINTS.SALES, formData);
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Erro ao criar venda:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Excluir venda
  const deleteSale = async (saleId) => {
    try {
      await apiCall(API_CONFIG.ENDPOINTS.SALES_DELETE(saleId), {
        method: "DELETE",
      });
      return true;
    } catch (err) {
      console.error("Erro ao excluir venda:", err);
      throw err;
    }
  };

  return {
    sales,
    totalPages,
    currentPage,
    loading,
    error,
    fetchSales,
    createSale,
    deleteSale,
  };
};

// Hook para buscar clientes
export const useCustomers = () => {
  const { apiCall, loading, error } = useSalesApi();
  const [customers, setCustomers] = useState([]);

  const fetchCustomers = async (
    page = API_CONFIG.PAGINATION.DEFAULT_PAGE,
    pageSize = API_CONFIG.PAGINATION.MAX_PAGE_SIZE
  ) => {
    try {
      const data = await apiCall(
        `${API_CONFIG.ENDPOINTS.CUSTOMERS}?page=${page}&pageSize=${pageSize}`
      );
      setCustomers(data.customers || []);
      return data;
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      throw err;
    }
  };

  return {
    customers,
    loading,
    error,
    fetchCustomers,
  };
};

// Hook para buscar produtos
export const useProducts = () => {
  const { apiCall, loading, error } = useSalesApi();
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      // Assumindo que existe uma rota para listar produtos
      // Se não existir, você pode criar uma lista mock
      const data = await apiCall(API_CONFIG.ENDPOINTS.PRODUCTS);
      setProducts(data.products || []);
      return data;
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      // Fallback para dados mock se a API não estiver disponível
      const mockProducts = [
        { id: "1", name: "Água de Coco 500ml", price: 3.5 },
        { id: "2", name: "Água de Coco 1L", price: 5.0 },
        { id: "3", name: "Água de Coco 2L", price: 8.0 },
      ];
      setProducts(mockProducts);
      return { products: mockProducts };
    }
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
  };
};

// Hook para buscar preço específico do produto para cliente
export const useProductPrice = () => {
  const { apiCall, loading, error } = useSalesApi();

  const fetchProductPrice = async (productId, customerId) => {
    try {
      const data = await apiCall(
        API_CONFIG.ENDPOINTS.PRODUCT_PRICE(productId, customerId)
      );
      return data.price || null;
    } catch (err) {
      console.error("Erro ao buscar preço do produto:", err);
      return null;
    }
  };

  return {
    loading,
    error,
    fetchProductPrice,
  };
};
