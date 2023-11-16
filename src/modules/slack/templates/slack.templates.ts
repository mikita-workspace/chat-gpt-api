import { DATE_FORMAT } from 'src/common/constants';
import { formatDate } from 'src/common/utils';
import { Client } from 'src/modules/clients/schemas';

export const newClientTemplate = (client: Client) => {
  const { createdAt, metadata, telegramId } = client;

  const username = metadata?.username || 'username';
  const lastname = metadata?.lastname || '';
  const createdAtFormat = formatDate(createdAt, DATE_FORMAT);

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `New client awaiting approval:\n*${metadata.firstname} ${lastname}*\n<https://t.me/${username}|*@${username}*>`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*ID:*\n${telegramId}\n\n*Created at:*\n${createdAtFormat}\n\n*Language code:*\n${metadata.languageCode}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*If the client is not approved until midnight, the account will be deleted.*',
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'See more in Admin Panel',
          emoji: true,
        },
        value: 'click',
        // TODO: WIll be implemented in scope of this feature: https://app.asana.com/0/1205877070000801/1205877070000804/f
        url: 'https://novachat.admin.io/CRYPTO_ID',
        action_id: 'button-action',
      },
    },
  ];
};
