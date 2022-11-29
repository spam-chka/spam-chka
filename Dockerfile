FROM node:16
COPY . /app
RUN cd /app && npm install
ENTRYPOINT cd /app && npx ts-node src/main.ts
EXPOSE 3000
