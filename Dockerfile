###############################################################################
# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:24 as build

# Set the working directory
WORKDIR /usr/local/app

# Add the source code to app
COPY ./ /usr/local/app/

# Update web build number.
RUN commit=$(git rev-parse --short HEAD) && sed -i -e "s/buildx/$commit/g" src/environments/environment.ts

# Install all the dependencies
RUN npm install --force

# Generate the build of the application
RUN npm run build

###############################################################################
# Stage 2: Serve dynamic app with node server (SSR).

# Use official node server.
FROM node:24 AS ssr-server

# Set the working directory.
WORKDIR /usr/local/app

# Copy dist files.
COPY --from=build /usr/local/app/dist /usr/local/app/dist/

# Copy packages json file.
COPY ./package.json /usr/local/app/package.json

# Expose port 8080
EXPOSE 8080

# Run HTTP server.
CMD npm run serve:ssr
