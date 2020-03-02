FROM node:10.15.3-alpine

WORKDIR /opt/cx/sizing

COPY ./package.json ./package.json
COPY ./src ./src

ENV CUSTOMER=Miguel
ENV ENV=localhost

ENV CX_SERVER=https://cxsast
ENV CX_USERNAME=
ENV CX_PASSWORD=

ENV ES_SERVER=https://elk:9200
ENV ES_VERSION=7.2
ENV ES_INDEX_PREFIX=cx_sizing_scans
ENV ES_ID_SECRET=cx_sizing

RUN npm install

ENTRYPOINT ["node", "src/index.js"]