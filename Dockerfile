FROM node:lts-alpine
COPY build/ /app/build/
COPY package.json /app/package.json
RUN cd /app && npm install
ENTRYPOINT cd /app && npm run serve 2>&1
EXPOSE 3000
