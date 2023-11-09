import { unlink } from 'fs/promises';

export const isBoolean = (value: unknown) => typeof value === 'boolean';

export const removeFile = async (path: string) => await unlink(path);
