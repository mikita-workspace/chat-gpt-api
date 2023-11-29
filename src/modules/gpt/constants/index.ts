export const GET_GPT_MODELS_CACHE_KEY = 'get-gpt-models-cache-key';

export enum ModelGPT {
  GIGA_CHAT = 'GigaChat:latest',
  GPT_3_5_TURBO = 'gpt-3.5-turbo-1106',
  GPT_4_TURBO = 'gpt-4-1106-preview',
}

export enum TypeGPT {
  AUDIO = 'audio',
  IMAGE = 'image',
  TEXT = 'text',
  VISION = 'vision',
}

export enum ModelSpeech {
  WHISPER_1 = 'whisper-1',
  GENERAL = 'general',
}

export enum ModelImage {
  DALL_E_2 = 'dall-e-2',
  DALL_E_3 = 'dall-e-3',
}

export enum ModelVision {
  GPT_4_VISION = 'gpt-4-vision-preview',
}

export const gptModelsBase = [ModelGPT.GPT_3_5_TURBO, ModelSpeech.WHISPER_1, ModelImage.DALL_E_2];
export const gptModelsPromo = [...gptModelsBase, ModelGPT.GPT_4_TURBO, ModelImage.DALL_E_3];
export const gptModelsPremium = [
  ...Object.values({ ...ModelGPT, ...ModelSpeech, ...ModelImage, ...ModelVision }),
];
