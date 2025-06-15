
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache for common responses
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

interface CachedBotRequest {
  message: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId }: CachedBotRequest = await req.json();
    
    // Normalize message for cache key
    const normalizedMessage = message.toLowerCase().trim();
    const cacheKey = normalizedMessage;
    
    // Check cache first
    const cached = responseCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('Cache hit for message:', normalizedMessage);
      return new Response(
        JSON.stringify({ 
          response: cached.response,
          cached: true,
          cacheAge: Math.floor((now - cached.timestamp) / 1000)
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate new response
    const botResponse = generateCachedResponse(normalizedMessage);
    
    // Cache the response
    responseCache.set(cacheKey, {
      response: botResponse,
      timestamp: now
    });

    // Clean old cache entries (simple LRU)
    if (responseCache.size > 100) {
      const oldestKey = responseCache.keys().next().value;
      responseCache.delete(oldestKey);
    }

    console.log('Generated and cached new response for:', normalizedMessage);

    return new Response(
      JSON.stringify({ 
        response: botResponse,
        cached: false,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in cached-bot-response function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate cached response' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateCachedResponse(message: string): string {
  // Common FAQ responses that benefit from caching
  if (message.includes('ce este quantum')) {
    return 'Quantum computing folosește principiile mecanicii cuantice (superpoziție, entanglement) pentru a procesa informația în moduri imposibile pentru computerele clasice. Qubits pot fi în multiple stări simultan, oferind putere de calcul exponențială pentru anumite probleme.';
  }
  
  if (message.includes('cum funcționează')) {
    return 'Computerele cuantice manipulează qubits prin porti cuantice, creând circuite care exploatează superpoziția și entanglement-ul. Măsurarea finală colapsează sistemul într-o stare clasică, oferind rezultatul calculului.';
  }
  
  if (message.includes('avantaje') || message.includes('beneficii')) {
    return 'Avantajele quantum computing: accelerare exponențială pentru factorizare, căutare în baze de date, simulare moleculară, optimizare, criptografie securizată, și machine learning avansat. Ideal pentru probleme NP-complete și simulări științifice.';
  }
  
  if (message.includes('dezavantaje') || message.includes('limitări')) {
    return 'Limitările actuale: decoerența cuantică, rate ridicate de eroare, necesitatea temperaturilor foarte scăzute, costuri mari, și dificultatea programării. Nu toate problemele beneficiază de accelerare cuantică.';
  }
  
  if (message.includes('viitor') || message.includes('dezvoltare')) {
    return 'Viitorul quantum computing: procesoare cu milioane de qubits, corecția erorilor fault-tolerant, algoritmi noi pentru AI și simulare, rețele cuantice globale, și integrare cu cloud computing. IBM, Google, și IonQ conduc dezvoltarea.';
  }
  
  // Default response for cached queries
  return 'Aceasta este o întrebare frecventă despre quantum computing. Sistemul nostru oferă 10 funcții cuantice hibride avansate. Puteți întreba despre algoritmi specifici, aplicații practice, sau ultimele dezvoltări din domeniu.';
}
