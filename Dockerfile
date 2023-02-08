FROM node:lts-alpine
WORKDIR /app
ADD build/ ./build/
ADD package.json ./
RUN npm install
ENTRYPOINT npm run serve
EXPOSE 3000
