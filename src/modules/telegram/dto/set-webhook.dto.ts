import { IsNotEmpty, IsUrl } from 'class-validator';

export class SetWebhookDto {
  @IsNotEmpty()
  @IsUrl()
  readonly host: string;
}
