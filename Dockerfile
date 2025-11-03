# Use Node.js 18 as the base image
FROM node:18-slim

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Install dependencies and nuclei (static binary)
RUN apt-get update && apt-get install -y wget unzip ca-certificates \
    && mkdir -p /app/bin \
    && wget https://github.com/projectdiscovery/nuclei/releases/download/v3.2.0/nuclei_3.2.0_linux_amd64.zip \
    && unzip nuclei_3.2.0_linux_amd64.zip -d /app/bin \
    && chmod +x /app/bin/nuclei \
    && rm nuclei_3.2.0_linux_amd64.zip \
    && apt-get remove -y wget unzip && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Add nuclei to PATH
ENV PATH="/app/bin:${PATH}"

# Verify nuclei installed
RUN /app/bin/nuclei -version || echo "Nuclei failed to run"

# Copy rest of app
COPY . .

EXPOSE 8080
CMD ["node", "index.js"]
