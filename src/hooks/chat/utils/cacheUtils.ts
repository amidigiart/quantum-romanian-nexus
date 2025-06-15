
import { ConversationContext } from '../types/conversationTypes';

export const generateAdvancedCacheKey = (message: string, context: ConversationContext): string => {
  const topicsHash = context.topics.slice(-3).join('-');
  const expertiseLevel = context.userExpertiseLevel;
  const responseStyle = context.preferredResponseStyle;
  const messageHash = message.toLowerCase().substring(0, 60);
  return `enhanced:${messageHash}:${topicsHash}:${expertiseLevel}:${responseStyle}`;
};
