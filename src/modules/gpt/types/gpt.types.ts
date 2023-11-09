import { ChatCompletionMessage, CompletionUsage } from 'openai/resources';

export type ChatCompletions = {
  message: ChatCompletionMessage;
  usage: CompletionUsage;
};
