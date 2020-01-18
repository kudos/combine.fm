FROM node:13.6.0-alpine3.11

WORKDIR /app

RUN apk add --update git python make g++

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn

COPY . .

RUN yarn run build

ENV PORT 3000
EXPOSE 3000

CMD ["yarn", "start"]
