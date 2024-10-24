# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Use BuildKit's cache mount for APK cache
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    gcc \
    musl-dev \
    linux-headers

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally first
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@9.12.2

# Then install dependencies with pnpm cache
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod=false

# Remove build dependencies to reduce image size
RUN apk del .build-deps

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Combine RUN commands and use BuildKit cache
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache --virtual .build-deps \
    python3 make g++ gcc musl-dev linux-headers && \
    npm install -g pnpm@9.12.2

# Copy only necessary files for building
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time variables and use parallel processing
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_SHARP_PATH=/usr/local/lib/node_modules/sharp

# Optimize build with cache and parallel processing
RUN --mount=type=cache,target=/root/.next/cache \
    --mount=type=cache,target=/root/.pnpm-store \
    pnpm build && \
    pnpm prune --prod

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Use multi-line RUN for better caching
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache postgresql-client linux-headers && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir .next && \
    chown nextjs:nodejs .next

# Copy only production files
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Set secure runtime environment
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Enable production optimizations
ENV NODE_OPTIONS="--max-old-space-size=256 --max-http-header-size=8192"

USER nextjs
EXPOSE 3000

# More frequent but faster health checks
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]