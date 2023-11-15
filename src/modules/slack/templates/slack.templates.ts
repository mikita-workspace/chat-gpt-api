import { DATE_FORMAT } from 'src/common/constants';
import { formatDate } from 'src/common/utils';
import { Client } from 'src/modules/clients/schemas';

export const newClientTemplate = (client: Client) => {
  const { createdAt, metadata, telegramId, rate } = client;

  const username = metadata.username || 'username';
  const createdAtFormat = formatDate(createdAt, DATE_FORMAT);
  const expiresAtFormat = formatDate(rate.expiresAt, DATE_FORMAT);

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'New Client Awaiting Your Approval',
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Submitted by *${metadata.firstname} ${metadata?.lastname}*`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<https://t.me/${username}|*@${username}*>\n\n*ID* ${telegramId}\n*Created at* ${createdAtFormat}\n\n*Rate*: ${rate.name} ${rate.symbol}\n*Expires at* ${expiresAtFormat}\n\n*Language* ${metadata.languageCode}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<https://admin/${telegramId}|*See more in Admin Panel*>`,
      },
    },
  ];
};
