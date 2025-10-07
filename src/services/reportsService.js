import { API_CONFIG, apiRequest } from "../config/api.js";

// Tipos de relatórios disponíveis
export const REPORT_TYPES = {
  DRE_MENSAL: "DRE_MENSAL",
  DRE_ANUAL: "DRE_ANUAL",
  VENDAS_MENSAL_POR_CLIENTE: "VENDAS_MENSAL_POR_CLIENTE",
  VENDAS_MENSAL_GERAL: "VENDAS_MENSAL_GERAL",
  VENDAS_ANUAL_POR_CLIENTE: "VENDAS_ANUAL_POR_CLIENTE",
  VENDAS_ANUAL_GERAL: "VENDAS_ANUAL_GERAL",
  ESTOQUE_MENSAL: "ESTOQUE_MENSAL",
  ESTOQUE_ANUAL: "ESTOQUE_ANUAL",
};

// Status dos relatórios
export const REPORT_STATUS = {
  PROCESSING: "PROCESSING",
  PENDING: "PENDING",
  READY: "READY",
  FAILED: "FAILED",
};

// Labels dos tipos de relatórios
export const REPORT_TYPE_LABELS = {
  [REPORT_TYPES.DRE_MENSAL]: "DRE Mensal",
  [REPORT_TYPES.DRE_ANUAL]: "DRE Anual",
  [REPORT_TYPES.VENDAS_MENSAL_POR_CLIENTE]: "Vendas Mensal por Cliente",
  [REPORT_TYPES.VENDAS_MENSAL_GERAL]: "Vendas Mensal Geral",
  [REPORT_TYPES.VENDAS_ANUAL_POR_CLIENTE]: "Vendas Anual por Cliente",
  [REPORT_TYPES.VENDAS_ANUAL_GERAL]: "Vendas Anual Geral",
  [REPORT_TYPES.ESTOQUE_MENSAL]: "Estoque Mensal",
  [REPORT_TYPES.ESTOQUE_ANUAL]: "Estoque Anual",
};

// Labels dos status
export const REPORT_STATUS_LABELS = {
  [REPORT_STATUS.PROCESSING]: "Processando",
  [REPORT_STATUS.PENDING]: "Pendente",
  [REPORT_STATUS.READY]: "Pronto",
  [REPORT_STATUS.FAILED]: "Falhou",
};

// Cores dos status
export const REPORT_STATUS_COLORS = {
  [REPORT_STATUS.PROCESSING]: "bg-blue-100 text-blue-800",
  [REPORT_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [REPORT_STATUS.READY]: "bg-green-100 text-green-800",
  [REPORT_STATUS.FAILED]: "bg-red-100 text-red-800",
};

// Tipos que precisam de cliente
export const CUSTOMER_SPECIFIC_TYPES = [
  REPORT_TYPES.VENDAS_MENSAL_POR_CLIENTE,
  REPORT_TYPES.VENDAS_ANUAL_POR_CLIENTE,
];

// Tipos que precisam de produto
export const PRODUCT_SPECIFIC_TYPES = [
  REPORT_TYPES.ESTOQUE_MENSAL,
  REPORT_TYPES.ESTOQUE_ANUAL,
  // Relatórios por cliente também precisam de produto
  REPORT_TYPES.VENDAS_MENSAL_POR_CLIENTE,
  REPORT_TYPES.VENDAS_ANUAL_POR_CLIENTE,
];

// Tipos que precisam de cliente E produto
export const CUSTOMER_AND_PRODUCT_TYPES = [
  REPORT_TYPES.VENDAS_MENSAL_POR_CLIENTE,
  REPORT_TYPES.VENDAS_ANUAL_POR_CLIENTE,
];

/**
 * Busca os últimos relatórios
 */
export const getReports = async (page = 1, pageSize = 10) => {
  try {
    const response = await apiRequest(
      `${API_CONFIG.ENDPOINTS.REPORTS}?page=${page}&pageSize=${pageSize}`
    );
    return response;
  } catch (error) {
    console.error("Erro ao buscar relatórios:", error);
    throw error;
  }
};

/**
 * Cria um novo relatório
 */
export const createReport = async (reportData) => {
  try {
    const response = await apiRequest(API_CONFIG.ENDPOINTS.REPORTS, {
      method: "POST",
      body: JSON.stringify(reportData),
    });
    return response;
  } catch (error) {
    console.error("Erro ao criar relatório:", error);
    throw error;
  }
};

/**
 * Faz download de um relatório
 */
export const downloadReport = async (reportId) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REPORTS_DOWNLOAD(
      reportId
    )}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.downloadUrl) {
      // Abre a URL de download em uma nova aba
      window.open(data.downloadUrl, "_blank");
      return { success: true, filename: data.fileName };
    } else {
      throw new Error(data.message || "Erro ao obter URL de download");
    }
  } catch (error) {
    console.error("Erro ao fazer download do relatório:", error);
    throw error;
  }
};

/**
 * Verifica se um tipo de relatório precisa de cliente
 */
export const needsCustomer = (reportType) => {
  return CUSTOMER_SPECIFIC_TYPES.includes(reportType);
};

/**
 * Verifica se um tipo de relatório precisa de produto
 */
export const needsProduct = (reportType) => {
  return PRODUCT_SPECIFIC_TYPES.includes(reportType);
};

/**
 * Verifica se um tipo de relatório precisa de cliente E produto
 */
export const needsCustomerAndProduct = (reportType) => {
  return CUSTOMER_AND_PRODUCT_TYPES.includes(reportType);
};

/**
 * Busca os tipos de relatórios disponíveis
 */
export const getReportTypes = async () => {
  try {
    const response = await apiRequest(`${API_CONFIG.ENDPOINTS.REPORTS}/types`);
    return response;
  } catch (error) {
    console.error("Erro ao buscar tipos de relatórios:", error);
    throw error;
  }
};
