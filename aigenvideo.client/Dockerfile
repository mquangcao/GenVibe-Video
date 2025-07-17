# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
ARG VITE_SERVER_PROXY
ENV VITE_SERVER_PROXY=$VITE_SERVER_PROXY
ENV IN_DOCKER=true
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM node:20-slim
WORKDIR /app

RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
