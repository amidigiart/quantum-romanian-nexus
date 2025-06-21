
export class ConceptExtractor {
  static extractConcepts(message: string): string[] {
    const concepts = new Set<string>();
    
    // Quantum computing domain concepts
    const quantumConcepts = [
      'quantum', 'qubit', 'superposition', 'entanglement', 'algorithm',
      'circuit', 'gate', 'measurement', 'decoherence', 'interference',
      'cryptography', 'security', 'machine learning', 'optimization',
      'hardware', 'software', 'theory', 'application', 'research'
    ];

    // General technical concepts
    const technicalConcepts = [
      'explain', 'how', 'what', 'why', 'implement', 'build', 'create',
      'analyze', 'compare', 'optimize', 'solve', 'calculate', 'simulate'
    ];

    const words = message.split(/\s+/);
    
    for (const word of words) {
      if (quantumConcepts.includes(word)) {
        concepts.add(`quantum:${word}`);
      } else if (technicalConcepts.includes(word)) {
        concepts.add(`action:${word}`);
      } else if (word.length > 4) {
        concepts.add(`concept:${word}`);
      }
    }

    return Array.from(concepts);
  }

  static normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\b(please|could you|can you|would you)\b/g, '') // Remove politeness words
      .replace(/\b(what|how|why|when|where|who)\b/g, 'QUESTION') // Normalize question words
      .trim();
  }
}
