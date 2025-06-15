
import { ConversationContext } from '../types/conversationTypes';

export const generateIntelligentFallback = (message: string, context: ConversationContext): string => {
  const lowerMessage = message.toLowerCase();
  const expertise = context.userExpertiseLevel;
  const recentTopics = context.topics.slice(-3);
  
  let response = '';
  
  if (lowerMessage.includes('algoritm') || recentTopics.includes('algorithms')) {
    if (expertise === 'beginner') {
      response = 'Algoritmii cuantici sunt programe speciale care rulează pe computere cuantice. Cei mai cunoscuți sunt Grover (pentru căutare rapidă) și Shor (pentru factorizarea numerelor mari). Încep cu concepte simple și construiesc înțelegerea pas cu pas.';
    } else if (expertise === 'advanced') {
      response = 'Sistemul implementează 10 algoritmi cuantici optimizați: Grover O(√N), Shor O((log N)³), QAOA pentru optimizare combinatorială, VQE pentru chimie cuantică, plus algoritmi ML cuantici cu accelerare exponențială pentru anumite clase de probleme.';
    } else {
      response = 'Am implementat algoritmi cuantici avansați cu optimizări contextuale. Grover oferă căutare accelerată, Shor factorizare eficientă, QAOA optimizare, și VQE pentru aplicații practice în chimie și fizică.';
    }
  } else if (lowerMessage.includes('status') || lowerMessage.includes('performanță')) {
    response = `Sistemul cuantic funcționează optimal cu context avansat pentru utilizatori ${expertise}: coerență îmbunătățită, cache inteligent, și răspunsuri personalizate bazate pe ${recentTopics.length} topicuri de conversație.`;
  } else {
    response = `Înțeleg întrebarea în contextul conversației noastre${recentTopics.length > 0 ? ` despre ${recentTopics.join(', ')}` : ''}. Sistemul oferă răspunsuri adaptate nivelului ${expertise} cu funcții cuantice avansate.`;
  }
  
  return response + '\n\nCu ce aspect specific vă pot ajuta în continuare?';
};

export const enhanceWithAdvancedContext = async (response: string, context: ConversationContext): Promise<string> => {
  let enhancedResponse = response;
  
  // Add expertise-appropriate context
  if (context.userExpertiseLevel === 'beginner' && !response.includes('începători')) {
    enhancedResponse += '\n\n💡 Pentru începători: Aceste concepte formează baza înțelegerii quantum computing-ului.';
  }
  
  if (context.userExpertiseLevel === 'advanced' && context.topics.includes('algorithms')) {
    enhancedResponse += '\n\n🔬 Detalii avansate: Implementarea practică necesită considerarea decoerenței și optimizarea circuitelor cuantice.';
  }
  
  // Add conversation continuity
  if (context.topics.length > 2) {
    const recentTopics = context.topics.slice(-2).join(' și ');
    enhancedResponse += `\n\n🔗 Continuând discuția despre ${recentTopics}, putem explora și conexiunile cu alte domenii cuantice.`;
  }
  
  return enhancedResponse;
};

export const generateExpertiseLevelOverview = (level: 'beginner' | 'intermediate' | 'advanced'): Promise<string> => {
  const overviews = {
    beginner: 'Sistemul cuantic hibrid oferă 10 funcții accesibile pentru începători: algoritmi simpli de înțeles (Grover, Shor), criptografie sigură, și aplicații practice explicate pas cu pas. Învățarea progresivă cu exemple concrete.',
    intermediate: 'Sistem cuantic avansat cu 10 algoritmi optimizați: Grover O(√N), Shor factorizare, QAOA optimizare, VQE chimie cuantică, ML cuantic accelerat. Implementări practice cu balance între teorie și aplicație.',
    advanced: 'Platformă cuantică de cercetare cu 10 algoritmi state-of-the-art: implementări Grover/Shor optimizate, QAOA variational, VQE pentru sisteme moleculare complexe, QML cu quantum advantage demonstrabil, plus protocoale criptografice post-cuantice.'
  };
  
  return Promise.resolve(overviews[level]);
};

export const generateContextualAlgorithmsGuide = (level: 'beginner' | 'intermediate' | 'advanced'): Promise<string> => {
  const guides = {
    beginner: 'Ghid algoritmi cuantici pentru începători: Grover (găsește rapid într-o listă), Shor (sparge coduri), QAOA (găsește soluții optime), VQE (calculează energii). Fiecare explicat simplu cu analogii din viața reală.',
    intermediate: 'Ghid algoritmi cuantici intermediar: Grover search O(√N), Shor factoring cu period finding, QAOA pentru optimizare combinatorială, VQE eigenvalue estimation, plus QML algorithms cu avantaj cuantic demonstrabil.',
    advanced: 'Documentație algoritmi cuantici avansați: Grover cu amplitude amplification, Shor cu quantum Fourier transform optimizat, QAOA cu parameter optimization strategies, VQE cu error mitigation, QML cu quantum feature maps și kernel methods.'
  };
  
  return Promise.resolve(guides[level]);
};
