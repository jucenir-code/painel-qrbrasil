# Dockerfile para Next.js
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN NEXTJS_IGNORE_ESLINT_ERRORS=true npm run build

EXPOSE 3000

CMD ["npm", "start"] 