FROM node:lts-alpine as build-stage
WORKDIR /app/speedtest
COPY package.json .
RUN npm install
COPY . .
RUN npm run build-prod
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]