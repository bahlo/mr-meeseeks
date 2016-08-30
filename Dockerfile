FROM node:latest

ENV BIN=/usr/local/bin/mr-meeseeks

COPY . /srv/app
WORKDIR /srv/app

RUN npm install && \
    mkdir ~/.ssh && \
    echo -e "Host *\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config && \
    echo '#/bin/sh' >> $BIN && \
    echo 'set -e' >> $BIN && \
    echo 'echo "$DEPLOY_KEY" > ~/.ssh/id' >> $BIN && \
    echo 'chmod 600 ~/.ssh/id' >> $BIN && \
    echo 'eval `ssh-agent -s`' >> $BIN && \
    echo 'ssh-add ~/.ssh/id' >> $BIN && \
    echo 'echo "$VAULT_PASS" > ~/.vault_pass' >> $BIN && \
    echo 'npm start' >> $BIN && \
    chmod +x $BIN

CMD $BIN
