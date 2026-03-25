FROM node:22-alpine
WORKDIR /app

# ── 1. Workspace manifests ────────────────────────────────────────────────────
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/socket-server/package.json ./apps/socket-server/package.json

# Stub apps/web so the root workspaces array doesn't error on a missing dir
RUN mkdir -p apps/web && \
    printf '{"name":"showmatch-web","version":"0.0.0","private":true}' \
    > apps/web/package.json

# ── 2. Install ────────────────────────────────────────────────────────────────
# Install socket-server + shared deps (includes devDeps so tsx is available)
RUN npm install --workspace=apps/socket-server --workspace=packages/shared

# ── 3. Source ─────────────────────────────────────────────────────────────────
COPY packages/shared/ ./packages/shared/
COPY apps/socket-server/src ./apps/socket-server/src
COPY apps/socket-server/tsconfig.json ./apps/socket-server/tsconfig.json

EXPOSE 3001
ENV NODE_ENV=production

CMD ["npm", "run", "start", "--workspace=apps/socket-server"]
