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
  console.log(logLevel());
  winston.level = logLevel();

  winston.info('Creating bot');
  const bot = new Bot({
    slackToken: process.env.SLACK_TOKEN,
  });

  winston.info('Starting bot');
  bot.run();
}());
