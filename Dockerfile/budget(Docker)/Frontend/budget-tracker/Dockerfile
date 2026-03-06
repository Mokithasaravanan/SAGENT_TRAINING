FROM node:18-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

# Skip postinstall script and install
RUN npm install --legacy-peer-deps --ignore-scripts

COPY . .

EXPOSE 3000

ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "start"]