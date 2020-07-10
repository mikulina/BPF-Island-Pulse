FROM node:10.13.0-alpine

RUN adduser -S -D islandpulse

RUN apk add --update python make gcc g++

WORKDIR /app

RUN chown -R islandpulse /app

USER islandpulse

COPY . .

RUN npm install

USER root

RUN apk del python make gcc g++

USER islandpulse

CMD ["node", "app.js"]