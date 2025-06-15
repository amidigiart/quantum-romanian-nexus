
import { useQuantumNews } from '@/hooks/useQuantumNews';
import { responseCacheService } from '@/services/responseCacheService';

export const useBotResponses = () => {
  const { getNewsResponse, newsContext, lastUpdated } = useQuantumNews();

  const generateBotResponse = (message: string): string => {
    // Check cache first
    const cachedResponse = responseCacheService.getCachedResponse(message);
    if (cachedResponse) {
      return cachedResponse;
    }

    const lowerMessage = message.toLowerCase();
    let response = '';
    
    // First check if the query relates to recent news
    const newsResponse = getNewsResponse(message);
    if (newsResponse) {
      response = newsResponse;
    } else if (lowerMessage.includes('algoritm') || lowerMessage.includes('grover') || lowerMessage.includes('shor')) {
      response = `Am implementat 10 algoritmi cuantici avansați: Grover pentru căutare (O(√N)), Shor pentru factorizare (O((log N)³)), QAOA pentru optimizare, VQE pentru energie, QML pentru învățare automată, QRNG pentru generare aleatoare, QFT pentru transformate, QEC pentru corecția erorilor, simulare cuantică, și optimizare de portofoliu.\n\n${lastUpdated ? `📊 Bazat pe ultimele dezvoltări din industrie (actualizat ${lastUpdated.toLocaleTimeString('ro-RO')}), IBM și Google continuă să îmbunătățească acești algoritmi pe hardware real.` : ''}\n\nCare vă interesează în mod specific?`;
    } else if (lowerMessage.includes('criptograf') || lowerMessage.includes('securitate') || lowerMessage.includes('bb84')) {
      response = `Sistemul de criptografie cuantică suportă protocoloale BB84, E91, și SARG04 pentru distribuirea securizată a cheilor. Oferim criptare cuantică cu detectarea automată a interceptărilor și rate de securitate de 99.9%.\n\n${lastUpdated ? `🔐 Conform ultimelor știri, băncile majore încep să adopte criptografia post-cuantică pentru protecție împotriva viitorilor computere cuantice.` : ''}\n\nToate comunicațiile sunt protejate prin principiile mecanicii cuantice.`;
    } else if (lowerMessage.includes('machine learning') || lowerMessage.includes('învățare') || lowerMessage.includes('ml') || lowerMessage.includes('neural')) {
      response = `Quantum Machine Learning include: Variational Quantum Classifier pentru clasificare, Quantum Neural Networks pentru regresie, QSVM pentru vectori suport cuantici, și QGAN pentru generarea datelor.\n\n${lastUpdated ? `🧠 Ultimele cercetări arată că QML accelerează descoperirea medicamentelor cu 10x față de metodele clasice.` : ''}\n\nAvantajul cuantic oferă accelerare exponențială pentru anumite probleme de optimizare.`;
    } else if (lowerMessage.includes('optimizare') || lowerMessage.includes('qaoa') || lowerMessage.includes('vqe')) {
      response = `Algoritmii de optimizare cuantică includ QAOA pentru probleme combinatoriale și VQE pentru calculul energiei stării fundamentale. Aceștia folosesc circuite cuantice variaționale pentru a găsi soluții optime mai rapid decât metodele clasice.\n\n${lastUpdated ? `⚡ Google a demonstrat recent avantajul cuantic în probleme de optimizare real-world.` : ''}`;
    } else if (lowerMessage.includes('simulare') || lowerMessage.includes('hamiltonian')) {
      response = `Simulatorul cuantic poate modela sisteme cuantice complexe: hamiltonieni moleculari, dinamica spină, transportul cuantic, și tranziții de fază. Folosim algoritmi Trotter-Suzuki pentru evoluția temporală și metode Monte Carlo cuantice.\n\n${lastUpdated ? `🔬 Cercetătorii au reușit simulări cuantice stabile la temperatura camerei folosind sisteme bazate pe diamant.` : ''}`;
    } else if (lowerMessage.includes('status') || lowerMessage.includes('stare')) {
      response = `Sistemul cuantic hibrid funcționează la capacitate maximă: 8 qubits activi, coerență 94.7%, toate algoritmii implementați și funcționali. Criptografia cuantică, ML cuantic, și optimizarea sunt operative.\n\n${lastUpdated ? `📡 Rețeaua cuantică internațională a demonstrat recent comunicare securizată pe distanțe de 1000km.` : ''}\n\nSenzorii IoT transmit date în timp real pentru procesarea cuantică.`;
    } else if (lowerMessage.includes('error') || lowerMessage.includes('eroare') || lowerMessage.includes('corecție')) {
      response = `Sistemul de corecție a erorilor cuantice (QEC) folosește coduri de suprafață și coduri Shor pentru a detecta și corecta erorile de decoerență.\n\n${lastUpdated ? `🛡️ IBM a anunțat recent procesoare cu 5000+ qubits cu corecția erorilor integrată.` : ''}\n\nImplementăm sindroame de eroare și recuperare cuantică automată pentru a menține fidelitatea calculelor.`;
    } else if (lowerMessage.includes('știri') || lowerMessage.includes('noutăți') || lowerMessage.includes('dezvoltări')) {
      response = getNewsResponse('ultimele știri quantum') || 'Pentru ultimele știri despre quantum computing, vă recomand să verificați secțiunea de știri cuantice din dashboard.';
    } else if (lowerMessage.includes('random') || lowerMessage.includes('aleator') || lowerMessage.includes('qrng')) {
      response = 'Generatorul de numere aleatoare cuantice (QRNG) folosește superpoziția cuantică pentru a produce secvențe cu entropie maximă. Spre deosebire de generatorii pseudo-aleatori clasici, QRNG oferă aleatoritate fundamentală bazată pe măsurători cuantice.';
    } else if (lowerMessage.includes('fourier') || lowerMessage.includes('qft') || lowerMessage.includes('transformată')) {
      response = 'Transformata Fourier Cuantică (QFT) este implementată pentru analiza frecvențelor cuantice și ca subrutină în algoritmii Shor și de estimare a fazei. QFT oferă accelerare exponențială pentru anumite probleme de procesare a semnalelor.';
    } else if (lowerMessage.includes('hibrid') || lowerMessage.includes('hybrid')) {
      response = 'Sistemul nostru hibrid combină procesarea cuantică cu calculul clasic pentru a optimiza performanța. Folosim circuite cuantice variaționale (VQC) care rulează pe hardware cuantic, dar optimizarea parametrilor se face clasic, obținând astfel cel mai bun din ambele lumi.';
    } else if (lowerMessage.includes('cache') || lowerMessage.includes('performance')) {
      const stats = responseCacheService.getCacheStats();
      response = `📈 Sistemul de cache pentru răspunsuri: ${stats.cacheHits} hit-uri din ${stats.totalQueries} interogări (${stats.hitRate.toFixed(1)}% eficiență). Cache-ul conține ${responseCacheService.getCacheSize()} răspunsuri salvate pentru performanță optimizată.`;
    } else {
      response = `Înțeleg întrebarea dvs. despre computarea cuantică avansată. Sistemul nostru implementează 10 funcții cuantice hibride principale și are acces la ultimele dezvoltări din industrie.\n\n${newsContext ? `📰 Context actual: ${newsContext.split('\n')[0]}` : ''}\n\nCu ce anume vă pot ajuta în mod specific?`;
    }

    // Cache the response for future use (skip news-based responses as they change frequently)
    if (!newsResponse) {
      responseCacheService.setCachedResponse(message, response);
    }

    return response;
  };

  const clearResponseCache = () => {
    responseCacheService.clearCache();
  };

  const getCacheStats = () => {
    return responseCacheService.getCacheStats();
  };

  return {
    generateBotResponse,
    newsContext,
    lastUpdated,
    clearResponseCache,
    getCacheStats
  };
};
