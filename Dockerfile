FROM node:22-alpine
WORKDIR /app
COPY --chown=10001:10001 --chmod=644 server.mjs ./server.mjs
USER 10001:10001
EXPOSE 3000
CMD ["node", "server.mjs"]
