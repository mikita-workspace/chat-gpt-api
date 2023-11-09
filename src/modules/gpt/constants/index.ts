export enum ModelGPT {
  GIGA_CHAT = 'GigaChat:latest',
  GPT_3_5_TURBO = 'gpt-3.5-turbo-1106',
  WHISPER_1 = 'whisper-1',
}

export type GptMessage = { content: string; role: string };
