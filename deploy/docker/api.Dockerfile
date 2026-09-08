FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY packages ./packages
RUN bun install --frozen-lockfile

FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY apps/backend ./apps/backend
COPY packages ./packages

WORKDIR /app/apps/backend
ENV NODE_ENV=production
EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]