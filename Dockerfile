# syntax=docker/dockerfile:1

# ---- deps: install with the lockfile only, so this layer caches well ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Public origin used for canonical URLs / sitemap. Inlined at build time.
ARG NEXT_PUBLIC_SITE_URL=http://5.75.128.196:4010
# Set to 1 only when the site is served over HTTPS (enables HSTS + upgrade-insecure-requests).
ARG HTTPS_ONLY=0
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL HTTPS_ONLY=$HTTPS_ONLY
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- run: minimal image, non-root ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=4010 \
    HOSTNAME=0.0.0.0
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
# standalone output already contains the traced node_modules and server.js
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 4010
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD wget -qO- http://127.0.0.1:4010/ >/dev/null || exit 1
CMD ["node", "server.js"]
