import * as installer from '@ffmpeg-installer/ffmpeg';
import { BadRequestException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import * as ffmpeg from 'fluent-ffmpeg';
import { createWriteStream } from 'fs';
import * as path from 'path';

import { removeFile } from '../utils';

export const convertToMp3 = async (input: string, output: string) => {
  const outputPath = path.resolve(path.dirname(input), `${output}.mp3`);

  try {
    ffmpeg.setFfmpegPath(installer.path);

    return await new Promise<string>((resolve, reject) => {
      ffmpeg(input)
        .inputOption('-t 30')
        .output(outputPath)
        .on('end', async () => {
          await removeFile(input);
          resolve(outputPath);
        })
        .on('error', (error) => reject(error))
        .run();
    });
  } catch (error) {
    throw new BadRequestException();
  }
};

export const createOgg = async (url: string, filename: string) => {
  const oggPath = path.resolve(__dirname, '../../../assets', `${filename}.ogg`);

  try {
    const response = await axios({
      method: 'get',
      url,
      responseType: 'stream',
    });

    return await new Promise<string>((resolve) => {
      const stream = createWriteStream(oggPath);

      response.data.pipe(stream);
      stream.on('finish', () => resolve(oggPath));
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new BadRequestException(error.response.data);
    }

    throw new BadRequestException();
  }
};
