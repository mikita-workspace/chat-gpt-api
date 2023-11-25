import * as Translate from 'translate-google';

import { LocaleCode } from '../constants';

export const getTranslation = async (
  text: string,
  to: `${LocaleCode}` = LocaleCode.ENGLISH,
): Promise<{ text: string; provider: { name: string; url: string } }> => {
  const translatedText = await Translate(text, { to });

  return {
    text: translatedText,
    provider: {
      name: 'Google Translate API',
      url: 'https://translate.google.com/',
    },
  };
};
