import {
  addDays,
  addSeconds,
  compareAsc,
  differenceInMilliseconds,
  fromUnixTime,
  getUnixTime,
} from 'date-fns';

export const getTimestampUnix = (date = new Date()) => getUnixTime(date);

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
