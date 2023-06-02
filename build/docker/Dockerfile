FROM node:latest
LABEL maintainer="milan.unger@siemens-healthineers.com"
ARG version=0.0.0
# Create app directory
WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY build/makehtml/ ./build/makehtml/
COPY src/ ./src/
COPY stencil.config.ts tsconfig.json ./

RUN node build/makehtml/version.js --version ${version}
RUN mkdir src/book/; npm run build 

VOLUME /usr/src/app/book-src/

EXPOSE 3333
EXPOSE 3380
CMD [ "npm", "start" ]

