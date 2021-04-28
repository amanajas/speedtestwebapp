FROM node
EXPOSE 8080
WORKDIR /app/speedtest
COPY . .
RUN npm install
ENTRYPOINT [ "npm" ]
CMD [ "run", "serve" ]