import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ChatCompletionMessageParam } from 'openai/resources';

export class ChatCompletionDto {
  @IsNotEmpty()
  @IsArray()
  readonly messages: ChatCompletionMessageParam[];
  @IsNotEmpty()
  @IsString()
  readonly model: string;
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
}
