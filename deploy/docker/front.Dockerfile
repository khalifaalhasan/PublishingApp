FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
RUN bun install --frozen-lockfile

FROM deps AS build
COPY apps/web ./apps/web
COPY packages ./packages

ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL

WORKDIR /app/apps/web
RUN bun run build

FROM base AS runner
WORKDIR /app/apps/web
ENV NODE_ENV=production
ENV PORT=5000
COPY --from=build /app/apps/web/build ./build
COPY --from=build /app/apps/web/package.json ./package.json
COPY --from=build /app/apps/web/node_modules ./node_modules

EXPOSE 5000
CMD ["bun", "run", "build/index.js"]