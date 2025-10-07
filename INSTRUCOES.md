# 🥥 Janio ERP - Instruções de Uso

## 🚀 Como Executar o Projeto

### 1. Instalar Dependências

```bash
cd janio-erp-front
npm install
```

### 2. Executar em Desenvolvimento

```bash
npm run dev
```

### 3. Acessar a Aplicação

Abra o navegador em: `http://localhost:5173`

## 🔐 Contas de Teste

### Administrador

- **Email**: `admin@janio.com`
- **Senha**: `admin123`
- **Permissões**: Acesso completo (Home + Vendas)

### Cliente

- **Email**: `customer@janio.com`
- **Senha**: `customer123`
- **Permissões**: Apenas Home

## 📱 Funcionalidades Implementadas

### ✅ Sistema de Autenticação

- Login com email e senha
- Logout automático
- Persistência de sessão no localStorage
- Redirecionamento automático baseado em permissões

### ✅ Menu Lateral Responsivo

- Navegação entre páginas
- Diferentes itens baseados no tipo de usuário
- Design responsivo (mobile/desktop)
- Informações do usuário logado

### ✅ Páginas Implementadas

#### 🏠 Home

- Dashboard com estatísticas
- Cards informativos
- Informações da conta do usuário
- Layout responsivo

#### 🛒 Vendas (Apenas Admin)

- Listagem de vendas recentes
- Cards de resumo (vendas do dia, mês, pendentes)
- Tabela com dados simulados
- Botão para nova venda

#### 🔐 Login

- Formulário de autenticação
- Validação de campos
- Mensagens de erro
- Contas de teste visíveis

### ✅ Sistema de Cores Personalizado

- Verde claro (#4CAF50) como cor principal
- Branco como cor secundária
- Tokens de cores para fácil customização
- Tema Material-UI personalizado

## 🎨 Personalização de Cores

Para alterar as cores do sistema, edite o arquivo `src/theme/colors.js`:

```javascript
export const colors = {
  primary: {
    main: "#4CAF50", // Altere aqui a cor principal
    light: "#81C784",
    dark: "#388E3C",
  },
  // ... outras cores
};
```

## 🔧 Estrutura de Arquivos

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Header.jsx      # Cabeçalho
│   ├── Layout.jsx      # Layout principal
│   ├── ProtectedRoute.jsx # Proteção de rotas
│   └── Sidebar.jsx     # Menu lateral
├── contexts/           # Contextos React
│   └── AuthContext.jsx # Autenticação
├── hooks/              # Hooks personalizados
│   └── useApi.js       # Hook para API
├── pages/              # Páginas
│   ├── Home.jsx        # Dashboard
│   ├── Login.jsx       # Login
│   ├── Vendas.jsx      # Vendas
│   ├── NotFound.jsx    # 404
│   └── Unauthorized.jsx # 403
├── theme/              # Tema
│   ├── colors.js       # Cores
│   └── index.js        # Configuração do tema
├── config/             # Configurações
│   └── constants.js    # Constantes
├── App.jsx             # App principal
└── main.jsx            # Entrada
```

## 🚦 Fluxo de Navegação

1. **Usuário não logado** → Redirecionado para `/login`
2. **Login bem-sucedido** → Redirecionado para `/` (Home)
3. **Admin** → Pode acessar Home e Vendas
4. **Cliente** → Pode acessar apenas Home
5. **Tentativa de acesso não autorizado** → Redirecionado para `/unauthorized`

## 📱 Responsividade

- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (até 767px)
- ✅ Menu lateral colapsível em mobile
- ✅ Layout adaptativo

## 🔮 Próximas Implementações

- [ ] Integração com API real
- [ ] Página de Clientes
- [ ] Página de Produtos
- [ ] Sistema de Relatórios
- [ ] Notificações
- [ ] Upload de arquivos
- [ ] Filtros e busca
- [ ] Paginação
- [ ] Exportação de dados

## 🐛 Solução de Problemas

### Erro de Dependências

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Porta em Uso

```bash
# O Vite tentará automaticamente a próxima porta disponível
# Ou especifique uma porta diferente:
npm run dev -- --port 3000
```

### Problemas de CORS (quando integrar com API)

Configure o proxy no `vite.config.js`:

```javascript
export default {
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
};
```

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique o console do navegador (F12)
2. Consulte o README.md
3. Verifique se todas as dependências estão instaladas
4. Teste com as contas de exemplo fornecidas

---

**Desenvolvido para Janio ERP - Sistema de Gestão de Água de Coco** 🥥
