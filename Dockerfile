# Use Node.js as base image
FROM node:18

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json from my-hackathon-project
COPY my-hackathon-project/package.json my-hackathon-project/package-lock.json ./

# Install dependencies
RUN npm install

# Copy all project files from my-hackathon-project
COPY my-hackathon-project ./

# Expose port (adjust based on your app)
EXPOSE 4000

# Command to run the app
CMD ["npm", "start"]
