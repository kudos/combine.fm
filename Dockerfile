FROM node:0.12.0-slim
MAINTAINER Jonathan Cremin <jonathan@crem.in>

ADD   package.json package.json
RUN   npm install
COPY   . .

RUN   npm run build
EXPOSE 3000

CMD   npm start