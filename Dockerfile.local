# ================================================================
# Stage 1: Base - Setup pnpm
# ================================================================
FROM node:24.14.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.4 --activate

# ================================================================
# Stage 2: Dependencies
# ================================================================
FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml drizzle.config.ts tsconfig.json ./
COPY src ./src

# Install only production dependencies with BuildKit cache
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile


# Run database migrations and seeding
CMD ["sh", "-c", "pnpm db:push && pnpm db:seed"]
