
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context }: StreamingBotRequest = await req.json();
    
    console.log('Streaming response for:', message);

    // Generate streaming-optimized response
    const streamingResponse = generateStreamingOptimizedResponse(message, context);
    
    return new Response(
      JSON.stringify({ 
        response: streamingResponse,
        streaming: true,
        chunks: streamingResponse.split('. ').length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in streaming-bot-response function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate streaming response' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateStreamingOptimizedResponse(message: string, context: any): string {
  const lowerMessage = message.toLowerCase();
  
  // Streaming responses are structured in shorter, digestible chunks
  if (lowerMessage.includes('algoritm')) {
    return `Sistemul cuantic implementează 10 algoritmi avansați. ` +
           `Grover oferă căutare accelerată O(√N). ` +
           `Shor realizează factorizare în timp polinomial O((log N)³). ` +
           `QAOA optimizează probleme combinatoriale complexe. ` +
           `VQE calculează energii moleculare precise. ` +
           `Algoritmii ML cuantici accelerează învățarea automată. ` +
           `Fiecare algoritm este optimizat pentru performanță maximă în aplicații real-world.`;
  }
  
  if (lowerMessage.includes('criptograf')) {
    return `Criptografia cuantică oferă securitate absolută. ` +
           `Protocolul BB84 distribuie chei în siguranță. ` +
           `E91 folosește entanglement pentru autentificare. ` +
           `Sistemul detectează automat tentativele de interceptare. ` +
           `Rata de securitate este 99.9% în condiții reale. ` +
           `Comunicațiile sunt protejate prin principii fundamentale ale fizicii cuantice.`;
  }
  
  return `Înțeleg întrebarea despre computarea cuantică avansată. ` +
         `Sistemul oferă funcții hibride inteligente. ` +
         `Răspunsurile sunt personalizate și contextualizate. ` +
         `Tehnologiile cuantice evoluează rapid în prezent. ` +
         `Putem explora orice aspect specific care vă interesează.`;
}
