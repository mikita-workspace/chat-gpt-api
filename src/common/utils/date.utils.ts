import {
  addDays,
  addSeconds,
  compareAsc,
  differenceInMilliseconds,
  fromUnixTime,
  getUnixTime,
} from 'date-fns';

import { MIN_IN_MS } from '../constants';

export const getTimestampUnix = (timestamp: number | string | Date = Date.now()) => {
  const date = new Date(timestamp);

  return getUnixTime(date);
};

export const getTimestampPlusSeconds = (sec = 0, startDate = new Date()) => {
  const newDate = addSeconds(startDate, sec);

  return getTimestampUnix(newDate);
};

export const getTimestampPlusDays = (days = 0, startDate = new Date()) => {
  const newDate = addDays(startDate, days);

  return getTimestampUnix(newDate);
};

export const isExpiredDate = (expiredAt: number) =>
  compareAsc(new Date(), fromUnixTime(expiredAt)) > 0;

export const expiresIn = (expiredAt: number) =>
  Math.abs(differenceInMilliseconds(new Date(), expiredAt));

export const fromMsToMins = (ms: number | string) => parseInt(String(ms), 10) / MIN_IN_MS;
