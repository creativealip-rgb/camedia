FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json ./frontend/

RUN npm install -w frontend

COPY frontend ./frontend

# Build the frontend
WORKDIR /app/frontend
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/frontend/package*.json ./frontend/
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/frontend

EXPOSE 3000

ENV NODE_ENV production

CMD ["npm", "run", "start"]
