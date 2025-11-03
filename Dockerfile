# Use Node.js 18 as the base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Install wget, unzip, and Nuclei into /app/bin
RUN apt-get update && apt-get install -y wget unzip \
    && mkdir -p /app/bin \
    && wget https://github.com/projectdiscovery/nuclei/releases/download/v3.2.0/nuclei_3.2.0_linux_amd64.zip \
    && unzip nuclei_3.2.0_linux_amd64.zip -d /app/bin \
    && chmod +x /app/bin/nuclei \
    && rm nuclei_3.2.0_linux_amd64.zip \
    && apt-get remove -y wget unzip && apt-get autoremove -y

# Add nuclei to PATH
ENV PATH="/app/bin:${PATH}"

# Copy remaining code
COPY . .

# Expose API port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
