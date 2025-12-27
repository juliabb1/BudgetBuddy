FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    pnpm install turbo --global

FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml* ./
COPY . .
RUN turbo prune --scope=backend --docker

FROM base AS installer
WORKDIR /usr/src/app

COPY .gitignore .gitignore
COPY --from=builder /usr/src/app/out/json/ .
COPY --from=builder /usr/src/app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /usr/src/app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /usr/src/app/out/full/ .

RUN pnpm install
COPY turbo.json turbo.json
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5433/finanzguru"

WORKDIR /usr/src/app/apps/backend
RUN npx prisma generate

WORKDIR /usr/src/app
RUN turbo run build --filter=backend...

FROM node:20-alpine AS runner
WORKDIR /usr/src/app

RUN apk add --no-cache openssl && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=installer --chown=nodejs:nodejs /usr/src/app/package.json ./package.json
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/backend/package.json ./apps/backend/package.json
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/backend/dist ./apps/backend/dist
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/apps/backend/prisma ./apps/backend/prisma
COPY --from=installer --chown=nodejs:nodejs /usr/src/app/packages ./packages

USER nodejs
WORKDIR /usr/src/app/apps/backend
RUN npx prisma generate
CMD ["node", "dist/src/main.js"]
