FROM node:16
COPY build/ /app/build/
COPY package.json /app/package.json
RUN cd /app && npm install
ENTRYPOINT cd /app && npm run serve
EXPOSE 3000
