FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create logs directory
RUN mkdir -p logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3003

# Expose port
EXPOSE 3003

# Start the application
CMD ["node", "src/index.js"]
