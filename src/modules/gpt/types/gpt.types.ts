import { ChatCompletionMessage, CompletionUsage } from 'openai/resources';

export type GptMessage = { content: string; role: string };

export type ChatCompletions = {
  message: ChatCompletionMessage;
  usage: CompletionUsage;
};
