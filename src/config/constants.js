// Constantes da aplicação
export const APP_CONFIG = {
  name: 'Janio ERP',
  version: '1.0.0',
  description: 'Sistema de gestão para empresa de água de coco',
};

// Configurações de autenticação
export const AUTH_CONFIG = {
  tokenKey: 'janio_erp_token',
  userKey: 'janio_erp_user',
  tokenExpiration: 24 * 60 * 60 * 1000, // 24 horas em millisegundos
};

// URLs da API (quando implementada)
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
    },
    sales: {
      list: '/sales',
      create: '/sales',
      update: '/sales/:id',
      delete: '/sales/:id',
    },
    customers: {
      list: '/customers',
      create: '/customers',
      update: '/customers/:id',
      delete: '/customers/:id',
    },
    products: {
      list: '/products',
      create: '/products',
      update: '/products/:id',
      delete: '/products/:id',
    },
  },
};

// Configurações de roteamento
export const ROUTES = {
  login: '/login',
  home: '/',
  sales: '/vendas',
  customers: '/clientes',
  products: '/produtos',
  reports: '/relatorios',
  unauthorized: '/unauthorized',
  notFound: '/404',
};

// Configurações de permissões
export const PERMISSIONS = {
  home: 'home',
  sales: 'vendas',
  customers: 'clientes',
  products: 'produtos',
  reports: 'relatorios',
  admin: 'admin',
};

// Mensagens do sistema
export const MESSAGES = {
  auth: {
    loginSuccess: 'Login realizado com sucesso!',
    loginError: 'Email ou senha incorretos',
    logoutSuccess: 'Logout realizado com sucesso!',
    sessionExpired: 'Sua sessão expirou. Faça login novamente.',
  },
  general: {
    loading: 'Carregando...',
    error: 'Ocorreu um erro inesperado',
    success: 'Operação realizada com sucesso!',
    confirm: 'Tem certeza que deseja continuar?',
  },
  validation: {
    required: 'Este campo é obrigatório',
    email: 'Digite um email válido',
    minLength: 'Mínimo de caracteres não atingido',
    maxLength: 'Máximo de caracteres excedido',
  },
};
