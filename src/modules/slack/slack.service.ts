import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatPostMessageArguments, ErrorCode, WebClient } from '@slack/web-api';

@Injectable()
export class SlackService {
  private slackClient: WebClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.slackClient = new WebClient(configService.get('slack.token'));
  }

  async sendMessage(text: string, channel: string) {
    try {
      if (process.env.NODE_ENV === 'production') {
        const data = await this.slackClient.chat.postMessage({
          channel,
          text,
        });

        this.logger.log(
          `Slack message ${text} has been sent to ${channel}.`,
          'src/modules/slack/slack.service.ts',
        );

        return data;
      }

      return null;
    } catch (error) {
      if (error.code === ErrorCode.PlatformError) {
        throw new BadRequestException(error.message);
      }
    }
  }

  async sendCustomMessage(
    text: string,
    payload: {
      attachments: ChatPostMessageArguments['attachments'];
      blocks: ChatPostMessageArguments['blocks'];
    },
    channel: string,
  ) {
    try {
      if (process.env.NODE_ENV === 'production') {
        const data = await this.slackClient.chat.postMessage({
          text,
          channel,
          ...payload,
        });

        this.logger.log(
          `Slack message ${text} has been sent to ${channel}.`,
          'src/modules/slack/slack.service.ts',
        );

        return data;
      }

      return null;
    } catch (error) {
      if (error.code === ErrorCode.PlatformError) {
        throw new BadRequestException(error.message);
      }
    }
  }
}
