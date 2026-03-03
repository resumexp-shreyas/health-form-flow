# # Stage 1: Build the React application
# FROM node:18-alpine as builder

# # Set the working directory
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package.json ./
# COPY package-lock.json ./

# # Install dependencies
# RUN npm install --frozen-lockfile

# # Copy the rest of the application code
# COPY . .

# # Build the React app
# RUN npm run build

# # Stage 2: Serve the React application with Nginx
# FROM nginx:alpine

# # Copy the Nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Copy the built React app from the builder stage
# COPY --from=builder /app/build /usr/share/nginx/html

# # Expose port 80
# EXPOSE 80

# # Start Nginx
# CMD ["nginx", "-g", "daemon off;"]

#############################
# Stage 1: Build the React application
FROM node:18-alpine as builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the React application with Nginx
FROM nginx:alpine

# Copy the Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
