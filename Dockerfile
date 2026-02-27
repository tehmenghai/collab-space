# Stage 1: Build frontend and server
FROM node:20-slim AS build

WORKDIR /app

# Copy workspace root and package files
COPY package.json package-lock.json ./
COPY packages/frontend/package.json packages/frontend/
COPY packages/server/package.json packages/server/

RUN npm ci

# Copy source code
COPY packages/frontend/ packages/frontend/
COPY packages/server/ packages/server/

# Build frontend and server
RUN npm run build

# Stage 2: Production image
FROM node:20-slim AS production

WORKDIR /app

# Copy server package.json for production deps
COPY packages/server/package.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy compiled server
COPY --from=build /app/packages/server/dist ./dist/

# Copy frontend build output into public/ for static serving
COPY --from=build /app/packages/frontend/dist ./public/

ENV PORT=4444
ENV NODE_ENV=production

EXPOSE 4444

CMD ["node", "dist/index.js"]
