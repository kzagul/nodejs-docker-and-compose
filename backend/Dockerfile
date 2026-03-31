# Stage 1: Builder
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i --omit=dev && npm install -g pm2
COPY --from=builder /app/dist ./dist
COPY ecosystem.config.js ./
EXPOSE 3000
CMD ["pm2-runtime", "ecosystem.config.js"]
