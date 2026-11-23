# Build
FROM node:20-bookworm-slim AS build
WORKDIR /src

COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY Frontend/ ./
RUN npm run build:prod

# Runtime (Nginx sirve el SPA y redirige /api al backend)
FROM nginx:1.27-alpine AS final

COPY Frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist/galy-crud /usr/share/nginx/html

EXPOSE 80
