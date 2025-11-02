// Configuração da API
export const API_CONFIG = {
  // Usa caminho relativo para o proxy do Nginx
  BASE_URL: "/api",

  ENDPOINTS: {
    // Vendas
    SALES: "/sales",
    SALES_DELETE: (id) => `/sales/${id}`,

    // Clientes
    CUSTOMERS: "/customers",

    // Produtos
    PRODUCTS: "/products",
    PRODUCT_PRICE: (productId, customerId) =>
      `/products/${productId}/price/${customerId}`,

    // Health check
    READINESS: "/readiness",

    // Relatórios
    REPORTS: "/reports",
    REPORTS_DOWNLOAD: (id) => `/reports/${id}/download`,
    REPORTS_TYPES: "/reports/types",
  },

  // Configurações de requisição
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },

  // Timeout para requisições (em ms)
  TIMEOUT: 10000,

  // Configurações de paginação padrão
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
};

// Função para construir URL completa
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Função para fazer requisições HTTP com configurações padrão
export const apiRequest = async (endpoint, options = {}) => {
  const url =
    typeof endpoint === "function"
      ? buildApiUrl(endpoint())
      : buildApiUrl(endpoint);

  const headers = {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...options.headers,
  };
  try {
    const token = localStorage.getItem("janio_erp_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {}

  const config = {
    headers,
    ...options,
  };

  // Adicionar timeout se não especificado
  if (!config.signal && API_CONFIG.TIMEOUT) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    config.signal = controller.signal;
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.message || `HTTP error! status: ${response.status}`;
    throw new Error(msg);
  }

  return response.json();
};

// Função para fazer upload de arquivos
export const uploadFile = async (endpoint, formData) => {
  const url =
    typeof endpoint === "function"
      ? buildApiUrl(endpoint())
      : buildApiUrl(endpoint);

  const headers = {};
  try {
    const token = localStorage.getItem("janio_erp_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {}

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers,
    // Não definir Content-Type para multipart/form-data
    // O browser define automaticamente com o boundary correto
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.message || `HTTP error! status: ${response.status}`;
    throw new Error(msg);
  }

  return response.json();
};

