import { addDays, addSeconds, getUnixTime } from 'date-fns';

export const getTimestamp = (date = new Date()) => getUnixTime(date);

export const getTimestampPlusSeconds = (sec = 0, startDate = new Date()) => {
  const newDate = addSeconds(startDate, sec);

  return getTimestamp(newDate);
};

export const getTimestampPlusDays = (days = 0, startDate = new Date()) => {
  const newDate = addDays(startDate, days);

  return getTimestamp(newDate);
};
