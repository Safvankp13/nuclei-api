# Use Node.js 18 as the base image
FROM node:18-slim

# Set working directory inside container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Install wget, unzip, and nuclei
RUN apt-get update && apt-get install -y wget unzip \
    && wget https://github.com/projectdiscovery/nuclei/releases/download/v3.2.0/nuclei_3.2.0_linux_amd64.zip \
    && unzip nuclei_3.2.0_linux_amd64.zip -d /usr/local/bin \
    && rm nuclei_3.2.0_linux_amd64.zip \
    && apt-get remove -y wget unzip && apt-get autoremove -y \
    && nuclei -version

# Copy the rest of the code
COPY . .

# Expose API port
EXPOSE 8080

# Start the app
CMD ["node", "index.js"]
