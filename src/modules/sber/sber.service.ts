import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { Cache as CacheManager } from 'cache-manager';
import { createReadStream } from 'fs';
import * as https from 'https';
import { ChatCompletionMessageParam } from 'openai/resources';
import { catchError, delay, firstValueFrom } from 'rxjs';
import { expiresInMs } from 'src/common/utils';

import {
  GIGA_CHAT,
  GIGA_CHAT_ACCESS_TOKEN,
  GIGACHAT_API_PERS,
  SALUTE_SPEECH_ACCESS_TOKEN,
  SALUTE_SPEECH_PERS,
  SBER_OAUTH,
  SMART_SPEEECH,
} from './constants';

@Injectable()
export class SberService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheManager,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private async getAccessToken({
    speech = false,
    chat = false,
  }: {
    speech?: boolean;
    chat?: boolean;
  }): Promise<string> {
    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      RqUID: '6f0b1291-c7f3-43c6-bb2e-9f3efb2dc98e',
      Authorization: '',
    };
    let scope = '';
    let cacheToken = '';

    if (chat) {
      cacheToken = GIGA_CHAT_ACCESS_TOKEN;

      const cachedGigaChatAccessToken = await this.cacheManager.get<string>(cacheToken);

      if (cachedGigaChatAccessToken) {
        return cachedGigaChatAccessToken;
      }

      headers = {
        ...headers,
        Authorization: `Bearer ${this.configService.get('sber.chatToken')}`,
      };

      scope = GIGACHAT_API_PERS;
    }

    if (speech) {
      cacheToken = SALUTE_SPEECH_ACCESS_TOKEN;

      const cachedSaluteSpeechAccessToken = await this.cacheManager.get<string>(cacheToken);

      if (cachedSaluteSpeechAccessToken) {
        return cachedSaluteSpeechAccessToken;
      }

      headers = {
        ...headers,
        Authorization: `Bearer ${this.configService.get('sber.speechToken')}`,
      };

      scope = SALUTE_SPEECH_PERS;
    }

    const { data } = await firstValueFrom(
      this.httpService
        .post(
          SBER_OAUTH,
          { scope },
          {
            headers,
            // NOTE: TLS certificate is disabled
            httpsAgent: new https.Agent({
              rejectUnauthorized: false,
            }),
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw new BadRequestException(error.response.data);
          }),
        ),
    );

    await this.cacheManager.set(cacheToken, data.access_token, expiresInMs(data.expires_at));

    return data.access_token;
  }

  async completions(messages: ChatCompletionMessageParam[], options: { model: string }) {
    const { model } = options;

    const accessToken = await this.getAccessToken({ chat: true });

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-Request-ID': '79e41a5f-f180-4c7a-b2d9-393086ae20a1',
      'X-Session-ID': 'b6874da0-bf06-410b-a150-fd5f9164a0b2',
      'X-Client-ID': 'b6874da0-bf06-410b-a150-fd5f9164a0b2',
    };

    const { data: completions } = await firstValueFrom(
      this.httpService
        .post(
          `${GIGA_CHAT}/chat/completions`,
          {
            max_tokens: 512,
            messages,
            model,
            n: 1,
            repetition_penalty: 1.07,
            stream: false,
            temperature: 0.87,
            top_p: 0.47,
            update_interval: 0,
          },
          {
            headers,
            // NOTE: TLS certificate is disabled
            httpsAgent: new https.Agent({
              rejectUnauthorized: false,
            }),
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw new BadRequestException(error.response.data);
          }),
        ),
    );

    return completions;
  }

  async transcriptions(filePath: string, options: { model: string }) {
    const { model } = options;

    const accessToken = await this.getAccessToken({ speech: true });

    const commonHeaders = {
      Authorization: `Bearer ${accessToken}`,
    };

    const { data: upload } = await firstValueFrom(
      this.httpService
        .post(`${SMART_SPEEECH}/data:upload`, createReadStream(filePath), {
          headers: { ...commonHeaders, 'Content-Type': 'audio/mpeg' },
          // NOTE: TLS certificate is disabled
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new BadRequestException(error.response.data);
          }),
        ),
    );

    const { data: recognize } = await firstValueFrom(
      this.httpService
        .post(
          `${SMART_SPEEECH}/speech:async_recognize`,
          {
            options: {
              model,
              audio_encoding: 'MP3',
              channels_count: 1,
            },
            request_file_id: upload.result.request_file_id,
          },
          {
            headers: { ...commonHeaders, 'Content-Type': 'application/json' },
            // NOTE: TLS certificate is disabled
            httpsAgent: new https.Agent({
              rejectUnauthorized: false,
            }),
          },
        )
        // NOTE: Delay is depend on length of input file
        // TODO: calculate delay
        .pipe(delay(2000))
        .pipe(
          catchError((error: AxiosError) => {
            throw new BadRequestException(error.response.data);
          }),
        ),
    );

    const { data: status } = await firstValueFrom(
      this.httpService
        .get(`${SMART_SPEEECH}/task:get?id=${recognize.result.id}`, {
          headers: commonHeaders,
          // NOTE: TLS certificate is disabled
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new BadRequestException(error.response.data);
          }),
        ),
    );

    const { data: download } = await firstValueFrom(
      this.httpService
        .get(`${SMART_SPEEECH}/data:download?response_file_id=${status.result.response_file_id}`, {
          headers: commonHeaders,
          // NOTE: TLS certificate is disabled
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new BadRequestException(error.response.data);
          }),
        ),
    );

    return { text: download[0].results[0].normalized_text };
  }
}
