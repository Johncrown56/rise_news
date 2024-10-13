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
ARG REDIS_URL
ARG REDIS_PORT
ARG REDIS_USERNAME
ARG REDIS_PASSWORD

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
ENV REDIS_URL=$REDIS_URL
ENV REDIS_PORT=$REDIS_PORT
ENV REDIS_USERNAME=$REDIS_USERNAME
ENV REDIS_PASSWORD=$REDIS_PASSWORD

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
