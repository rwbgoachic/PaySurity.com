import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'npm:openai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const openai = new OpenAIApi(
      new Configuration({
        apiKey: Deno.env.get('OPENAI_API_KEY'),
      })
    );

    const { question, service_type } = await req.json();

    // Get question embedding
    const embedding = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: question,
    });

    // Search FAQs using vector similarity
    let { data: faqs, error } = await supabase
      .rpc('match_faqs', {
        query_embedding: embedding.data.data[0].embedding,
        match_threshold: 0.7,
        match_count: 3,
      });

    if (error) throw error;

    // Filter by service type if specified
    if (service_type) {
      faqs = faqs.filter(faq => faq.category.toLowerCase().includes(service_type.toLowerCase()));
    }

    // Generate response using matched FAQs
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful customer support agent for PaySurity${
            service_type ? ` specializing in ${service_type}` : ''
          }. Use the provided FAQs to answer questions accurately and professionally.`,
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nRelevant FAQs:\n${
            faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
          }`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return new Response(
      JSON.stringify({
        answer: response.data.choices[0].message?.content,
        faqs,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});