# Use the official Node.js image as the base
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install only production dependencies, ignoring peer dependency conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the application code to the working directory
COPY . .

# Build the Vite app for production
RUN npm run build

# Use a lightweight Node.js image for production
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the built files from the previous stage
COPY --from=build /app/dist ./dist

# Expose the port on which the app will run (default is 5173 for Vite)
EXPOSE 4173

# Set the command to serve the built app using Vite's production server
CMD ["npx", "vite", "preview", "--host"]