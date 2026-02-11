FROM node:lts-slim AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend ./
COPY shared ../shared
RUN pnpm run build

# Assets are served by Caddy - copy from build stage
FROM scratch AS assets
COPY --from=build /app/dist/frontend/browser /assets
