FROM node:12.14.1-alpine3.11

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
