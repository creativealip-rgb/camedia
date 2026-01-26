FROM node:20-alpine AS builder

WORKDIR /app

# Debug: Check project structure
RUN ls -la ..

# Copy package files explicitly
COPY package.json ./
COPY package-lock.json* ./

RUN ls -la && npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Second stage for runtime
FROM node:20-alpine

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
