FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p tmp && chown -R node:node /app
USER node
EXPOSE 4200
CMD ["node", "src/server.js"]
