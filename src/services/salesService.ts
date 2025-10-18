const API_BASE_URL = "http://localhost:3000";

export interface CreateSaleRequest {
  customerId: string;
  quantity: number;
  unitPrice: number;
  saleDate?: string;
  receipt?: File;
}

export interface Sale {
  id: string;
  customerId: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  saleDate: string;
  receiptFileKey?: string | null;
  receiptDownloadUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: Array<{ message: string; path: string[] }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  };
  error?: string;
}

class SalesService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: Record<string, string> = {};

    // Se não for FormData, adiciona Content-Type JSON
    if (!(options.body instanceof FormData)) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    // Token de autenticação
    try {
      const token = localStorage.getItem('janio_erp_token');
      if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
      }
    } catch {}

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Tratamento específico para diferentes tipos de erro
        if (response.status === 400) {
          // Erro de validação
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const validationErrors = errorData.errors
              .map((err: any) => `${err.path?.join(".")}: ${err.message}`)
              .join(", ");
            throw new Error(`Dados inválidos: ${validationErrors}`);
          }
          throw new Error(errorData.message || "Dados inválidos");
        } else if (response.status === 409) {
          // Conflito
          throw new Error(errorData.message || "Venda já cadastrada");
        } else if (response.status === 500) {
          throw new Error(
            "Erro interno do servidor. Tente novamente mais tarde."
          );
        } else {
          throw new Error(
            errorData.message ||
              `Erro ${response.status}: ${response.statusText}`
          );
        }
      }

      return response.json();
    } catch (error) {
      // Tratamento de erros de rede
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Erro de conexão. Verifique se a API está rodando.");
      }
      throw error;
    }
  }

  // Criar venda
  async createSale(saleData: CreateSaleRequest): Promise<ApiResponse<Sale>> {
    // Validações básicas
    if (isNaN(saleData.quantity as any) || saleData.quantity <= 0) {
      throw new Error("Quantidade deve ser um número válido maior que zero");
    }

    const formData = new FormData();

    formData.append("customerId", saleData.customerId);
    formData.append("quantity", saleData.quantity.toString());
    formData.append("unitPrice", saleData.unitPrice.toString());
    if (saleData.saleDate) {
      formData.append("saleDate", saleData.saleDate);
    }
    if (saleData.receipt) {
      formData.append("receipt", saleData.receipt);
    }

    return this.makeRequest<ApiResponse<Sale>>("/sales", {
      method: "POST",
      body: formData,
    });
  }

  // Listar vendas (passa filtros diretamente)
  async getAllSales(
    params?: Record<string, string | number | undefined>
  ): Promise<any> {
    const qs = params
      ? "?" +
        new URLSearchParams(
          Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
            if (v !== undefined && v !== null) acc[k] = String(v);
            return acc;
          }, {})
        ).toString()
      : "";
    return this.makeRequest<any>(`/sales${qs}`);
  }

  // Obter venda por ID
  async getSaleById(saleId: string): Promise<ApiResponse<Sale>> {
    return this.makeRequest<ApiResponse<Sale>>(`/sales/${saleId}`);
  }
}

export const salesService = new SalesService();
