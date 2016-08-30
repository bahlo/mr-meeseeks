import winston from 'winston';
import Botkit from 'botkit';
import superb from 'superb';
import prettyMs from 'pretty-ms';
import Ansible from './ansible';

function buildReply({ text, color, start, user, logURL }) {
  const now = Date.now();
  const ms = now - start;

  return {
    response_type: 'in_channel',
    attachments: [{
      mrkdwn_in: ['text'],
      text: `${text}\n<${logURL}|View log>`,
      color,
      footer: 'I\'m Mr. Meeseeks! Look at me!',
      fields: [{
        title: 'Duration',
        value: prettyMs(ms),
        short: true,
      }, {
        title: 'Started by',
        value: `<@${user}>`,
        short: true,
      }],
      ts: now / 1000,
    }],
  };
}

export default class Bot {
  constructor({ token, channelName, playbookRepo, playbook, logFolder,
    logURL }) {
    this.token = token;
    this.channelName = channelName;
    this.playbookRepo = playbookRepo;
    this.playbook = playbook;
    this.logFolder = logFolder;
    this.logURL = logURL;

    this.controller = Botkit.slackbot({
      debug: false,
    });
  }

  start() {
    winston.debug('Connecting to Slack');
    this.controller.spawn({
      token: this.token,
    }).startRTM((err, bot, payload) => {
      if (err) {
        throw new Error(err);
      }

      // Find the id of the allowed channel
      winston.debug(`Looping channels to find #${this.channelName}`);
      const channel = payload.channels.filter(chan =>
        chan.name === this.channelName)[0];
      if (!channel) {
        throw new Error(`Could not determine id of #${this.channelName}`);
      }
      this.channelID = channel.id;
      winston.debug('Got channel id', this.channelID);

      winston.debug('Start listening for mentions');
      this.controller.hears('deploy ([a-zA-Z0-9_-]+) ?([a-zA-Z0-9_-]+)?',
        ['direct_mention'], this.handle.bind(this));
    });
  }

  handle(bot, message) {
    winston.debug('Checking channel id');
    if (message.channel !== this.channelID) {
      bot.reply(message, `Please tell me that again in #${this.channelName}`);
      return;
    }

    const appName = `${message.match[1]} ${message.match[2] || ''}`
      .trim()
      .toLowerCase();
    const tag = `deploy_${appName.replace(/[ -]/g, '_')}`;

    bot.reply(message,
      `:inbox_tray: Starting deployment of  the ${superb()} \`${appName}\``);

    const ansible = new Ansible({
      logFolder: this.logFolder,
      repo: this.playbookRepo,
      playbook: this.playbook,
    });
    const start = Date.now();
    ansible.run(tag).then((logFile) => {
      const reply = buildReply({
        text: `:white_check_mark: Deployed *${appName}*`,
        fallback: `Deployed ${appName}`,
        color: 'good',
        start,
        user: message.user,
        logURL: `${this.logURL}/${logFile}`,
      });
      winston.debug('Sending reply:', reply);
      bot.reply(message, reply);
    }, ({ err, logFile }) => {
      const reply = buildReply({
        text: `:x: Deployment of *${appName}* failed: \n\`\`\`${err}\`\`\``,
        fallback: `Deployment of ${appName} failed`,
        color: 'danger',
        start,
        user: message.user,
        logURL: `${this.logURL}/${logFile}`,
      });
      winston.debug('Sending reply:', reply);
      bot.reply(message, reply);
    });
  }
}
