# Node.js Backend Docker Image
FROM node:20-alpine

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "server.js"]
