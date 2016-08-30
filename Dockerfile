FROM node:latest

ENV BIN=/usr/local/bin/mr-meeseeks

COPY . /srv/app
WORKDIR /srv/app

RUN npm install && \
    mkdir ~/.ssh && \
    echo 'echo "$DEPLOY_KEY" > ~/.ssh/id && npm start' \ > $BIN && \
    chmod +x $BIN

CMD $BIN
