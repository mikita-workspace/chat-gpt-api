import { ChatCompletionMessage, CompletionUsage } from 'openai/resources';

export type ChatCompletions = {
  clientRate: { images: number; expiresAt: number; gptTokens: number };
  message: ChatCompletionMessage;
  usage: CompletionUsage;
};

export type ImagesGenerate = {
  clientRate: { images: number; expiresAt: number; gptTokens: number };
  images: {
    bytes: number | null;
    height: number;
    url: string;
    width: number;
  }[];
  revisedPrompt: string;
};
