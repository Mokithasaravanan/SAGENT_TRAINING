# Use already built files instead of downloading inside Docker
FROM node:18-alpine AS build

WORKDIR /app

# Copy everything including node_modules
COPY package.json ./

# Use legacy peer deps to avoid network issues
RUN npm install --prefer-offline --legacy-peer-deps || npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
