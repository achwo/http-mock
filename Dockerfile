FROM node:15.5.1-alpine3.12

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --immutable && yarn cache clean

COPY . .

ENV CI=true
RUN yarn test:ci

USER node
EXPOSE 3000
HEALTHCHECK CMD wget -q -O /dev/null http://localhost:3000/
CMD ["node", "index.js"]

