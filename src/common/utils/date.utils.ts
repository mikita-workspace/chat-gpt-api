import { addSeconds, getUnixTime } from 'date-fns';

export const getTimestamp = (date = new Date()) => getUnixTime(date);

export const getModifiedTimestamp = (date = new Date(), extraSeconds = 0) => {
  const modifiedDate = addSeconds(date, extraSeconds);

  return getTimestamp(modifiedDate);
};
