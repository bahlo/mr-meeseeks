import 'babel-polyfill';
import winston from 'winston';
import Bot from './bot';

function logLevel() {
  if (process.env.DEBUG && (
    process.env.DEBUG === '*' ||
    process.env.DEBUG.includes('mr-meeseeks'))) {
    return 'debug';
  }

  return 'info';
}

(function main() {
  // Configure logger
  winston.remove(winston.transports.Console)
    .add(winston.transports.Console, {
      level: logLevel(),
      prettyPrint: true,
      colorize: true,
      silent: false,
      timestamp: false,
    });

  // Configure bot
  winston.info('Starting bot');
  const bot = new Bot({
    token: process.env.SLACK_TOKEN,
    channelName: process.env.SLACK_CHANNEL,
    playbookRepo: process.env.PLAYBOOK_REPO,
  });

  // Start
  bot.start();
}());
