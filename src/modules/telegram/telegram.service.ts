import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class TelegramService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async sendTelegramMessage(chatId: number, message: string): Promise<any> {
    const url = `${this.configService.get('externalApis.telegram')}/bot${this.configService.get(
      'tokens.telegram',
    )}/sendMessage`;

    const { data } = await firstValueFrom(
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

    return data;
  }
}
