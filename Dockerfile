FROM node:lts-alpine
WORKDIR /app
ADD build/ package.json ./
RUN npm install
ENTRYPOINT npm run serve
EXPOSE 3000
