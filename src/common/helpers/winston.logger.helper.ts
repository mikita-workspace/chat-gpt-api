import { createLogger, format, transports } from 'winston';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SlackHook = require('winston-slack-webhook-transport');

import { DATE_FORMAT } from '../constants';
import { formatDate, getTimestampUnix } from '../utils';

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
      formatter: (info) => ({
        text: 'API Error',
        attachments: [
          {
            color: '#f44336',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Level:*\n${info.level.toUpperCase()}\n*Source:*\n${
                    info.context
                  }\n\n*Happened at:*\n${formatDate(
                    getTimestampUnix(info.timestamp),
                    DATE_FORMAT,
                  )}`,
                },
              },
              {
                type: 'divider',
              },
              {
                type: 'rich_text',
                elements: [
                  {
                    type: 'rich_text_section',
                    elements: [
                      {
                        type: 'text',
                        text: 'Message:',
                        style: {
                          bold: true,
                        },
                      },
                      {
                        type: 'text',
                        text: `\n${info.message}\n\n`,
                      },
                      {
                        type: 'text',
                        text: 'Stack:',
                        style: {
                          bold: true,
                        },
                      },
                      {
                        type: 'text',
                        text: `\n${JSON.stringify(info.stack)}`,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*New API Error*',
            },
          },
        ],
      }),
    }),
  ],
};

// Export log instance based on the current environment
const instanceLogger = process.env.NODE_ENV === 'production' ? prodLogger : devLogger;

export const instance = createLogger(instanceLogger);
