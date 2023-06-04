FROM node:latest
LABEL maintainer="milan.unger@siemens-healthineers.com"
ARG version=0.0.0
ARG title="Book Title"
ARG description="Book Description"
ARG email="someone@somewhere.org"
ARG figure_caption="Figure %d."

# Create app directory
WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY build/makehtml/ ./build/makehtml/
COPY src/ ./src/
COPY dev-utils/ ./dev-utils/
COPY stencil.config.ts tsconfig.json ./
     
RUN mkdir -p src/book/; npm run build 

RUN node build/makehtml/version.js \
     --version ${version} \
     --title "${title}" \
     --description "${description}" \
     --author "${author}" \
     --email "${email}" \
     --image-caption "${figure_caption}" 

VOLUME /usr/src/app/book-src/

EXPOSE 3333
EXPOSE 3380
CMD [ "npm", "run", "serve-spa" ]

