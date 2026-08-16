# Use lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy application files
COPY app/package.json ./
RUN npm install

COPY app/ ./

# Expose port 3000 and run app
EXPOSE 3000
CMD ["npm", "start"]