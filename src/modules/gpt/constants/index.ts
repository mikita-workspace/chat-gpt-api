export enum ModelGPT {
  GIGA_CHAT = 'GigaChat:latest',
  GPT_3_5_TURBO = 'gpt-3.5-turbo-1106',
}

export enum TypeGPT {
  TEXT = 'text',
  SPEECH = 'speech',
}

export enum ModelSpeech {
  WHISPER_1 = 'whisper-1',
  GENERAL = 'general',
}

export enum ModelImage {
  DALL_E_3 = 'dall-e-3',
}

export const IMAGE_SIZE_WIDTH_DEFAULT = 1024;
export const IMAGE_SIZE_HEIGHT_DEFAULT = 1024;

export const GIGA_CHAT_OAUTH = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
export const GIGA_CHAT = 'https://gigachat.devices.sberbank.ru/api/v1';
export const GIGACHAT_API_PERS = 'GIGACHAT_API_PERS';
export const GIGA_CHAT_ACCESS_TOKEN = 'giga-chat-access-token';
