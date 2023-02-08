FROM node:lts-alpine
COPY build/ /app/build/
COPY package.json /app/package.json
RUN cd /app && npm install && npm install pm2 -g
ENTRYPOINT cd /app && npm run serve 2>&1
EXPOSE 3000
