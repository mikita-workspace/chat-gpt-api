import { DATE_FORMAT } from '@/common/constants';
import { formatDate } from '@/common/utils';
import { Client } from '@/modules/clients/schemas';

export const newClientPayload = (client: Client) => {
  const { createdAt, metadata, telegramId } = client;

  const username = metadata?.username || 'username';
  const lastname = metadata?.lastname || '';
  const createdAtFormat = formatDate(createdAt, DATE_FORMAT);

  return {
    attachments: [
      {
        color: '#6200EE',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*ID:*\n${telegramId}\n\n*Created at:*\n${createdAtFormat}\n\n*Language code:*\n${metadata.languageCode}`,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'See more in Admin Panel',
                  emoji: true,
                },
                value: 'click',
                url: 'https://novachat.admin.io/CRYPTO_ID',
                action_id: 'button-action',
              },
            ],
          },
          {
            type: 'rich_text',
            elements: [
              {
                type: 'rich_text_section',
                elements: [
                  {
                    type: 'text',
                    text: 'Note: ',
                    style: {
                      bold: true,
                    },
                  },
                  {
                    type: 'text',
                    text: 'Unauthorized accounts are deleted every 24 hours.',
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
          text: `New client awaiting approval:\n*${metadata.firstname} ${lastname}*\n<https://t.me/${username}|*@${username}*>`,
        },
      },
    ],
  };
};
