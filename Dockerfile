# Estágio de build
FROM node:20-alpine as build

WORKDIR /app

# Copia os arquivos de definição de dependências
COPY package.json package-lock.json* ./

# Instala as dependências
RUN npm ci

# Copia o restante dos arquivos do projeto
COPY . .

# Constrói a aplicação para produção
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copia a configuração personalizada do nginx se existir
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove arquivos padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos de build para o diretório do nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Inicia o nginx
CMD ["nginx", "-g", "daemon off;"]
