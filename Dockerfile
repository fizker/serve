FROM node:erbium-alpine
WORKDIR /fizker/serve

COPY . .

RUN ln -s /fizker/serve/cli.js /bin/serve

WORKDIR /root
