FROM node:22-alpine
WORKDIR /app
COPY server.mjs .
USER 10001:10001
EXPOSE 3000
CMD ["node", "server.mjs"]
