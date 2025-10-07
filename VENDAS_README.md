# Módulo de Vendas - Janio ERP

## 📋 Funcionalidades Implementadas

### ✅ **Sistema Completo de Vendas**

1. **📊 Lista de Vendas**

   - Exibe as últimas vendas (20 por página)
   - Mostra nome do cliente, valor total, quantidade e data
   - Paginação funcional
   - Clique na venda para ver detalhes

2. **➕ Cadastro de Nova Venda**

   - Modal com formulário completo
   - Select de produtos (primeiro item sempre selecionado)
   - Select de clientes (sem seleção padrão)
   - Campo de quantidade
   - Campo de preço unitário (auto-preenchido se houver preço específico)
   - Campo de data da venda
   - Upload de arquivo (opcional)

3. **🔍 Detalhes da Venda**

   - Modal com informações completas
   - Exibe todos os dados da venda
   - Botão para excluir venda
   - Confirmação antes de excluir

4. **🔌 Integração com API**
   - Hooks personalizados para gerenciar estado
   - Configuração centralizada da API
   - Tratamento de erros
   - Loading states

## 🚀 Como Usar

### 1. **Visualizar Vendas**

- Acesse o módulo "Vendas" no menu lateral
- As vendas são carregadas automaticamente
- Use a paginação para navegar entre páginas

### 2. **Criar Nova Venda**

- Clique no botão "Nova Venda" no cabeçalho
- Preencha o formulário:
  - **Produto**: Selecionado automaticamente (primeiro da lista)
  - **Cliente**: Selecione um cliente
  - **Quantidade**: Digite a quantidade
  - **Preço Unitário**: Preenchido automaticamente se houver preço específico
  - **Data**: Data da venda (padrão: hoje)
  - **Arquivo**: Upload opcional
- Clique em "Criar Venda"

### 3. **Ver Detalhes da Venda**

- Clique em qualquer venda na lista
- Modal abre com todas as informações
- Use "Excluir" para remover a venda
- Use "Fechar" para voltar à lista

## ⚙️ Configuração da API

### Arquivo: `src/config/api.js`

```javascript
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:3000",
  // ... outras configurações
};
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
REACT_APP_API_URL=http://localhost:3000
```

## 🔧 Hooks Disponíveis

### `useSales()`

- Gerencia vendas (buscar, criar, excluir)
- Estado de loading e erro
- Paginação

### `useCustomers()`

- Busca lista de clientes
- Para preenchimento do select

### `useProducts()`

- Busca lista de produtos
- Fallback para dados mock se API não disponível

### `useProductPrice()`

- Busca preço específico do produto para cliente
- Auto-preenchimento do campo preço

## 📡 Endpoints da API Utilizados

- `GET /sales` - Lista vendas com paginação
- `POST /sales` - Cria nova venda (multipart/form-data)
- `DELETE /sales/:id` - Exclui venda
- `GET /customers` - Lista clientes
- `GET /products` - Lista produtos
- `GET /products/:productId/price/:customerId` - Preço específico

## 🎨 Interface

### Design Responsivo

- Modais responsivos
- Lista adaptável
- Botões com hover effects
- Cores consistentes com o tema

### Estados de Loading

- Indicadores de carregamento
- Tratamento de erros
- Mensagens informativas

## 🔄 Fluxo de Dados

1. **Carregamento Inicial**

   - Busca vendas, clientes e produtos
   - Define primeiro produto como padrão

2. **Seleção de Cliente**

   - Quando cliente é selecionado
   - Busca preço específico automaticamente
   - Atualiza campo preço unitário

3. **Criação de Venda**

   - Validação do formulário
   - Upload de arquivo (se fornecido)
   - Atualização da lista após sucesso

4. **Exclusão de Venda**
   - Confirmação do usuário
   - Chamada para API
   - Atualização da lista

## 🛠️ Tecnologias Utilizadas

- **React Hooks** - Gerenciamento de estado
- **Fetch API** - Requisições HTTP
- **FormData** - Upload de arquivos
- **CSS-in-JS** - Estilização inline
- **Intl.NumberFormat** - Formatação de moeda

## 📝 Próximas Melhorias

- [ ] Edição de vendas existentes
- [ ] Filtros e busca na lista
- [ ] Relatórios de vendas
- [ ] Exportação de dados
- [ ] Notificações de sucesso/erro
- [ ] Validação mais robusta
- [ ] Testes unitários
