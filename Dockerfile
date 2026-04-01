# /Dockerfile (Root directory)

# === STAGE 1: Install Dependencies ===
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# npm ci is faster and stricter than npm install for CI/CD environments
RUN npm ci

# === STAGE 2: Build the App ===
FROM node:20-alpine AS builder
WORKDIR /app
# Copy the installed dependencies from Stage 1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# This builds the standalone folder (Make sure output: 'standalone' is in next.config.js!)
RUN npm run build

# === STAGE 3: Production Runner (The final, tiny image) ===
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy ONLY the necessary compiled files from Stage 2
COPY --from=builder /app/public ./public
# The standalone folder contains your server and traced dependencies
COPY --from=builder /app/.next/standalone ./
# The static folder contains your CSS and optimized images
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

# Standalone mode uses server.js instead of 'npm start'
CMD ["node", "server.js"]