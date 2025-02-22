# Use Node.js as base image
FROM node:18

# Set working directory in container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy project files
COPY . .

# Expose port (adjust based on your app)
EXPOSE 4000

# Command to run the app
CMD ["npm", "start"]
