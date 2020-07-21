FROM node:latest

WORKDIR /opt/cxsizing

COPY ./package.json ./package.json
COPY ./src ./src
COPY ./data ./data

RUN npm install && \
    ls -la

ENTRYPOINT ["node", "src/index.js"]