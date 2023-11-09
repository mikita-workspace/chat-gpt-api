import { Controller } from '@nestjs/common';

import { GptService } from './gpt.service';

@Controller('api/gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}
}
