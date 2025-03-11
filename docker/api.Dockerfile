# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the source code
COPY server.js ./
COPY routes ./routes
COPY models ./models
COPY middleware ./middleware
COPY config ./config

# Expose port
EXPOSE 3000

# Set the entry point
CMD ["node", "server.js"]
