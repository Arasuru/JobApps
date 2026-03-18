FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# We need to pass the Groq API key at build time so the build succeeds, 
# though it will be overridden by the runtime env variable later.
ENV GROQ_API_KEY=dummy_key_for_build 
RUN npm run build

# Stage 3: Production server
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Copy the standalone output and static files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

# Start the standalone Next.js server
CMD ["node", "server.js"]