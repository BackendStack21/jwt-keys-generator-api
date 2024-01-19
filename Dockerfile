FROM node:20-alpine
RUN apk add --no-cache tini openssl

WORKDIR /home/node/app
RUN mkdir -p /home/node/app/keys

COPY package*.json ./
COPY *.js ./
RUN npm ci --production

EXPOSE 3000

ENTRYPOINT ["tini", "--"]
CMD [ "node", "server.js" ]
