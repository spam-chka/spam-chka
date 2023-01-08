FROM node:16
COPY build/ /app/build/
COPY package.json /app/package.json
RUN cd /app && npm install && mkdir logs && touch logs/today.log
ENTRYPOINT cd /app && npm run serve > run.log 2>&1
EXPOSE 3000
