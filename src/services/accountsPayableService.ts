import { API_BASE_URL } from "../config/api";

export type AccountPayableStatus = "PENDING" | "PARTIALLY_PAID" | "PAID";

export interface AccountsPayableFilters {
  query?: string;
  status?: AccountPayableStatus;
  dueDateFrom?: string;
  dueDateTo?: string;
  supplierId?: string;
  referenceMonth?: string;
  page?: number;
  pageSize?: number;
}

export interface AccountPayablePaymentItem {
  id: string;
  paymentDate: string;
  amount: number;
  note?: string | null;
  attachmentDownloadUrl?: string | null;
  attachmentOriginalName?: string | null;
}

export interface AccountPayableListItem {
  id: string;
  dueDate: string;
  referenceMonth?: string | null;
  description?: string | null;
  supplierId?: string | null;
  supplierName?: string | null;
  status: AccountPayableStatus;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface AccountPayableDetail extends AccountPayableListItem {
  supplier?: { id: string; name: string; email?: string | null } | null;
  attachmentDownloadUrl?: string | null;
  attachmentOriginalName?: string | null;
  payments: AccountPayablePaymentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAccountsPayable {
  items: AccountPayableListItem[];
  total: number;
  page: number;
  pageSize: number;
}

class AccountsPayableService {
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

  async list(params: AccountsPayableFilters = {}): Promise<PaginatedAccountsPayable> {
    const qs = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== "")
      .reduce(
        (acc, [k, v]) => ({ ...acc, [k]: String(v) }),
        {} as Record<string, string>
      );
    const search = new URLSearchParams(qs).toString();
    return this.makeRequest<PaginatedAccountsPayable>(
      `/accounts-payable${search ? `?${search}` : ""}`
    );
  }

  async getById(id: string): Promise<AccountPayableDetail> {
    return this.makeRequest<AccountPayableDetail>(`/accounts-payable/${id}`);
  }

  async create(
    payload: {
      dueDate: string;
      totalAmount: number;
      supplierId?: string;
      referenceMonth?: string;
      description?: string;
    },
    attachmentFile?: File | null
  ): Promise<AccountPayableDetail> {
    const form = new FormData();
    form.append("dueDate", payload.dueDate);
    form.append("totalAmount", String(payload.totalAmount));
    if (payload.supplierId) form.append("supplierId", payload.supplierId);
    if (payload.referenceMonth) form.append("referenceMonth", payload.referenceMonth);
    if (payload.description) form.append("description", payload.description);
    if (attachmentFile) form.append("attachment", attachmentFile);
    return this.makeRequest<AccountPayableDetail>("/accounts-payable", {
      method: "POST",
      body: form,
    });
  }

  async addPayment(
    accountPayableId: string,
    payload: { paymentDate: string; amount: number; note?: string },
    attachmentFile?: File | null
  ): Promise<AccountPayableDetail> {
    const form = new FormData();
    form.append("paymentDate", payload.paymentDate);
    form.append("amount", String(payload.amount));
    if (payload.note) form.append("note", payload.note);
    if (attachmentFile) form.append("attachment", attachmentFile);
    return this.makeRequest<AccountPayableDetail>(
      `/accounts-payable/${accountPayableId}/payments`,
      {
        method: "POST",
        body: form,
      }
    );
  }
}

export const accountsPayableService = new AccountsPayableService();
