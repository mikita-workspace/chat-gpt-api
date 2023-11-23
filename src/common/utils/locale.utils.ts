import { LocaleCode } from '../constants';

export const getAvailableLocale = (locale: string): LocaleCode => {
  const isLocaleAvailable = (Object.values(LocaleCode) as string[]).includes(locale);

  return isLocaleAvailable ? (locale as LocaleCode) : LocaleCode.ENGLISH;
};

export const getMessageByAvailableLocale = (
  message: Record<string, string>,
  targetLocale: string,
) =>
  Object.keys(message).includes(targetLocale) ? message[targetLocale] : message[LocaleCode.ENGLISH];
