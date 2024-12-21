# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# First remove any postinstall scripts
RUN npm pkg delete scripts.postinstall

# Install ALL dependencies (including devDependencies)
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Create scripts directory and setup script if needed
RUN mkdir -p scripts && touch scripts/setup.sh && chmod +x scripts/setup.sh

# Build application
RUN yarn build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json /app/yarn.lock ./

# Create scripts directory and setup script
RUN mkdir -p scripts && touch scripts/setup.sh && chmod +x scripts/setup.sh

# Install ALL dependencies again in production stage
RUN yarn install --frozen-lockfile --production=false

RUN yarn add @nestjs/platform-socket.io

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/main"]