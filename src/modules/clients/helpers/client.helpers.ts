import { copyObject, getTimestampUnix } from '@/common/utils';
import { gptModelsBase, gptModelsPremium, gptModelsPromo } from '@/modules/gpt/constants';

import {
  ClientFeedback,
  ClientImagesLevel,
  ClientNamesLevel,
  ClientSymbolLevel,
  ClientTokensLevel,
} from '../constants';
import { ClientImages, ClientMessages } from '../schemas';

export const getClientAccountLevel = (name: string) => {
  if (name === ClientNamesLevel.PREMIUM) {
    return {
      images: ClientImagesLevel.PREMIUM,
      gptModels: gptModelsPremium,
      gptTokens: ClientTokensLevel.PREMIUM,
      symbol: ClientSymbolLevel.PREMIUM,
    };
  }

  if (name === ClientNamesLevel.PROMO) {
    return {
      images: ClientImagesLevel.PROMO,
      gptModels: gptModelsPromo,
      gptTokens: ClientTokensLevel.PROMO,
      symbol: '',
    };
  }

  return {
    images: ClientImagesLevel.BASE,
    gptModels: gptModelsBase,
    gptTokens: ClientTokensLevel.BASE,
    symbol: '',
  };
};

export const getClientUpdatedMessageFeedback = (
  clientMessages: ClientMessages,
  messageId: number,
  feedback: ClientFeedback,
) => {
  const messagesIndex = clientMessages.messages.findIndex(
    (message) => message.messageId === messageId,
  );

  if (messagesIndex > -1) {
    const messagesCopy = copyObject(clientMessages.messages[messagesIndex]);

    messagesCopy.feedback = feedback;
    messagesCopy.updatedAt = getTimestampUnix();

    return {
      messages: [
        ...clientMessages.messages.filter(
          (message) => message.messageId !== messagesCopy.messageId,
        ),
        messagesCopy,
      ],
      index: messagesIndex,
    };
  }

  return {};
};

export const getClientUpdatedImageFeedback = (
  clientImages: ClientImages,
  messageId: number,
  feedback: ClientFeedback,
) => {
  const imagesIndex = clientImages.images.findIndex((image) => image.messageId === messageId);

  if (imagesIndex > -1) {
    const imagesCopy = copyObject(clientImages.images[imagesIndex]);

    imagesCopy.feedback = feedback;
    imagesCopy.updatedAt = getTimestampUnix();

    return {
      images: [
        ...clientImages.images.filter((image) => image.messageId !== imagesCopy.messageId),
        imagesCopy,
      ],
      index: imagesIndex,
    };
  }

  return {};
};
