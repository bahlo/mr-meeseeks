FROM node:latest

ENV BIN=/usr/local/bin/mr-meeseeks

COPY . /srv/app
WORKDIR /srv/app

RUN npm install && \
    mkdir ~/.ssh && \
    echo '#/bin/sh' >> $BIN && \
    echo 'set -e' >> $BIN && \
    echo 'echo "$DEPLOY_KEY" > ~/.ssh/id' >> $BIN && \
    echo 'echo "$VAULT_PASS" > ~/.vault_pass' >> $BIN && \
    echo 'npm start' >> $BIN && \
    chmod +x $BIN

CMD $BIN
