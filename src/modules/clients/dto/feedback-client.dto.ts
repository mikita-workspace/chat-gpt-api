import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { ClientFeedback } from '../constants';

export class FeedbackClientDto {
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
  @IsNotEmpty()
  @IsNumber()
  readonly messageId: number;
  @IsNotEmpty()
  @IsEnum(ClientFeedback)
  @IsString()
  readonly feedback: ClientFeedback;
}
