const API_BASE_URL = "http://localhost:3000"; // Ajuste conforme necessário

export interface CreateCustomerRequest {
  user: {
    type: "INDIVIDUAL" | "COMPANY";
    email?: string;
    individual?: {
      cpf: string;
      fullName: string;
      birthDate?: string;
    };
    company?: {
      cnpj: string;
      legalName: string;
      tradeName?: string;
      stateRegistration?: string;
    };
    address: {
      street: string;
      number: string;
      district: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    phone: {
      areaCode: string;
      number: string;
      isWhatsapp: boolean;
      type: "FIXED" | "MOBILE";
    };
  };
}

export interface Customer {
  userId: string;
  user: {
    id: string;
    type: "INDIVIDUAL" | "COMPANY";
    email?: string;
    individual?: {
      cpf: string;
      fullName: string;
      birthDate?: string;
    };
    company?: {
      cnpj: string;
      legalName: string;
      tradeName?: string;
      stateRegistration?: string;
    };
    primaryAddress: {
      id: string;
      street: string;
      number: string;
      district: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isPrimary: boolean;
    };
    address: Array<{
      id: string;
      street: string;
      number: string;
      district: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isPrimary: boolean;
    }>;
    primaryPhone?: {
      id: string;
      areaCode: string;
      number: string;
      isWhatsapp: boolean;
      type: "FIXED" | "MOBILE";
      isPrimary: boolean;
    };
    phones: Array<{
      id: string;
      areaCode: string;
      number: string;
      isWhatsapp: boolean;
      type: "FIXED" | "MOBILE";
      isPrimary: boolean;
    }>;
    createdAt: string;
    deletedAt: string | null;
  };
  deletedAt: string | null;
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

class CustomersService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

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
          // Conflito (ex: CPF/CNPJ já existe)
          throw new Error(errorData.message || "Cliente já cadastrado");
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

  async createCustomer(
    customerData: CreateCustomerRequest
  ): Promise<ApiResponse<Customer>> {
    return this.makeRequest<ApiResponse<Customer>>("/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  }

  async getAllCustomers(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Customer>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    return this.makeRequest<PaginatedResponse<Customer>>(
      `/customers?${params}`
    );
  }
}

export const customersService = new CustomersService();
