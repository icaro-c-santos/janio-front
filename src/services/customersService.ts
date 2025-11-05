import { API_BASE_URL } from "../config/api"; // Ajuste conforme necessário

export type CustomerType = "PF" | "PJ";

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  type: CustomerType;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  type: CustomerType;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Array<{ message: string; path: string[] }>;
}

class CustomersService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    try {
      const token = localStorage.getItem("janio_erp_token");
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
        const errorData: ApiErrorResponse = await response
          .json()
          .catch(() => ({} as ApiErrorResponse));

        if (response.status === 400) {
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const validationErrors = errorData.errors
              .map(
                (err: any) =>
                  `${(err as any).path?.join(".")}: ${(err as any).message}`
              )
              .join(", ");
            throw new Error(`Dados inválidos: ${validationErrors}`);
          }
          throw new Error(errorData.message || "Dados inválidos");
        } else if (response.status === 409) {
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

  async createCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
    return this.makeRequest<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  }

  async getAllCustomers(): Promise<Customer[]> {
    return this.makeRequest<Customer[]>(`/customers`);
  }
}

export const customersService = new CustomersService();
