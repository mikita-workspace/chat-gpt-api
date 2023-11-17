import { DATE_FORMAT } from 'src/common/constants';
import { formatDate, getTimestampUnix } from 'src/common/utils';

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
              text: `*Level:*\n${level.toUpperCase()}\n*Source:*\n${context}\n\n*Happened at:*\n${formatDate(
                getTimestampUnix(timestamp),
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
                    text: `\n${message}\n\n`,
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
                    text: `\n${JSON.stringify(stack)}`,
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
          text: `'*New Error ${process.env.API_NAME}*`,
        },
      },
    ],
    text: `${process.env.API_NAME} Error`,
  };
};
