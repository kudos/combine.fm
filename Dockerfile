FROM mhart/alpine-node
MAINTAINER Jonathan Cremin <jonathan@crem.in>

WORKDIR /app

RUN apk add --update make gcc g++ python git

COPY package.json package.json

RUN npm install

RUN apk del make gcc g++ python git && \
  rm -rf /tmp/* /var/cache/apk/* /root/.npm /root/.node-gyp

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
