FROM node
COPY build/ /app/build/
COPY package.json /app/package.json
RUN cd /app && npm install
ENTRYPOINT npm run serve
EXPOSE 3000
