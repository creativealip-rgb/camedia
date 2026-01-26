FROM node:20-alpine AS builder

WORKDIR /app

# Copy root lock files if needed, or just standard npm
COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm install -w backend

COPY backend ./backend
COPY tsconfig.json ./

# Build the backend
RUN npm run build -w backend

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/backend

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
