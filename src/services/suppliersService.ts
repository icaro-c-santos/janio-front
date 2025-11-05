import { API_BASE_URL } from "../config/api";

export interface Supplier {
  id: string;
  name: string;
  email?: string | null;
}

class SuppliersService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders: Record<string, string> = {};
    if (!(options.body instanceof FormData)) defaultHeaders["Content-Type"] = "application/json";
    try {
      const token = localStorage.getItem('janio_erp_token');
      if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;
    } catch {}
    const resp = await fetch(url, { ...options, headers: { ...defaultHeaders, ...options.headers } });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data.message || `Erro ${resp.status}`);
    }
    return resp.json();
  }

  async listAll(): Promise<Supplier[]> {
    return this.makeRequest<Supplier[]>(`/suppliers`);
  }

  async search(query: { name?: string; email?: string }): Promise<Supplier[]> {
    // Backend applies filters with AND when both name and email are sent.
    // To behave like ILIKE over name OR email, only send ONE param.
    const raw = query.name ?? query.email ?? '';
    const useEmail = /@|\./.test(raw);
    const params: Record<string, string> = {};
    if (useEmail) params.email = raw; else params.name = raw;
    const qs = '?' + new URLSearchParams(params).toString();
    return this.makeRequest<Supplier[]>(`/suppliers${qs}`);
  }

  async list(query?: string): Promise<Supplier[]> {
    const q = (query || '').trim();
    if (!q) return this.listAll();
    return this.search({ name: q, email: q });
  }

  async create(payload: { name: string; email?: string }): Promise<Supplier> {
    return this.makeRequest<Supplier>(`/suppliers`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const suppliersService = new SuppliersService();
