# Node LTS image
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci || npm install --silent

# Copy app source
COPY . .

# Expose
EXPOSE 3002

ENV NODE_ENV=production

CMD ["npm", "start"]