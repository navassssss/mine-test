FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Change ownership of the app directory to the node user
RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["npm", "start"]
