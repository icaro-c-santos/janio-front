const API_BASE_URL = "http://localhost:3000";

export type AccountReceivableStatus = "PENDING" | "RECEIVED" | "OVERDUE";

export interface AccountsReceivableFilters {
  customerQuery?: string;
  status?: AccountReceivableStatus;
  dueDateFrom?: string;
  dueDateTo?: string;
  competenceMonth?: string;
  page?: number;
  pageSize?: number;
}

export interface AccountReceivableListItem {
  id: string;
  customerName?: string | null;
  customerEmail?: string | null;
  amount: number;
  dueDate: string;
  competenceDate?: string | null;
  status: AccountReceivableStatus;
}

export interface AccountReceivableDetail
  extends Omit<AccountReceivableListItem, "competenceDate"> {
  createdAt: string;
  updatedAt: string;
  customer?: { id: string; name: string; email?: string | null } | null;
  competenceDate?: string | null;
  sales?: Array<{
    id: string;
    quantity: number;
    totalValue: number;
    saleDate: string;
  }>;
  reportDownloadUrl?: string | null;
  paymentReceiptDownloadUrl?: string | null;
}

export interface PaginatedReceivables {
  items: AccountReceivableListItem[];
  total: number;
  page: number;
  pageSize: number;
}

class AccountsReceivableService {
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
    params: AccountsReceivableFilters = {}
  ): Promise<PaginatedReceivables> {
    const qs = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== "")
      .reduce(
        (acc, [k, v]) => ({ ...acc, [k]: String(v) }),
        {} as Record<string, string>
      );
    const search = new URLSearchParams(qs).toString();
    return this.makeRequest<PaginatedReceivables>(
      `/accounts-receivable${search ? `?${search}` : ""}`
    );
  }

  async getById(id: string): Promise<AccountReceivableDetail> {
    return this.makeRequest<AccountReceivableDetail>(
      `/accounts-receivable/${id}`
    );
  }
}

export const accountsReceivableService = new AccountsReceivableService();
