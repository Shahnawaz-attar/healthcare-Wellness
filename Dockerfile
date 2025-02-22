# Use Node.js as base image
FROM node:18

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json from my-hackathon-project
COPY my-hackathon-project/package.json my-hackathon-project/package-lock.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY my-hackathon-project ./

# Build TypeScript (if applicable)
RUN npm run build

# Expose port
EXPOSE 4000

# Command to run the app
CMD ["node", "dist/index.js"]
