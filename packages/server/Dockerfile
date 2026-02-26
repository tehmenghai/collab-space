FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY dist/ ./dist/

ENV PORT=4444
ENV YPERSISTENCE=./yjs-data

EXPOSE 4444

CMD ["node", "dist/index.js"]
