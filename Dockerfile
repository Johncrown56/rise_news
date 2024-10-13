FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application source code to the container
COPY . .

# Expose the port the app will run on
EXPOSE 3000

# Set environment variables
ARG PORT
ARG NODE_ENV
ARG DB_TYPE
ARG DB_HOST
ARG DB_PORT
ARG DB_USERNAME
ARG DB_PASSWORD
ARG DB_DATABASE
ARG JWT_SECRET
ARG JWT_EXPIRATION

# ENV NODE_ENV=production
ENV PORT=$PORT
ENV NODE_ENV=$NODE_ENV
ENV DB_TYPE=$DB_TYPE
ENV DB_HOST=$DB_HOST
ENV DB_PORT=$DB_PORT
ENV DB_USERNAME=$DB_USERNAME
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_DATABASE=$DATABASE
ENV JWT_SECRET=$JWT_SECRET
ENV JWT_EXPIRATION=$JWT_EXPIRATION

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
