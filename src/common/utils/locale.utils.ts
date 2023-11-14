import { LocaleCodes } from '../constants';

export const getAvailableLocale = (locale: string): LocaleCodes => {
  const isLocaleAvailable = (Object.values(LocaleCodes) as string[]).includes(locale);

  return isLocaleAvailable ? (locale as LocaleCodes) : LocaleCodes.ENGLISH;
};
