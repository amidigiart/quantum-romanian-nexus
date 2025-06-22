
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
};

interface StreamingBotRequest {
  message: string;
  conversationId?: string;
  userId: string;
  context: {
    recentMessages: string[];
    topics: string[];
    userPreferences: string[];
  };
  provider?: string;
  model?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, provider = 'default', model = 'default' }: StreamingBotRequest = await req.json();
    
    console.log('Real-time streaming request for:', message);

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        
        const sendChunk = (chunk: string, done = false) => {
          const data = JSON.stringify({ chunk, done, timestamp: new Date().toISOString() });
          const eventData = `data: ${data}\n\n`;
          controller.enqueue(encoder.encode(eventData));
        };

        // Generate streaming-optimized response
        const response = generateRealTimeResponse(message, context, provider, model);
        
        // Split response into words for natural streaming
        const words = response.split(' ');
        let currentChunk = '';
        let wordIndex = 0;

        const streamInterval = setInterval(() => {
          if (wordIndex >= words.length) {
            sendChunk('', true); // Signal completion
            controller.close();
            clearInterval(streamInterval);
            return;
          }

          // Add 1-3 words per chunk for natural flow
          const wordsToAdd = Math.min(3, words.length - wordIndex);
          for (let i = 0; i < wordsToAdd; i++) {
            currentChunk += (currentChunk ? ' ' : '') + words[wordIndex + i];
          }
          currentChunk += ' ';
          
          sendChunk(currentChunk);
          currentChunk = '';
          wordIndex += wordsToAdd;
        }, 80 + Math.random() * 40); // 80-120ms intervals for natural typing

        // Cleanup on abort
        req.signal?.addEventListener('abort', () => {
          clearInterval(streamInterval);
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error('Error in real-time streaming function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate real-time streaming response' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateRealTimeResponse(message: string, context: any, provider: string, model: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('algoritm')) {
    return `Sistemul cuantic implementează algoritmi avansați cu streaming în timp real. Algoritmul Grover oferă căutare accelerată cu complexitate O(√N), ideal pentru baze de date mari. Shor realizează factorizare în timp polinomial, revoluționând criptografia. QAOA optimizează probleme combinatoriale prin variational quantum computing. VQE calculează energii moleculare cu precizie fără precedent. Algoritmii de învățare automată cuantică accelerează procesarea datelor prin superpoziție și entanglement. Fiecare algoritm este optimizat pentru hardware NISQ actual și aplicații practice.`;
  }
  
  if (lowerMessage.includes('criptograf')) {
    return `Criptografia cuantică oferă securitate absolută prin principii fundamentale ale fizicii. Protocolul BB84 distribuie chei criptografice cu securitate demonstrabilă matematic. E91 folosește entanglement pentru autentificare și detectare automată a interceptărilor. Sistemul detectează orice tentativă de ascultare prin colapsul stării cuantice. Rata de securitate atinge 99.9% în condiții reale de transmisie. Comunicațiile sunt protejate prin no-cloning theorem și principiul incertitudinii Heisenberg.`;
  }
  
  return `Înțeleg întrebarea despre computarea cuantică avansată prin streaming real-time. Sistemul oferă răspunsuri contextuale și personalizate cu latență minimă. Tehnologiile cuantice evoluează rapid, iar streaming-ul permite urmărirea progresului în timp real. Funcțiile hibride combină puterea calculului clasic cu avantajele cuantice pentru performanță optimă. Putem explora orice aspect specific care vă interesează prin această interfață interactivă.`;
}
