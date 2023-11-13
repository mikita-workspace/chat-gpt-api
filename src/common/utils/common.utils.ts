import { unlink } from 'fs/promises';

export const isBoolean = (value: unknown) => typeof value === 'boolean';

export const removeFile = async (path: string) => await unlink(path);

export const copyObject = (object: object) => JSON.parse(JSON.stringify(object));

export const delay = async (delayInMs: number) => {
  return new Promise((resolve) => setTimeout(resolve, delayInMs));
};
