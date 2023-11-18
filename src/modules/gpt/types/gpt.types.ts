import { ChatCompletionMessage, CompletionUsage } from 'openai/resources';
import { ClientAccountLevel } from 'src/modules/clients/types';

export type ChatCompletions = {
  clientRate: ClientAccountLevel;
  message: ChatCompletionMessage;
  usage: CompletionUsage;
};

export type Transcriptions = { text: string };

export type ImagesGenerate = {
  clientRate: ClientAccountLevel;
  images: {
    bytes: number | null;
    height: number;
    url: string;
    width: number;
  }[];
  revisedPrompt: string;
};
