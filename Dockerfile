FROM node:12.18.1
EXPOSE 8080
WORKDIR /app/speedtest
COPY . .
RUN npm install
ENTRYPOINT [ "npm" ]
CMD [ "run", "serve" ]