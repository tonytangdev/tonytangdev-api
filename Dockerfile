# Build stage
FROM node:lts-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Production stage
FROM node:lts-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Expose port (default NestJS port)
EXPOSE 3000

# Start app
CMD ["node", "dist/main"]
