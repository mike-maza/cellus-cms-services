# Use the official Playwright image
FROM node:22.13.1-slim

# Establece la zona horaria
ENV TZ="America/Guatemala"

# Set the working directory
WORKDIR /api-rest-cellus

# Install pm2 and ts-node globally
RUN npm install -g typescript pnpm

# Copy the package.json and package-lock.json
COPY package.json pnpm-lock.yaml ./

# Install the project dependencies
RUN pnpm install

# Copy the rest of your app's source code
COPY . .

# RUN tsc

# Expose the port your app runs on
EXPOSE 4000

# Run the ecosystem.config.js file with pm2
CMD ["pnpm", "start"]