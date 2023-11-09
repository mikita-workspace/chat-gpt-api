import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { TELEGRAM_API } from './constants';

@Injectable()
export class TelegramService {
  private readonly botUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.botUrl = `${TELEGRAM_API}/bot${this.configService.get('telegram.token')}`;
  }

  async sendMessageToChat(chatId: number, message: string): Promise<void> {
    const url = `${this.botUrl}/sendMessage`;

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
    const url = `${this.botUrl}/getWebhookInfo`;

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
    const url = `${this.botUrl}/setWebhook?url=${host}&drop_pending_updates=true`;

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
    const url = `${this.botUrl}/setWebhook?remove`;

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
    const url = `${this.botUrl}/getUpdates`;

    const { data } = await firstValueFrom(
      this.httpService.get(url).pipe(
        catchError((error: AxiosError) => {
          throw new BadRequestException(error.response.data);
        }),
      ),
    );

    return data;
  }
}
