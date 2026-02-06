FROM node:20-bookworm AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

COPY backend/package.json backend/tsconfig.json ./
COPY backend/src ./src
COPY shared /app/shared

RUN npm install
RUN npm run build

FROM node:20-bookworm-slim

WORKDIR /app/backend

COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/package.json ./package.json

CMD ["node", "dist/backend/src/index.js"]
