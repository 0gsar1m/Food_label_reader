FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY server ./server
COPY shared ./shared
RUN npm run build:api

FROM node:24-alpine
WORKDIR /app
COPY --from=build /app/dist-api/server.cjs ./server.cjs
ENV NODE_ENV=production PORT=8787
EXPOSE 8787
USER node
CMD ["node", "server.cjs"]
