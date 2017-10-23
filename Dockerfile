FROM node:8.7.0-alpine

WORKDIR /app

RUN apk add --update git

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn

COPY . .

RUN yarn run build

ENV PORT 3000
EXPOSE 3000

CMD ["yarn", "start"]
