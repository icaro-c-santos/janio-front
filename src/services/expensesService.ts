import { API_BASE_URL } from "../config/api";

export interface ExpenseType {
  id: string;
  name: string;
  description?: string | null;
}

export interface ExpenseFilters {
  expenseTypeId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExpenseListItem {
  id: string;
  expenseTypeId: string;
  description?: string | null;
  amount: number;
  expenseDate: string;
  receiptFileKey?: string | null;
  receiptDownloadUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  expenseType?: ExpenseType | null;
}

class ExpensesService {
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

  async listTypes(): Promise<ExpenseType[]> {
    return this.makeRequest<ExpenseType[]>("/expenses/types");
  }

  async createType(payload: {
    name: string;
    description?: string;
  }): Promise<ExpenseType> {
    return this.makeRequest<ExpenseType>("/expenses/types", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async list(filters: ExpenseFilters = {}): Promise<ExpenseListItem[]> {
    const qs = Object.entries(filters)
      .filter(([_, v]) => v !== undefined && v !== null && v !== "")
      .reduce(
        (acc, [k, v]) => ({ ...acc, [k]: String(v) }),
        {} as Record<string, string>
      );
    const search = new URLSearchParams(qs).toString();
    return this.makeRequest<ExpenseListItem[]>(
      `/expenses${search ? `?${search}` : ""}`
    );
  }

  async getById(id: string): Promise<ExpenseListItem> {
    return this.makeRequest<ExpenseListItem>(`/expenses/${id}`);
  }

  async create(
    payload: {
      expenseTypeId: string;
      description?: string;
      amount: number;
      expenseDate: string;
    },
    receiptFile?: File | null
  ): Promise<ExpenseListItem> {
    const form = new FormData();
    form.append("expenseTypeId", payload.expenseTypeId);
    if (payload.description) form.append("description", payload.description);
    form.append("amount", String(payload.amount));
    form.append("expenseDate", payload.expenseDate);
    if (receiptFile) form.append("receipt", receiptFile);

    return this.makeRequest<ExpenseListItem>("/expenses", {
      method: "POST",
      body: form,
    });
  }
}

export const expensesService = new ExpensesService();
