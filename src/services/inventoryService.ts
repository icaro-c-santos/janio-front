import { API_BASE_URL } from "../config/api";

export interface UnifiedMovement {
  id: string;
  direction: "entrada" | "saida";
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

export interface InventoryItem {
  itemType: string;
  quantity: number;
  updatedAt?: string;
  alertThreshold?: number;
  criticalQuantity?: number;
  status?: "ok" | "atencao" | "critico";
}

export interface CreateInputMovementRequest {
  itemType: string;
  quantity: number;
  movementDate?: string;
  purchaseId?: string;
}

export interface CreateOutputMovementRequest {
  itemType: string;
  quantity: number;
  movementDate: string;
  reason?: string;
}

class InventoryService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders: Record<string, string> = {};

    if (!(options.body instanceof FormData)) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    try {
      const token = localStorage.getItem("janio_erp_token");
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

  async getUnifiedMovements(
    params?: Partial<{
      itemType: string;
      dateFrom: string;
      dateTo: string;
      saleId: string;
      direction: "entrada" | "saida";
      page: number;
      pageSize: number;
    }>
  ): Promise<PaginatedUnifiedResponse> {
    const qs = params
      ? "?" +
        new URLSearchParams(
          Object.entries(params).reduce<Record<string, string>>(
            (acc, [k, v]) => {
              if (v !== undefined && v !== null) acc[k] = String(v);
              return acc;
            },
            {}
          )
        ).toString()
      : "";
    return this.makeRequest<PaginatedUnifiedResponse>(
      `/inventory/movements${qs}`
    );
  }

  async getUnifiedMovementById(id: string): Promise<UnifiedMovement> {
    return this.makeRequest<UnifiedMovement>(`/inventory/movements/${id}`);
  }

  async createInputMovement(payload: CreateInputMovementRequest): Promise<any> {
    return this.makeRequest<any>(`/inventory/movements-input`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async createOutputMovement(
    payload: CreateOutputMovementRequest
  ): Promise<any> {
    return this.makeRequest<any>(`/inventory/movements-output`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getCurrentStock(): Promise<InventoryItem[]> {
    const res = await this.makeRequest<any>(`/inventory/items`);
    if (Array.isArray(res)) return res as InventoryItem[];
    if (Array.isArray(res?.items)) return res.items as InventoryItem[];
    if (Array.isArray(res?.data)) return res.data as InventoryItem[];
    return [];
  }
}

export const inventoryService = new InventoryService();
