# Multi-stage Dockerfile for Hyperledger Fabric Supply Chain Application
# Serves Node.js Express REST API + Built React UI Single Container

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build API Gateway & Chaincode
FROM node:20-alpine AS api-builder
WORKDIR /app
COPY api-gateway/package*.json ./api-gateway/
RUN cd api-gateway && npm ci
COPY api-gateway/ ./api-gateway/
RUN cd api-gateway && npm run build

# Stage 3: Production Image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY api-gateway/package*.json ./
RUN npm ci --only=production

COPY --from=api-builder /app/api-gateway/dist ./dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8080

CMD ["node", "dist/server.js"]
