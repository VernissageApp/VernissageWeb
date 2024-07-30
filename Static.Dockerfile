###############################################################################
# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:20 as build

# Set the working directory
WORKDIR /usr/local/app

# Add the source code to app
COPY ./ /usr/local/app/

# Update web build number.
RUN commit=$(git rev-parse --short HEAD) && sed -i -e "s/buildx/$commit/g" src/app/pages/support/support.page.html

# Install all the dependencies
RUN npm install --force

# Generate the build of the application
RUN npm run build:ssr

###############################################################################
# Stage 2: Serve static app with nginx server.

# Use official nginx image as the base image
FROM nginx:latest AS client-browser

# Use custom ngix file (for rewriting to index.html).
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output to replace the default nginx contents.
COPY --from=build /usr/local/app/dist/VernissageWeb/browser/ /usr/share/nginx/html

# Expose port 8080
EXPOSE 8080