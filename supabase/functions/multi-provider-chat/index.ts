
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MultiProviderRequest {
  message: string;
  provider: string;
  model: string;
  conversationId?: string;
  userId: string;
  priority?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, provider, model, conversationId, userId, priority }: MultiProviderRequest = await req.json();
    
    console.log(`Generating response with ${provider} ${model} for:`, message);
    console.log(`Priority: ${priority || 'normal'}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let response: string;
    let processingTime = 0;
    const startTime = Date.now();

    try {
      switch (provider) {
        case 'openai':
          response = await generateOpenAIResponse(message, model);
          break;
        case 'anthropic':
          response = await generateAnthropicResponse(message, model);
          break;
        case 'perplexity':
          response = await generatePerplexityResponse(message, model);
          break;
        default:
          response = generateDefaultResponse(message);
      }
      processingTime = Date.now() - startTime;
    } catch (error) {
      processingTime = Date.now() - startTime;
      
      // Handle circuit breaker and provider errors gracefully
      if (error.message.includes('API key not configured')) {
        response = `⚠️ ${provider} is not configured. Please set up the API key or try a different provider.`;
      } else if (error.name === 'CircuitBreakerOpenError') {
        response = `🔄 ${provider} service is temporarily unavailable due to recent failures. Please try again in a few minutes or use a different provider.`;
      } else if (error.message.includes('rate limit') || error.status === 429) {
        response = `⏳ ${provider} rate limit exceeded. Please wait a moment before trying again.`;
      } else if (error.status >= 500) {
        response = `🔧 ${provider} is experiencing technical difficulties. Please try a different provider.`;
      } else {
        console.error(`Provider error for ${provider}:`, error);
        response = `❌ Error with ${provider}: ${error.message}. Please try a different provider or check your configuration.`;
      }
    }

    // Save to database if conversation exists
    if (conversationId) {
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          content: response,
          message_type: 'assistant',
          quantum_data: {
            provider,
            model,
            priority: priority || 'normal',
            processing_time_ms: processingTime,
            timestamp: new Date().toISOString(),
            had_error: processingTime === 0 || response.startsWith('⚠️') || response.startsWith('🔄') || response.startsWith('⏳') || response.startsWith('🔧') || response.startsWith('❌')
          }
        });

      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    return new Response(
      JSON.stringify({ 
        response,
        provider,
        model,
        priority: priority || 'normal',
        processing_time_ms: processingTime,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in multi-provider-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate response',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generateOpenAIResponse(message: string, model: string): Promise<string> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'Ești un asistent cuantic avansat cu expertiză în computarea cuantică, algoritmi, criptografie și tehnologii emergente. Răspunde în română cu informații precise și detaliate.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateAnthropicResponse(message: string, model: string): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Ești un asistent cuantic avansat cu expertiză în computarea cuantică. Răspunde în română: ${message}`
        }
      ]
    }),
  });

  const data = await response.json();
  return data.content[0].text;
}

async function generatePerplexityResponse(message: string, model: string): Promise<string> {
  const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
  if (!apiKey) {
    throw new Error('Perplexity API key not configured');
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'Ești un asistent cuantic cu acces la informații în timp real. Oferă răspunsuri actualizate și precise în română.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 1000,
      search_recency_filter: 'month'
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

function generateDefaultResponse(message: string): string {
  return `Înțeleg întrebarea dvs. despre "${message}". Sistemul cuantic hibrid oferă funcții avansate de procesare și analiză. Pentru răspunsuri optimale, vă recomand să configurați cheile API pentru providerII AI preferați.`;
}
