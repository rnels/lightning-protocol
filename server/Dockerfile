# TODO: Update with ts build(?) would need to run build script similar to client docker file
FROM node:16
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Installs dependencies for production
RUN npm install --omit-dev

# Bundle app source
COPY . .

EXPOSE 3000

CMD [ "node", "src/index.js" ]
