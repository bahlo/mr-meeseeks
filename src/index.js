import 'babel-polyfill';
import winston from 'winston';
import http from 'http';
import serveStatic from 'serve-static';
import finalhandler from 'finalhandler';
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

  // Set variables + fallback
  const logFolder = 'logs';
  const logURL = process.env.LOG_URL || 'http://localhost';
  const port = process.env.PORT || 80;

  // Configure bot
  winston.info('Starting bot');
  const bot = new Bot({
    token: process.env.SLACK_TOKEN,
    channelName: process.env.SLACK_CHANNEL,
    playbookRepo: process.env.PLAYBOOK_REPO,
    logFolder,
    logURL,
  });

  // Configure log server
  const serve = serveStatic(logFolder);
  const logServer = http.createServer((req, res) => {
    serve(req, res, finalhandler(req, res));
  });

  // Start bot
  winston.info('Starting bot');
  bot.start();

  // Start server
  winston.info('Logserver listening on :%d', port);
  logServer.listen(port);
}());
