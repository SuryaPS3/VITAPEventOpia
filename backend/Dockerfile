#1. Runtime environment for Node.js applications
FROM node:20

#2. Set the working directory
WORKDIR /app 

#3. Copy package.json
COPY package*.json ./

#4. Set environment variables
ENV NODE_ENV=production

# 5. Install dependencies
RUN npm ci --omit=dev

# 6. Copy the rest of the application code
COPY . .

# 7. Expose the application port
EXPOSE 3000

# 8. Start the application
CMD ["npm", "run","start:prod"]