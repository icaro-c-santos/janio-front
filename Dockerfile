# Estágio de build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa final com Nginx
FROM nginx:1.25-alpine

# Remove configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia tua configuração
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build do Vite/React
# (troque dist por build se for CRA)
COPY --from=build /app/dist /usr/share/nginx/html

# Exponha a porta 80
EXPOSE 80

# Log de debug (ajuda a ver se os arquivos estão no lugar)
RUN ls -la /usr/share/nginx/html || true

CMD ["nginx", "-g", "daemon off;"]

