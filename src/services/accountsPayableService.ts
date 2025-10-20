const API_BASE_URL = "http://localhost:3000";

export type AccountPayableStatus = "PENDING" | "PAID" | "OVERDUE";

export interface AccountPayType {
  id: string;
  name: string;
  description?: string | null;
  type: "COST" | "EXPENSE";
}

export interface AccountsPayableFilters {
  beneficiary?: string;
  status?: AccountPayableStatus;
  dueDateFrom?: string; // ISO
  dueDateTo?: string; // ISO
  accountPayTypeId?: string;
}

export interface AccountPayableListItem {
  id: string;
  beneficiary?: string | null;
  totalValue: number;
  dueDate: string; // ISO
  status: AccountPayableStatus;
}

export interface AccountPayableDetail extends AccountPayableListItem {
  supplierId?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  accountPayTypeId?: string | null;
  receiptFileKey?: string | null;
  paidAt?: string | null;
  receiptDownloadUrl?: string | null;
  paymentReceiptDownloadUrl?: string | null;
  supplier?: { id: string; name: string; email?: string | null } | null;
  purchase?: {
    id: string;
    itemType: string;
    purchaseDate: string;
    unitPrice: number;
    quantity: number;
    totalValue: number;
    receiptFileKey?: string | null;
    supplier?: { id: string; name: string; email?: string | null } | null;
  } | null;
}

class AccountsPayableService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders: Record<string, string> = {};
    if (!(options.body instanceof FormData))
      defaultHeaders["Content-Type"] = "application/json";
    try {
      const token = localStorage.getItem("janio_erp_token");
      if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;
    } catch {}
    const res = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Erro ${res.status}`);
    }
    return res.json();
  }

  async list(
    filters: AccountsPayableFilters = {}
  ): Promise<AccountPayableListItem[]> {
    const qs = Object.entries(filters)
      .filter(([_, v]) => v !== undefined && v !== null && v !== "")
      .reduce(
        (acc, [k, v]) => ({ ...acc, [k]: String(v) }),
        {} as Record<string, string>
      );
    const search = new URLSearchParams(qs).toString();
    return this.makeRequest<AccountPayableListItem[]>(
      `/accounts-payable${search ? `?${search}` : ""}`
    );
  }

  async getById(id: string): Promise<AccountPayableDetail> {
    return this.makeRequest<AccountPayableDetail>(`/accounts-payable/${id}`);
  }

  async listTypes(): Promise<AccountPayType[]> {
    return this.makeRequest<AccountPayType[]>(`/accounts-payable/types`);
  }

  async create(
    payload: {
      supplierId?: string;
      beneficiary?: string;
      description?: string;
      dueDate: string;
      totalValue: number;
      accountPayTypeId?: string;
    },
    receiptFile?: File | null
  ): Promise<AccountPayableDetail> {
    const form = new FormData();
    if (payload.supplierId) form.append("supplierId", payload.supplierId);
    if (payload.beneficiary) form.append("beneficiary", payload.beneficiary);
    if (payload.description) form.append("description", payload.description);
    form.append("dueDate", payload.dueDate);
    form.append("totalValue", String(payload.totalValue));
    if (payload.accountPayTypeId)
      form.append("accountPayTypeId", payload.accountPayTypeId);
    if (receiptFile) form.append("receipt", receiptFile);

    // Use fetch directly to preserve FormData headers through makeRequest
    return this.makeRequest<AccountPayableDetail>(`/accounts-payable`, {
      method: "POST",
      body: form,
    });
  }
}

export const accountsPayableService = new AccountsPayableService();
