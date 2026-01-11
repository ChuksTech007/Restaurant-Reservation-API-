# Use Node.js LTS version
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]