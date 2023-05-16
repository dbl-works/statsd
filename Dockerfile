# https://github.com/statsd/statsd/blob/master/Dockerfile
FROM node:20-alpine3.17

RUN apk update && apk add --no-cache git
RUN git clone --branch v0.10.1 https://github.com/statsd/statsd.git /usr/src/app

WORKDIR /usr/src/app

# Setup node envs
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

# Install dependencies
# COPY package.json /usr/src/app/
RUN npm install && npm cache clean --force

# # Copy required src (see .dockerignore)
# COPY . /usr/src/app

COPY config.js /usr/src/app/statsd-config.js
COPY backends/cloudwatch.js /usr/src/app/backends/cloudwatch.js

# Expose required ports
EXPOSE 8125/udp
EXPOSE 8126

ENTRYPOINT [ "node", "stats.js", "statsd-config.js" ]
