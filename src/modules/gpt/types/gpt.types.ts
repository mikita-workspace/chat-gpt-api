import { ChatCompletionMessage, CompletionUsage } from 'openai/resources';

export type ChatCompletions = {
  clientRate: { dalleImages: number; expiresAt: number; gptTokens: number };
  message: ChatCompletionMessage;
  usage: CompletionUsage;
};
