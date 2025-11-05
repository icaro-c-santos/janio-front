# Instruções de Uso - Janio ERP Frontend

## 🚀 Como Executar o Sistema

### 1. Instalar Dependências

```bash
cd janio-erp-front
npm install
```

### 2. Executar o Frontend

```bash
npm run dev
```

### 3. Executar a API (em outro terminal)

```bash
cd janio-api
npm run dev
# ou
yarn dev
```

### 4. Acessar o Sistema

- Frontend: http://localhost:5173
- API: http://localhost:3000

## 🔐 Login no Sistema

### Usuários de Teste Disponíveis:

**Administrador (Acesso completo):**

- Email: `admin@janio.com`
- Senha: `admin123`
- Permissões: Acesso a todas as funcionalidades

**Cliente (Acesso limitado):**

- Email: `customer@janio.com`
- Senha: `customer123`
- Permissões: Apenas página inicial

## 📋 Funcionalidades Implementadas

### ✅ Cadastro de Clientes

**Como acessar:**

1. Faça login como administrador
2. Clique em "👥 Clientes" no menu lateral
3. Clique em "Novo Cliente" para abrir o formulário

### ✅ Cadastro de Vendas

**Como acessar:**

1. Faça login como administrador
2. Clique em "💰 Vendas" no menu lateral
3. Clique em "Nova Venda" para abrir o formulário

**Campos do Formulário de Venda:**

- **Produto**: Selecionado automaticamente (Água de Coco Natural)
- **Cliente**: Lista de clientes cadastrados
- **Quantidade**: Número inteiro (obrigatório)
- **Preço Unitário**: Valor automático baseado no cliente selecionado
- **Valor Total**: Calculado automaticamente (quantidade × preço)
- **Data da Venda**: Data da transação (padrão: hoje)
- **Anexo PDF**: Opcional, para comprovantes

**Funcionalidades Especiais:**

- **Preço Dinâmico**: Ao selecionar cliente, busca preço específico se existir
- **Cálculo Automático**: Valor total é calculado em tempo real
- **Confirmação**: Modal de confirmação antes de finalizar a venda
- **Listagem**: Visualização das últimas vendas com paginação (20 por página)
- **Versão Mobile**: Interface adaptada para dispositivos móveis

**Versão Mobile:**

- **Formulário em Etapas**: Processo dividido em 3 etapas (Produto/Cliente → Detalhes → Confirmação)
- **Cards de Vendas**: Listagem em formato de cards otimizada para mobile
- **Navegação por Etapas**: Stepper para guiar o usuário no processo
- **Botão "Carregar Mais"**: Paginação simplificada para mobile
- **Tela Cheia**: Formulário ocupa toda a tela em dispositivos móveis

**Tipos de Cliente Suportados:**

#### Pessoa Física (INDIVIDUAL)

- **CPF**: Obrigatório (mínimo 11 caracteres)
- **Nome Completo**: Obrigatório
- **Data de Nascimento**: Opcional
- **Email**: Opcional (formato válido quando informado)

#### Pessoa Jurídica (COMPANY)

- **CNPJ**: Obrigatório (mínimo 14 caracteres)
- **Razão Social**: Obrigatório
- **Nome Fantasia**: Opcional
- **Inscrição Estadual**: Opcional
- **Email**: Opcional (formato válido quando informado)

**Endereço (Obrigatório para ambos):**

- Rua
- Número
- Bairro
- Cidade
- Estado
- CEP
- País (padrão: Brasil)

**Telefone (Obrigatório para ambos):**

- DDD
- Número
- Tipo (Celular/Fixo)
- É WhatsApp (checkbox)

### 📊 Listagem de Clientes

**Funcionalidades:**

- Visualização em tabela
- Paginação (10 clientes por página)
- Informações exibidas:
  - Nome/Razão Social
  - Email
  - Documento (CPF/CNPJ)
  - Tipo de cliente
  - Telefone (com indicador de WhatsApp)
  - Cidade
  - Botões de ação (Editar/Excluir - em desenvolvimento)

### 📊 Listagem de Vendas

**Funcionalidades:**

- Visualização em tabela
- Paginação (20 vendas por página)
- Informações exibidas:
  - Data da venda e criação
  - Cliente (com tipo PF/PJ)
  - Produto
  - Quantidade
  - Preço unitário
  - Valor total
  - Status da venda

## 🔧 Configuração da API

### Endpoint da API

Por padrão, a API está configurada para rodar em `http://localhost:3000`.

Para alterar, edite o arquivo `src/services/customersService.ts`:

```typescript
import { API_BASE_URL } from "../config/api"; // Altere aqui
```

### Endpoints Utilizados

**Clientes:**

- `GET /customers` - Listar clientes (com paginação)
- `POST /customers` - Criar novo cliente

**Vendas:**

- `GET /sales` - Listar vendas (com paginação)
- `POST /sales` - Criar nova venda
- `GET /products/{productId}/price/{customerId}` - Buscar preço específico do produto para cliente

## 🎨 Interface do Sistema

### Layout

- **Sidebar**: Menu de navegação com logo e opções
- **Header**: Título da página atual
- **Main Content**: Conteúdo principal da página

### Navegação

- **🏠 Home**: Dashboard principal
- **👥 Clientes**: Gerenciamento de clientes (apenas admin)
- **📦 Produtos**: Gerenciamento de produtos (apenas admin)
- **💰 Vendas**: Gerenciamento de vendas (apenas admin)

### Responsividade

- **Interface adaptável**: Detecta automaticamente se é desktop ou mobile
- **Layout mobile**: Menu hambúrguer, cards em vez de tabelas
- **Formulários otimizados**: Versão mobile com stepper (passos)
- **Breakpoint**: 768px (abaixo é considerado mobile)

## 🐛 Solução de Problemas

### Tratamento de Erros

O sistema possui tratamento robusto de erros com:

- **Validação em tempo real**: Campos são validados conforme o usuário digita
- **Mensagens específicas**: Erros são categorizados (conexão, validação, servidor)
- **Notificações toast**: Mensagens de sucesso e erro aparecem no canto superior direito
- **Botão de retry**: Em caso de erro de carregamento, há botão para tentar novamente

### Tipos de Erro Tratados

1. **Erro de Conexão**: "Erro de conexão. Verifique se a API está rodando."
2. **Erro de Validação**: "Dados inválidos: [detalhes específicos]"
3. **Erro de Conflito**: "Cliente já cadastrado" (CPF/CNPJ duplicado)
4. **Erro de Servidor**: "Erro interno do servidor. Tente novamente mais tarde."

### Erro de Conexão com API

- Verifique se a API está rodando na porta 3000
- Confirme se não há firewall bloqueando a conexão
- Verifique o console do navegador para erros de CORS
- Use o botão "Tentar Novamente" na mensagem de erro

### Erro de Autenticação

- Certifique-se de usar as credenciais corretas
- Limpe o localStorage do navegador se necessário
- Verifique se o AuthContext está funcionando

### Problemas de Compilação

- Execute `npm install` novamente
- Verifique se todas as dependências estão instaladas
- Limpe o cache: `npm run build` e depois `npm run dev`

## 📝 Próximas Funcionalidades

### Em Desenvolvimento

- [ ] Edição de clientes
- [ ] Exclusão de clientes
- [ ] Busca e filtros na listagem
- [ ] Gerenciamento de produtos
- [ ] Sistema de vendas
- [ ] Relatórios e dashboard
- [ ] Upload de arquivos
- [ ] Notificações em tempo real

## 📱 Versão Mobile

### Funcionalidades Mobile

- **Layout responsivo**: Detecta automaticamente dispositivos móveis
- **Menu hambúrguer**: Navegação otimizada para touch
- **Cards de clientes**: Visualização em cards em vez de tabelas
- **Formulário em etapas**: Cadastro dividido em 3 passos
- **Dialog fullscreen**: Formulários ocupam tela inteira no mobile

### Como Usar no Mobile

1. **Navegação**: Toque no ícone de menu (☰) para acessar as opções
2. **Lista de clientes**: Visualize clientes em cards com informações resumidas
3. **Cadastrar cliente**: Toque em "Novo Cliente" e preencha os 3 passos:
   - **Passo 1**: Dados básicos (tipo, email, CPF/CNPJ, nome)
   - **Passo 2**: Endereço completo
   - **Passo 3**: Telefone e configurações
4. **Paginação**: Use os controles na parte inferior para navegar entre páginas

## 🆘 Suporte

Para dúvidas ou problemas:

1. Verifique este arquivo de instruções
2. Consulte o README.md do projeto
3. Verifique os logs do console do navegador
4. Confirme se a API está funcionando corretamente
