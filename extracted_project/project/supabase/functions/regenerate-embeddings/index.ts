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

    // Get all FAQs
    const { data: faqs, error: faqError } = await supabase
      .from('faqs')
      .select('*');

    if (faqError) throw faqError;

    // Process FAQs in batches of 10
    const batchSize = 10;
    for (let i = 0; i < faqs.length; i += batchSize) {
      const batch = faqs.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (faq) => {
        try {
          const text = `${faq.question} ${faq.answer}`;
          const embedding = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input: text,
          });

          await supabase
            .from('faqs')
            .update({ embedding: embedding.data.data[0].embedding })
            .eq('id', faq.id);
        } catch (error) {
          console.error(`Error processing FAQ ${faq.id}:`, error);
        }
      }));
    }

    return new Response(
      JSON.stringify({ success: true }),
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
      JSON.stringify({ error: 'Failed to regenerate embeddings' }),
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