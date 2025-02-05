# React Dockerfile
FROM node:22 AS build
WORKDIR /FN

# Install dependencies and build React
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Use Nginx to serve the build files
FROM nginx:stable

# Copy React build output to Nginx HTML directory
COPY --from=build /FN/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the Nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Default to bash instead of starting the app
#CMD ["/bin/bash"]

