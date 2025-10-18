const API_BASE_URL = "http://localhost:3000";

export interface PurchaseListItem {
  id: string;
  itemType: string;
  purchaseDate: string;
  unitPrice: number | string;
  quantity: number;
  totalValue: number | string;
  supplierId?: string | null;
  supplierName?: string | null;
  supplierEmail?: string | null;
}

export interface PaginatedPurchases {
  items: PurchaseListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PurchaseDetails extends PurchaseListItem {
  receiptDownloadUrl?: string;
  description?: string;
}

export interface CreatePurchaseRequest {
  itemType: string;
  purchaseDate: string;
  unitPrice: number;
  quantity: number;
  supplierId: string;
  dueDate: string;
  description?: string;
}

class PurchasesService {
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

    const response = await fetch(url, { ...options, headers: { ...defaultHeaders, ...options.headers } });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Erro ${response.status}`);
    }
    return response.json();
  }

  async list(params?: Partial<{ itemType: string; dateFrom: string; dateTo: string; supplierQuery: string; page: number; pageSize: number; }>): Promise<PaginatedPurchases> {
    const qs = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
        if (v !== undefined && v !== null) acc[k] = String(v);
        return acc;
      }, {})
    ).toString() : '';
    return this.makeRequest<PaginatedPurchases>(`/inventory/purchases${qs}`);
  }

  async listItemTypes(): Promise<string[]> {
    return this.makeRequest<string[]>(`/inventory/item-types`);
  }

  async create(payload: CreatePurchaseRequest, receipt?: File): Promise<PurchaseDetails> {
    if (receipt) {
      const form = new FormData();
      form.append('itemType', payload.itemType);
      form.append('purchaseDate', payload.purchaseDate);
      form.append('unitPrice', String(payload.unitPrice));
      form.append('quantity', String(payload.quantity));
      form.append('supplierId', payload.supplierId);
      form.append('dueDate', payload.dueDate);
      if (payload.description) form.append('description', payload.description);
      form.append('receipt', receipt);
      return this.makeRequest<PurchaseDetails>(`/inventory/purchases`, {
        method: 'POST',
        body: form,
      });
    }
    return this.makeRequest<PurchaseDetails>(`/inventory/purchases`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getById(id: string): Promise<PurchaseDetails> {
    return this.makeRequest<PurchaseDetails>(`/inventory/purchases/${id}`);
  }
}

export const purchasesService = new PurchasesService();
