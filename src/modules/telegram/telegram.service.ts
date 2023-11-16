import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import { catchError, firstValueFrom } from 'rxjs';
import { convertToMp3, createOgg } from 'src/common/helpers';

import { TELEGRAM_API } from './constants';

@Injectable()
export class TelegramService {
  private readonly commonUrl: string;
  private readonly fileUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly logger: Logger,
  ) {
    this.commonUrl = `${TELEGRAM_API}/bot${this.configService.get('telegram.token')}`;
    this.fileUrl = `${TELEGRAM_API}/file/bot${this.configService.get('telegram.token')}`;
  }

  async sendMessageToChat(
    telegramId: number,
    message: string,
    options: { parsedMode?: 'HTML' | 'Markdown' },
  ) {
    const url = `${this.commonUrl}/sendMessage`;

    await firstValueFrom(
      this.httpService
        .post(url, {
          chat_id: telegramId,
          disable_notification: true,
          disable_web_page_preview: true,
          parse_mode: options?.parsedMode,
          text: message,
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new BadRequestException(error.response.data);
          }),
        ),
    );

    this.logger.log(
      `Telegram message ${message} has been sent to ${telegramId}.`,
      'src/modules/telegram/telegram.service.ts',
    );
  }

  async getWebhookInfo(): Promise<unknown> {
    const url = `${this.commonUrl}/getWebhookInfo`;

    const { data } = await firstValueFrom(
      this.httpService.get(url).pipe(
        catchError((error: AxiosError) => {
          throw new BadRequestException(error.response.data);
        }),
      ),
    );

    return data;
  }

  async setWebhook(host: string): Promise<unknown> {
    const url = `${this.commonUrl}/setWebhook?url=${host}&drop_pending_updates=true`;

    const { data } = await firstValueFrom(
      this.httpService.post(url).pipe(
        catchError((error: AxiosError) => {
          throw new BadRequestException(error.response.data);
        }),
      ),
    );

    this.logger.log(`Webhook ${host} was set`, 'src/modules/telegram/telegram.service.ts');

    return data;
  }

  async removeWebhook(): Promise<unknown> {
    const url = `${this.commonUrl}/setWebhook?remove`;

    const { data } = await firstValueFrom(
      this.httpService.post(url).pipe(
        catchError((error: AxiosError) => {
          throw new BadRequestException(error.response.data);
        }),
      ),
    );

    this.logger.log(`Webhook was removed`, 'src/modules/telegram/telegram.service.ts');

    return data;
  }

  async getUpdates(): Promise<unknown> {
    const url = `${this.commonUrl}/getUpdates`;

    const { data } = await firstValueFrom(
      this.httpService.get(url).pipe(
        catchError((error: AxiosError) => {
          throw new BadRequestException(error.response.data);
        }),
      ),
    );

    return data;
  }

  async getMe(): Promise<unknown> {
    const url = `${this.commonUrl}/getMe`;

    const { data } = await firstValueFrom(
      this.httpService.get(url).pipe(
        catchError((error: AxiosError) => {
          throw new BadRequestException(error.response.data);
        }),
      ),
    );

    return data;
  }

  async getFile(filename: string, telegramId: number) {
    const url = `${this.fileUrl}/${filename}`;

    const oggPath = await createOgg(url, String(telegramId));
    const mp3Path = await convertToMp3(oggPath, String(telegramId));

    const duration = await getAudioDurationInSeconds(mp3Path);

    return { filePath: mp3Path || '', duration: duration * 1000 };
  }
}
