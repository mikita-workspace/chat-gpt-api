import {
  addDays,
  addMilliseconds,
  addSeconds,
  compareAsc,
  differenceInMilliseconds,
  format,
  formatDistance,
  fromUnixTime,
  getUnixTime,
} from 'date-fns';
import { be, enUS, ru } from 'date-fns/locale';

import { LocaleCodes, MIN_IN_MS } from '../constants';

export const convertLocale = (locale: string) => {
  switch (locale) {
    case LocaleCodes.RUSSIAN:
      return ru;
    case LocaleCodes.BELORUSSIAN:
      return be;
    default:
      return enUS;
  }
};

export const getTimestampUnix = (timestamp: number | string | Date = Date.now()) => {
  const date = new Date(timestamp);

  return getUnixTime(date);
};

export const getTimestampPlusMilliseconds = (ms = 0, startDate = new Date()) => {
  const newDate = addMilliseconds(startDate, ms);

  return getTimestampUnix(newDate);
};

export const getTimestampPlusSeconds = (sec = 0, startDate = new Date()) => {
  const newDate = addSeconds(startDate, sec);

  return getTimestampUnix(newDate);
};

export const getTimestampPlusDays = (days = 0, startDate = new Date()) => addDays(startDate, days);

export const isExpiredDate = (expiredAt: number) =>
  compareAsc(new Date(), fromUnixTime(expiredAt)) > 0;

export const expiresInMs = (expiredAt: number) =>
  Math.abs(differenceInMilliseconds(new Date(), expiredAt));

export const fromMsToMins = (ms: number | string) => parseInt(String(ms), 10) / MIN_IN_MS;

export const expiresInFormat = (expiredAt: number, locale = 'en') => {
  const clientLocale = convertLocale(locale);

  return formatDistance(fromUnixTime(expiredAt), new Date(), {
    addSuffix: true,
    locale: clientLocale,
  });
};

export const formatDate = (date: number, template: string, locale = 'en') => {
  const clientLocale = convertLocale(locale);

  return format(fromUnixTime(date), template, { locale: clientLocale });
};
