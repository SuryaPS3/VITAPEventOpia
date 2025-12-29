#1. Runtime environment for Node.js applications
FROM node:18

#2. Set the working directory
WORKDIR /app 

#3. Copy package.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the application code
COPY . .

# 6. Expose the application port
EXPOSE 3000

# 7. Start the application
CMD ["npm", "run","start:prod"]

#8. Optional: Set environment variables
ENV NODE_ENV=production