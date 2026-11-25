FROM node:24 AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts
COPY . .
ARG VITE_API_BASE_URL=https://api.fromchat.ru
RUN export VITE_API_BASE_URL && npm run build

FROM joseluisq/static-web-server:latest AS production
COPY --from=builder /app/dist /var/public
ENV SERVER_ROOT=/var/public
ENV SERVER_FALLBACK_PAGE=/var/public/index.html
EXPOSE 80