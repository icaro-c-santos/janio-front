const API_BASE_URL = "http://localhost:3000";

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
}

export interface CreateSaleRequest {
  productId: string;
  customerId: string;
  quantity: number;
  price: number;
  totalValue: number;
  saleDate: string;
  file?: File;
}

export interface Sale {
  id: string;
  productId: string;
  customerId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  saleDate: string;
  receiptFileKey?: string | null;
  receiptFileUrl?: string | null;
  product?: Product;
  customer?: {
    userId: string;
    user: {
      id: string;
      type: "INDIVIDUAL" | "COMPANY";
      individual?: {
        fullName: string;
        cpf: string;
      };
      company?: {
        legalName: string;
        tradeName: string;
        cnpj: string;
      };
    };
  };
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

  // Buscar todos os produtos
  async getProducts(): Promise<Product[]> {
    try {
      const response = await this.makeRequest<ApiResponse<Product[]>>(
        "/products"
      );

      if (response.success && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      throw new Error("Erro ao carregar produtos");
    }
  }

  // Hook para clientes
  async getCustomers(): Promise<
    Array<{ id: string; name: string; type: "INDIVIDUAL" | "COMPANY" }>
  > {
    try {
      const response = await this.makeRequest<PaginatedResponse<any>>(
        "/customers?pageSize=100"
      );

      if (response.success && response.data) {
        return response.data.items.map((customer) => ({
          id: customer.userId,
          name:
            customer.user.type === "INDIVIDUAL"
              ? customer.user.individual?.fullName || "Nome não informado"
              : customer.user.company?.legalName ||
                "Razão social não informada",
          type: customer.user.type,
        }));
      }

      return [];
    } catch (error) {
      throw new Error("Erro ao carregar clientes");
    }
  }

  // Buscar preço específico do produto para o cliente
  async getProductPriceByCustomer(
    productId: string,
    customerId: string
  ): Promise<number | null> {
    try {
      console.log(
        `Buscando preço para produto ${productId} e cliente ${customerId}`
      );

      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/price/${customerId}/`
      );

      console.log("Status da resposta:", response.status);

      if (response.status === 404) {
        console.log("Preço não encontrado (404)");
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Resposta da API:", data);

      // O backend retorna diretamente { price: number } quando encontra
      if (data && typeof data.price === "number") {
        console.log("Preço encontrado:", data.price);
        return data.price;
      }

      console.log("Preço não encontrado ou formato inválido");
      return null;
    } catch (error) {
      console.error("Erro na API ao buscar preço:", error);
      // Se não encontrar preço específico, retorna null
      return null;
    }
  }

  // Criar venda
  async createSale(saleData: CreateSaleRequest): Promise<ApiResponse<Sale>> {
    // Validar se os valores numéricos são válidos
    if (isNaN(saleData.price) || saleData.price <= 0) {
      throw new Error(
        "Preço unitário deve ser um número válido maior que zero"
      );
    }

    if (isNaN(saleData.quantity) || saleData.quantity <= 0) {
      throw new Error("Quantidade deve ser um número válido maior que zero");
    }

    if (isNaN(saleData.totalValue) || saleData.totalValue <= 0) {
      throw new Error("Valor total deve ser um número válido maior que zero");
    }

    const formData = new FormData();

    formData.append("productId", saleData.productId);
    formData.append("customerId", saleData.customerId);
    formData.append("quantity", saleData.quantity.toString());
    formData.append("unitPrice", saleData.price.toString());
    formData.append("totalValue", saleData.totalValue.toString());
    formData.append("saleDate", saleData.saleDate);

    if (saleData.file) {
      formData.append("file", saleData.file);
    }

    return this.makeRequest<ApiResponse<Sale>>("/sales", {
      method: "POST",
      body: formData,
    });
  }

  // Listar vendas
  async getAllSales(
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Sale>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    return this.makeRequest<PaginatedResponse<Sale>>(`/sales?${params}`);
  }

  // Obter venda por ID
  async getSaleById(saleId: string): Promise<ApiResponse<Sale>> {
    return this.makeRequest<ApiResponse<Sale>>(`/sales/${saleId}`);
  }
}

export const salesService = new SalesService();
