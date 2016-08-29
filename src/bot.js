import winston from 'winston';
import Botkit from 'botkit';

export default class Bot {
  constructor({ token, channelName }) {
    this.token = token;
    this.channelName = channelName;

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
        throw new Error('Could not determine id of #%s', this.channelName);
      }

      // Listen to new commands
      this.controller.hears('deploy .+ .*', ['direct_mention'], this.handle);
    });
  }

  handle(bot, message) {
    bot.reply(message, 'Hi');
  }
}
