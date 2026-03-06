FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema & generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 4000

# Start script: run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
