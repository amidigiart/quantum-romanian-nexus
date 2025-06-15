
import { ConversationContext } from '../types/conversationTypes';

export interface ResponseQuality {
  relevance: number;
  completeness: number;
  accuracy: number;
  engagement: number;
  contextualFit: number;
}

export const assessResponseQuality = (message: string, response: string, context: ConversationContext): ResponseQuality => {
  return assessAdvancedResponseQuality(message, response, context);
};

export const assessAdvancedResponseQuality = (message: string, response: string, context: ConversationContext): ResponseQuality => {
  const relevance = calculateAdvancedRelevance(message, response, context);
  const completeness = calculateAdvancedCompleteness(response, context);
  const accuracy = calculateAccuracy(response);
  const engagement = calculateEngagement(response);
  const contextualFit = calculateContextualFit(response, context);

  return { relevance, completeness, accuracy, engagement, contextualFit };
};

export const calculateAdvancedRelevance = (message: string, response: string, context: ConversationContext): number => {
  const messageWords = message.toLowerCase().split(/\s+/);
  const responseWords = response.toLowerCase().split(/\s+/);
  const topicWords = context.topics.join(' ').toLowerCase().split(/\s+/);
  
  // Base relevance from word overlap
  const commonWords = messageWords.filter(word => responseWords.includes(word));
  const baseRelevance = Math.min(commonWords.length / messageWords.length, 1);
  
  // Context bonus for topic alignment
  const topicAlignment = topicWords.filter(word => responseWords.includes(word)).length;
  const contextBonus = Math.min(topicAlignment * 0.1, 0.3);
  
  return Math.min(baseRelevance + contextBonus, 1);
};

export const calculateAdvancedCompleteness = (response: string, context: ConversationContext): number => {
  const hasIntro = response.includes('Înțeleg') || response.includes('Am implementat') || response.includes('Bazat pe');
  const hasDetails = response.length > 150;
  const hasConclusion = response.includes('?') || response.includes('specific') || response.includes('ajuta');
  const hasExamples = response.includes('exemplu') || response.includes('precum') || response.includes('cum ar fi');
  
  // Adjust for user expertise level
  let expertiseBonus = 0;
  if (context.userExpertiseLevel === 'advanced' && response.includes('algoritm')) expertiseBonus = 0.1;
  if (context.userExpertiseLevel === 'beginner' && hasExamples) expertiseBonus = 0.15;
  
  const baseScore = (Number(hasIntro) + Number(hasDetails) + Number(hasConclusion) + Number(hasExamples)) / 4;
  return Math.min(baseScore + expertiseBonus, 1);
};

export const calculateContextualFit = (response: string, context: ConversationContext): number => {
  let contextScore = 0.5; // Base score
  
  // Topic continuity
  const responseTopics = extractTopicsAdvanced(response);
  const topicOverlap = context.topics.filter(topic => responseTopics.includes(topic)).length;
  contextScore += Math.min(topicOverlap * 0.1, 0.3);
  
  // Response style alignment
  const responseLength = response.length;
  if (context.preferredResponseStyle === 'concise' && responseLength < 200) contextScore += 0.1;
  if (context.preferredResponseStyle === 'detailed' && responseLength > 300) contextScore += 0.1;
  if (context.preferredResponseStyle === 'technical' && response.includes('algoritm')) contextScore += 0.1;
  
  return Math.min(contextScore, 1);
};

export const calculateAccuracy = (response: string): number => {
  const accurateTerms = ['O(√N)', 'O((log N)³)', 'BB84', 'QAOA', 'VQE', 'superpoziție', 'entanglement'];
  const foundAccurate = accurateTerms.filter(term => response.includes(term));
  return Math.min(foundAccurate.length / 3, 1);
};

export const calculateEngagement = (response: string): number => {
  const hasQuestion = response.includes('?');
  const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|💡|🔬|🔗/u.test(response);
  const isPersonal = response.includes('dvs.') || response.includes('vă');
  const hasCallToAction = response.includes('puteți') || response.includes('să explorăm') || response.includes('să discutăm');
  
  return (Number(hasQuestion) + Number(hasEmoji) + Number(isPersonal) + Number(hasCallToAction)) / 4;
};

export const predictUserSatisfaction = (quality: ResponseQuality, context: ConversationContext): number => {
  const baseScore = (quality.relevance + quality.completeness + quality.accuracy + quality.engagement + quality.contextualFit) / 5;
  
  // Adjust based on conversation flow
  let conversationBonus = 0;
  if (context.conversationFlow.length > 3) {
    const recentQuality = context.conversationFlow.slice(-3).length;
    conversationBonus = Math.min(recentQuality * 0.02, 0.1);
  }
  
  return Math.min(baseScore + conversationBonus, 1);
};

// Helper function import
const extractTopicsAdvanced = (message: string): string[] => {
  const topics = [];
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('algoritm') || lowerMessage.includes('grover') || lowerMessage.includes('shor')) {
    topics.push('algorithms');
  }
  if (lowerMessage.includes('criptograf') || lowerMessage.includes('securitate') || lowerMessage.includes('bb84')) {
    topics.push('cryptography');
  }
  if (lowerMessage.includes('machine learning') || lowerMessage.includes('ml') || lowerMessage.includes('învățare')) {
    topics.push('quantum-ml');
  }
  if (lowerMessage.includes('optimizare') || lowerMessage.includes('qaoa') || lowerMessage.includes('vqe')) {
    topics.push('optimization');
  }
  if (lowerMessage.includes('hardware') || lowerMessage.includes('qubits') || lowerMessage.includes('implementare')) {
    topics.push('hardware');
  }
  if (lowerMessage.includes('aplicații') || lowerMessage.includes('practică') || lowerMessage.includes('industrie')) {
    topics.push('applications');
  }
  
  return topics;
};
