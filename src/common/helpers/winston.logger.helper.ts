import { createLogger, format, transports } from 'winston';
// NOTE: `winston-slack-webhook-transport` packages does not support `import`
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SlackHook = require('winston-slack-webhook-transport');

import { apiErrorPayload } from 'src/modules/slack/payloads';

const customFormat = format.printf((info) => {
  const { timestamp, level, message, ...args } = info;

  const ts = timestamp.slice(0, 19).replace('T', ' ');
  return `${ts} [${level}]: ${message} ${
    Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
  }`;
});

const options = {
  file: {
    filename: 'error.log',
    level: 'error',
  },
  console: {
    level: 'info',
  },
};

// For Development environment
const devLogger = {
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.errors({ stack: true }),
    customFormat,
  ),
  transports: [new transports.Console(options.console)],
};

// For Production environment
const prodLogger = {
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  transports: [
    new transports.File(options.file),
    new transports.File({
      filename: 'combine.log',
      level: 'info',
    }),
    new SlackHook({
      level: 'error',
      webhookUrl: process.env.SLACK_WEBHOOK,
      formatter: (error: any) => apiErrorPayload(error),
    }),
  ],
};

// Export log instance based on the current environment
const instanceLogger = process.env.NODE_ENV === 'production' ? prodLogger : devLogger;

export const instance = createLogger(instanceLogger);
