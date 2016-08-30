FROM node:latest

ENV BIN=/usr/local/bin/mr-meeseeks

COPY . /srv/app
WORKDIR /srv/app

RUN npm install && \
    mkdir ~/.ssh && \
    echo -e "Host *\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config && \
    echo '#/bin/sh \n\
set -e \n\
# Set up SSH \n\
echo "$DEPLOY_KEY" > ~/.ssh/id \n\
chmod 600 ~/.ssh/id \n\
eval `ssh-agent -s` \n\
ssh-add ~/.ssh/id \n\
# Set up vault file \n\
echo "$VAULT_PASS" > ~/.vault_pass \n\
# Start application \n\
npm start' >> $BIN && \
    chmod +x $BIN

CMD $BIN
