# ---- Stage 1: build the React SPA ----
FROM node:22-alpine AS build

WORKDIR /app

# Install exactly what package-lock.json pins.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# API base URL baked into the bundle at build time.
# Production default: same origin, prefix stripped by nginx.
# Override in the build args, e.g. docker compose build --build-arg VITE_API_URL=/api/v1
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Stage 2: serve the built SPA with nginx ----
FROM nginx:1.27-alpine

# Default single-server SPA config (used when no nginx.conf is mounted).
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
