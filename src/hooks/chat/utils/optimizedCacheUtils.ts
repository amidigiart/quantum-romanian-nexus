
import { ConversationContext } from '../types/conversationTypes';

export const generateOptimizedCacheKey = (
  message: string, 
  context: ConversationContext,
  userId?: string
): string => {
  // Normalize message for better cache hits
  const normalizedMessage = message
    .toLowerCase()
    .trim()
    .replace(/[.,!?;]/g, '')
    .replace(/\s+/g, ' ')
    .substring(0, 100); // Limit length for consistency

  // Create semantic clusters for similar queries
  const semanticKey = generateSemanticCluster(normalizedMessage);
  
  // Include only stable context elements
  const stableContext = {
    expertise: context.userExpertiseLevel,
    style: context.preferredResponseStyle,
    domain: extractDomain(normalizedMessage)
  };

  const contextHash = JSON.stringify(stableContext);
  return `optimized:${semanticKey}:${contextHash}:${userId || 'anon'}`;
};

const generateSemanticCluster = (message: string): string => {
  // Group similar quantum computing queries
  if (message.includes('quantum') && (message.includes('algorithm') || message.includes('compute'))) {
    return 'quantum-algorithms';
  }
  if (message.includes('quantum') && (message.includes('entangle') || message.includes('superposition'))) {
    return 'quantum-principles';
  }
  if (message.includes('quantum') && (message.includes('crypto') || message.includes('security'))) {
    return 'quantum-security';
  }
  if (message.includes('machine learning') || message.includes('ml') || message.includes('ai')) {
    return 'quantum-ml';
  }
  if (message.includes('news') || message.includes('latest') || message.includes('recent')) {
    return 'quantum-news';
  }
  
  // Default cluster based on first significant word
  const words = message.split(' ').filter(w => w.length > 3);
  return words[0] ? `general-${words[0]}` : 'general-query';
};

const extractDomain = (message: string): string => {
  if (message.includes('algorithm') || message.includes('compute')) return 'algorithms';
  if (message.includes('hardware') || message.includes('device')) return 'hardware';
  if (message.includes('software') || message.includes('program')) return 'software';
  if (message.includes('theory') || message.includes('principle')) return 'theory';
  return 'general';
};

export const generateVariationKeys = (baseKey: string): string[] => {
  // Generate variations for partial cache hits
  const parts = baseKey.split(':');
  const variations = [];
  
  // Create less specific versions
  if (parts.length >= 3) {
    variations.push(`${parts[0]}:${parts[1]}:general`);
    variations.push(`${parts[0]}:general:${parts[2]}`);
    variations.push(`${parts[0]}:general:general`);
  }
  
  return variations;
};

export const calculateCacheScore = (
  key: string,
  accessCount: number,
  lastAccessed: number,
  createdAt: number
): number => {
  const now = Date.now();
  const age = now - createdAt;
  const recency = now - lastAccessed;
  
  // Higher score = better cache candidate
  let score = accessCount * 10; // Base score from usage
  
  // Recency bonus (accessed within last hour)
  if (recency < 60 * 60 * 1000) {
    score += 50;
  }
  
  // Age penalty (older than 1 day)
  if (age > 24 * 60 * 60 * 1000) {
    score -= 20;
  }
  
  // High-value content bonus
  if (key.includes('quantum-algorithms') || key.includes('quantum-principles')) {
    score += 30;
  }
  
  return Math.max(0, score);
};
