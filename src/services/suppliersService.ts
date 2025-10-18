const API_BASE_URL = "http://localhost:3000";

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
}

export const suppliersService = new SuppliersService();
