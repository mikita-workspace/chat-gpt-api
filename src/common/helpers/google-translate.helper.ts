import { LocaleCodes } from '../constants';

// NOTE: `translate-google` packages does not support `import`
// eslint-disable-next-line @typescript-eslint/no-var-requires
const translate = require('translate-google');

export const getTranslation = async (
  text: string,
  to: `${LocaleCodes}`,
): Promise<{ text: string; provider: { name: string; url: string } }> => {
  const translatedText = await translate(text, { to });

  return {
    text: translatedText,
    provider: {
      name: 'Google Translate API',
      url: 'https://translate.google.com/',
    },
  };
};
