import { ChatCompletionMessage, CompletionUsage } from 'openai/resources';
import { ClientRate } from 'src/modules/clients/types';

export type ChatCompletions = {
  clientRate: ClientRate;
  message: ChatCompletionMessage;
  usage: CompletionUsage;
};

export type ImagesGenerate = {
  clientRate: ClientRate;
  images: {
    bytes: number | null;
    height: number;
    url: string;
    width: number;
  }[];
  revisedPrompt: string;
};
