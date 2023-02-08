FROM node:lts-alpine
COPY build/ /app/build/
COPY package.json /app/package.json
RUN cd /app && npm install && npm install pm2 -g
ENTRYPOINT pm2-runtime /app/build/main.js
EXPOSE 3000
