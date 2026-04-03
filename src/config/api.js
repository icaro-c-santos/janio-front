// Configuração da API
export const API_BASE_URL = "http://localhost:3000";

// Endpoints da API
export const API_ENDPOINTS = {
  // Vendas
  SALES: "/sales",
  SALES_DELETE: function (id) {
    return `/sales/${id}`;
  },

  // Clientes
  CUSTOMERS: "/customers",

  // Produtos
  PRODUCTS: "/products",
  PRODUCT_PRICE: function (productId, customerId) {
    return `/products/${productId}/price/${customerId}`;
  },

  // Health check
  READINESS: "/readiness",

  // Relatórios
  REPORTS: "/reports",
  REPORTS_DOWNLOAD: function (id) {
    return `/reports/${id}/download`;
  },
  REPORTS_TYPES: "/reports/types",
};

// Configurações de requisição
export const API_CONFIG = {
  // Headers padrão
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
  // Se o endpoint já contém http, retorna ele mesmo (URL completa)
  if (
    typeof endpoint === "string" &&
    (endpoint.startsWith("http://") || endpoint.startsWith("https://"))
  ) {
    return endpoint;
  }

  // Remove barras iniciais duplicadas
  const normalizedEndpoint =
    endpoint && typeof endpoint === "string"
      ? endpoint.replace(/^\/+/, "")
      : "";

  return `${API_BASE_URL}/${normalizedEndpoint}`;
};

// Função para fazer requisições HTTP com configurações padrão
export const apiRequest = async (endpoint, options = {}) => {
  // Primeiro, obtemos o token
  let token;
  try {
    token = localStorage.getItem("janio_erp_token");
  } catch (error) {
    console.error("Erro ao acessar localStorage:", error);
  }

  // Construímos a URL corretamente
  const url = buildApiUrl(
    typeof endpoint === "function" ? endpoint() : endpoint,
  );

  // Configuramos os headers
  const headers = {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...(options.headers || {}),
  };

  // Adicionamos o token ao header se existir
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
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
export const uploadFile = async (endpoint, formData, options = {}) => {
  // Obtemos o token
  let token;
  try {
    token = localStorage.getItem("janio_erp_token");
  } catch (error) {
    console.error("Erro ao acessar localStorage:", error);
  }

  // Construímos a URL corretamente
  const url = buildApiUrl(
    typeof endpoint === "function" ? endpoint() : endpoint,
  );

  // Configuramos os headers
  const headers = {
    // Não definimos Content-Type aqui, pois o navegador irá definir automaticamente
    // com o boundary correto para o FormData
    ...(options.headers || {}),
  };

  // Adicionamos o token ao header se existir
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      ...options,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err?.message || `HTTP error! status: ${response.status}`;
      throw new Error(msg);
    }

    return response.json();
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
