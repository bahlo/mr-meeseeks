import winston from 'winston';
import Botkit from 'botkit';
import superb from 'superb';
import prettyMs from 'pretty-ms';
import Ansible from './ansible';

export default class Bot {
  constructor({ token, channelName, playbookRepo }) {
    this.token = token;
    this.channelName = channelName;
    this.playbookRepo = playbookRepo;

    this.controller = Botkit.slackbot({
      debug: false,
    });
  }

  start() {
    winston.info('Spawning controller');
    this.controller.spawn({
      token: this.token,
    }).startRTM((err, bot, payload) => {
      if (err) {
        throw new Error('Could not connect to Slack');
      }

      // Find the id of the allowed channel
      this.channelID = payload.channels.filter(channel =>
        channel.name === this.channelName)[0];
      if (!this.channelID) {
        throw new Error(`Could not determine id of #${this.channelName}`);
      }

      this.controller.hears('deploy ([a-zA-Z0-9_-]+) ([a-zA-Z0-9_-]*)', 
        ['direct_mention'], this.handle);
    });
  }

  handle(bot, message) {
    if (message.channel !== this.channelID) {
      bot.reply(message, `Please tell me that again in ${this.channelID}`);
      return;
    }

    const appName = `${message.match[1]} ${message.match[2]}`
      .trim()
      .toLowerCase();
    const tag = `deploy_${appName.replace(' ', '_')}`;

    bot.reply(message, `Deploying the ${superb()} ${appName}`);

    const ansible = new Ansible(this.playbookRepo);
    const start = (new Date()).getMilliseconds();
    ansible.run(tag, (err, stdout) => {
      const ms = (new Date()).getMilliseconds() - start;

      const reply = {
        mrkdwn_in: ['text', 'pretext'],
        // eslint-disable-next-line prefer-template
        text: '```\n' + stdout + '\n```',
        footer: 'I\'m Mr. Meeseeks! Look at me!',
        fields: [{
          title: 'Duration',
          value: prettyMs(ms),
          short: true,
        }, {
          title: 'Started by',
          value: message.user,
          short: true,
        }],
      };

      if (err) {
        reply.pretext = `Deployment of *${appName}* failed :sob:`;
        reply.color = 'danger';
      } else {
        reply.pretext = `Deployed *${appName}* :tada:`;
        reply.color = 'good';
      }

      bot.reply(message, reply);
    });
  }
}
