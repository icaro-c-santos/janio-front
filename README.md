# Janio ERP Frontend

Sistema de gestão empresarial - Frontend React com TypeScript.

## Funcionalidades Implementadas

### ✅ Cadastro de Clientes
- Formulário completo para cadastro de clientes (Pessoa Física e Jurídica)
- Validação de campos obrigatórios
- Integração com API REST
- Listagem de clientes com paginação
- Interface responsiva com Material-UI

### 🚧 Em Desenvolvimento
- Gerenciamento de Produtos
- Sistema de Vendas
- Relatórios e Dashboard

## Tecnologias Utilizadas

- **React 19** - Biblioteca para interface de usuário
- **TypeScript** - Tipagem estática
- **Material-UI (MUI)** - Componentes de interface
- **React Router** - Roteamento
- **Vite** - Build tool e dev server

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- API janio-api rodando (porta 3000)

## Instalação

1. Instale as dependências:
```bash
npm install
# ou
yarn install
```

## Execução

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

2. Acesse o sistema em: http://localhost:5173

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.tsx      # Layout principal com navegação
│   └── CustomerForm.tsx # Formulário de cadastro de clientes
├── pages/              # Páginas da aplicação
│   ├── Home.tsx        # Página inicial
│   ├── Customers.tsx   # Página de clientes
│   ├── Products.tsx    # Página de produtos
│   └── Sales.tsx       # Página de vendas
├── services/           # Serviços de API
│   └── customersService.ts # Serviço para clientes
├── App.tsx             # Componente principal
└── main.tsx           # Ponto de entrada
```

## API Integration

O frontend se comunica com a API `janio-api` através dos seguintes endpoints:

- `GET /customers` - Listar clientes (com paginação)
- `POST /customers` - Criar novo cliente

### Configuração da API

Por padrão, a API está configurada para rodar em `http://localhost:3000`. 
Para alterar, modifique a constante `API_BASE_URL` no arquivo `src/services/customersService.ts`.

## Funcionalidades do Cadastro de Clientes

### Tipos de Cliente Suportados

1. **Pessoa Física (INDIVIDUAL)**
   - CPF
   - Nome completo
   - Data de nascimento (opcional)

2. **Pessoa Jurídica (COMPANY)**
   - CNPJ
   - Razão social
   - Nome fantasia (opcional)
   - Inscrição estadual (opcional)

### Campos Obrigatórios

- Email
- Endereço completo (rua, número, bairro, cidade, estado, CEP, país)
- Telefone (DDD, número, tipo, WhatsApp)

### Validações

- Email deve ter formato válido
- CPF deve ter pelo menos 11 caracteres
- CNPJ deve ter pelo menos 14 caracteres
- Todos os campos de endereço são obrigatórios
- Telefone deve ter DDD e número

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request