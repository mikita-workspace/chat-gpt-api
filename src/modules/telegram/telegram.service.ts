import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
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
  ) {
    this.commonUrl = `${TELEGRAM_API}/bot${this.configService.get('telegram.token')}`;
    this.fileUrl = `${TELEGRAM_API}/file/bot${this.configService.get('telegram.token')}`;
  }

  async sendMessageToChat(chatId: number, message: string): Promise<void> {
    const url = `${this.commonUrl}/sendMessage`;

    await firstValueFrom(
      this.httpService
        .post(url, {
          chat_id: chatId,
          text: message,
          disable_notification: true,
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new BadRequestException(error.response.data);
          }),
        ),
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

  async downloadVoiceMessage(voicePathApi: string, telegramId: number) {
    const url = `${this.fileUrl}/${voicePathApi}`;

    const oggPath = await createOgg(url, String(telegramId));
    const mp3Path = await convertToMp3(oggPath, String(telegramId));

    return mp3Path || '';
  }
}
