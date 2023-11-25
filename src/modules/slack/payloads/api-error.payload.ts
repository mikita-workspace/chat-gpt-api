import * as json2md from 'json2md';

import { DATE_FORMAT } from '@/common/constants';
import { formatDate, getTimestampUtc } from '@/common/utils';

export const apiErrorPayload = (error: any) => {
  const { level, timestamp, context, message, stack } = error;

  return {
    attachments: [
      {
        color: '#f44336',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Level:*\n${level.toUpperCase()}\n\n*Source:*\n${context}\n\n*Happened at:*\n${formatDate(
                getTimestampUtc(timestamp),
                DATE_FORMAT,
              )}`,
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Message:*\n${message}\n\n*Stack:*\n${json2md([
                {
                  code: {
                    language: 'json',
                    content: JSON.stringify(stack),
                  },
                },
              ])}`,
            },
          },
        ],
      },
    ],
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*New Error in ${process.env.API_NAME}*`,
        },
      },
    ],
    text: `${process.env.API_NAME} Error`,
  };
};
