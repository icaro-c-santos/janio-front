const API_BASE_URL = "http://localhost:3000";

export interface UnifiedMovement {
  id: string;
  direction: 'entrada' | 'saida';
  itemType: string;
  quantity: number;
  movementDate: string;
  supplierName?: string | null;
  supplierEmail?: string | null;
  unitPrice?: number | null;
  total?: number | null;
  reason?: string | null;
  saleId?: string | null;
  saleCustomerName?: string | null;
}

export interface PaginatedUnifiedResponse {
  items: UnifiedMovement[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateInputMovementRequest {
  itemType: string;
  quantity: number;
  unitPrice: number;
  total: number;
  movementDate?: string;
  supplierId?: string;
}

class InventoryService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders: Record<string, string> = {};

    if (!(options.body instanceof FormData)) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    try {
      const token = localStorage.getItem('janio_erp_token');
      if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;
    } catch {}

    const response = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${response.status}`);
    }
    return response.json();
  }

  async getUnifiedMovements(params?: Partial<{
    itemType: string;
    dateFrom: string;
    dateTo: string;
    saleId: string;
    direction: 'entrada' | 'saida';
    page: number;
    pageSize: number;
  }>): Promise<PaginatedUnifiedResponse> {
    const qs = params
      ? '?' + new URLSearchParams(
          Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
            if (v !== undefined && v !== null) acc[k] = String(v);
            return acc;
          }, {})
        ).toString()
      : '';
    return this.makeRequest<PaginatedUnifiedResponse>(`/inventory/movements${qs}`);
  }

  async getUnifiedMovementById(id: string): Promise<UnifiedMovement> {
    return this.makeRequest<UnifiedMovement>(`/inventory/movements/${id}`);
  }

  async createInputMovement(payload: CreateInputMovementRequest): Promise<any> {
    return this.makeRequest<any>(`/inventory/movements-input`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const inventoryService = new InventoryService();
