# ---- deps: install production dependencies only ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
# npm ci is reproducible and much faster than install in CI/containers.
RUN npm ci --omit=dev

# ---- runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Run as a non-root user. The node image ships one; using it limits the damage
# if the process is ever compromised.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src ./src

USER node
EXPOSE 5000

# Readiness probe: /api/health returns 503 until MongoDB is reachable, so the
# orchestrator won't route traffic to a container that cannot serve it.
HEALTHCHECK --interval=30s --timeout=4s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
