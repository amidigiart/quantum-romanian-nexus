
export const analyzeUserExpertise = (messages: string[]): 'beginner' | 'intermediate' | 'advanced' => {
  const technicalTerms = ['algoritm', 'qubits', 'superpoziție', 'entanglement', 'decoerență', 'Hamiltonian'];
  const advancedTerms = ['QAOA', 'VQE', 'Grover', 'Shor', 'BB84', 'factorizare'];
  
  const recentMessages = messages.slice(-10).join(' ').toLowerCase();
  const technicalCount = technicalTerms.filter(term => recentMessages.includes(term)).length;
  const advancedCount = advancedTerms.filter(term => recentMessages.includes(term)).length;

  if (advancedCount >= 2 || technicalCount >= 4) return 'advanced';
  if (technicalCount >= 2) return 'intermediate';
  return 'beginner';
};

export const extractTopicsAdvanced = (message: string): string[] => {
  const topics = [];
  const lowerMessage = message.toLowerCase();
  
  // Quantum algorithms
  if (lowerMessage.includes('algoritm') || lowerMessage.includes('grover') || lowerMessage.includes('shor')) {
    topics.push('algorithms');
  }
  
  // Cryptography and security
  if (lowerMessage.includes('criptograf') || lowerMessage.includes('securitate') || lowerMessage.includes('bb84')) {
    topics.push('cryptography');
  }
  
  // Machine learning
  if (lowerMessage.includes('machine learning') || lowerMessage.includes('ml') || lowerMessage.includes('învățare')) {
    topics.push('quantum-ml');
  }
  
  // Optimization
  if (lowerMessage.includes('optimizare') || lowerMessage.includes('qaoa') || lowerMessage.includes('vqe')) {
    topics.push('optimization');
  }
  
  // Hardware and implementation
  if (lowerMessage.includes('hardware') || lowerMessage.includes('qubits') || lowerMessage.includes('implementare')) {
    topics.push('hardware');
  }
  
  // Applications
  if (lowerMessage.includes('aplicații') || lowerMessage.includes('practică') || lowerMessage.includes('industrie')) {
    topics.push('applications');
  }
  
  return topics;
};

export const extractPreferencesAdvanced = (message: string): string[] => {
  const preferences = [];
  const lowerMessage = message.toLowerCase();
  
  // Algorithm preferences
  if (lowerMessage.includes('preferat') || lowerMessage.includes('favorit') || lowerMessage.includes('interesează')) {
    if (lowerMessage.includes('grover')) preferences.push('grover-search');
    if (lowerMessage.includes('shor')) preferences.push('shor-factoring');
    if (lowerMessage.includes('qaoa')) preferences.push('qaoa-optimization');
    if (lowerMessage.includes('vqe')) preferences.push('vqe-chemistry');
  }
  
  // Response style preferences
  if (lowerMessage.includes('detaliat') || lowerMessage.includes('explicație')) preferences.push('detailed-explanations');
  if (lowerMessage.includes('simplu') || lowerMessage.includes('scurt')) preferences.push('concise-responses');
  if (lowerMessage.includes('tehnic') || lowerMessage.includes('avansat')) preferences.push('technical-depth');
  
  return preferences;
};

export const inferResponseStyle = (message: string, currentStyle: string): 'detailed' | 'concise' | 'technical' => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('pe scurt') || lowerMessage.includes('rezumat') || lowerMessage.includes('rapid')) {
    return 'concise';
  }
  
  if (lowerMessage.includes('detaliat') || lowerMessage.includes('explicație') || lowerMessage.includes('pas cu pas')) {
    return 'detailed';
  }
  
  if (lowerMessage.includes('tehnic') || lowerMessage.includes('avansat') || lowerMessage.includes('formula')) {
    return 'technical';
  }
  
  return currentStyle as any;
};
