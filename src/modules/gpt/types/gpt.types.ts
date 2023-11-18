import { ChatCompletionMessage, CompletionUsage } from 'openai/resources';
import { ClientAccountLevel } from 'src/modules/clients/types';

export type ChatCompletions = {
  clientAccountLevel: ClientAccountLevel;
  message: ChatCompletionMessage;
  usage: CompletionUsage;
};

export type Transcriptions = { text: string };

export type ImagesGenerate = {
  clientAccountLevel: ClientAccountLevel;
  images: {
    bytes: number | null;
    height: number;
    url: string;
    width: number;
  }[];
  revisedPrompt: string;
};
