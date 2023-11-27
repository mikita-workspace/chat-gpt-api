import { Client, Csm, CsmTopic } from '@prisma/client';

import { DATE_FORMAT } from '@/common/constants';
import { formatDate } from '@/common/utils';

export const newCsmPayload = (csm: Csm, csmTopic: CsmTopic, metadata?: Client['metadata']) => {
  const { ticketNumber, status, description, createdAt, telegramId } = csm;

  const username = metadata?.username || 'username';
  const firstname = metadata?.firstname || '';
  const lastname = metadata?.lastname || '';
  const createdAtFormat = formatDate(createdAt, DATE_FORMAT);

  const createdBy = metadata
    ? `*${firstname} ${lastname}*\n<https://t.me/${username}|*@${username}*>`
    : `Telegram ID: *${telegramId}*`;

  return {
    attachments: [
      {
        color: '#64FFDA',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${ticketNumber}*\n\n*Status:*\n${status}\n\n*Topic:*\n${csmTopic.name['en']}\n\n*Created at:*\n${createdAtFormat}\n\n`,
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
                    text: description,
                  },
                ],
              },
            ],
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
        ],
      },
    ],
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `A new CSM issue has been created.\n${createdBy}`,
        },
      },
    ],
  };
};
