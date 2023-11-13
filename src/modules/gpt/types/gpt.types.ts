import { ChatCompletionMessage, CompletionUsage } from 'openai/resources';

export type ChatCompletions = {
  clientRate: {
    expiresAt: number;
    gptTokens: number;
    images: number;
    name: string;
    symbol: string;
  };
  message: ChatCompletionMessage;
  usage: CompletionUsage;
};

export type ImagesGenerate = {
  clientRate: {
    expiresAt: number;
    gptTokens: number;
    images: number;
    name: string;
    symbol: string;
  };
  images: {
    bytes: number | null;
    height: number;
    url: string;
    width: number;
  }[];
  revisedPrompt: string;
};
