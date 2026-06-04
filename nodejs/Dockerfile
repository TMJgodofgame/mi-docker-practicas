FROM node:lts-alpine

WORKDIR /app

COPY nodejs/package*.json ./
RUN npm install

COPY nodejs/index.js ./index.js
COPY templates/index.html ./index.html
COPY templates/script.js ./script.js

EXPOSE 3000

CMD ["npm", "start"]