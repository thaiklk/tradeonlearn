# Docker image chạy toàn bộ TradeLearn (server + web) — dùng cho Fly.io/Railway/VPS
# Build:  docker build -t tradeonlearn .
# Chạy:   docker run -p 4001:4001 tradeonlearn
FROM node:22-alpine AS build
WORKDIR /app
COPY client/package*.json client/
RUN cd client && npm ci
COPY client client
RUN cd client && npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY server/package*.json server/
RUN cd server && npm ci --omit=dev
COPY server server
COPY --from=build /app/client/dist client/dist
EXPOSE 4001
CMD ["node", "server/src/index.js"]
