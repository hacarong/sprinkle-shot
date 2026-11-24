# Railway는 저장소 루트의 Dockerfile을 자동으로 사용합니다.
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server ./server
COPY client ./client
USER node
# Railway가 PORT를 주입합니다. 로컬 기본값은 8080입니다.
EXPOSE 8080
CMD ["node", "server/index.js"]
