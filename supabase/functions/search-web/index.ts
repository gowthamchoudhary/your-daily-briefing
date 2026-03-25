const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'FIRECRAWL_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, extractPoints } = await req.json();
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching Firecrawl for:', query);

    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 5,
        scrapeOptions: {
          formats: ['markdown'],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ error: data.error || `Firecrawl error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = (data.data || []).map((item: any) => {
      const markdown = item.markdown || '';
      
      // Extract key points from markdown content
      let keyPoints: string[] = [];
      if (extractPoints && markdown) {
        // Extract bullet points, numbered lists, and meaningful sentences
        const lines = markdown.split('\n').filter((l: string) => l.trim());
        const pointLines = lines.filter((l: string) => {
          const trimmed = l.trim();
          // Match bullet points, numbered items, or sentences with key indicators
          return (
            /^[-•*]\s/.test(trimmed) ||
            /^\d+[.)]\s/.test(trimmed) ||
            /^#{1,3}\s/.test(trimmed)
          );
        });
        
        // Also grab strong opening sentences from paragraphs
        const paragraphs = markdown.split('\n\n').filter((p: string) => {
          const t = p.trim();
          return t.length > 40 && t.length < 500 && !t.startsWith('#') && !t.startsWith('|');
        });
        
        // Combine and clean
        const allPoints = [
          ...pointLines.map((l: string) => l.replace(/^[-•*#\d.)\s]+/, '').trim()),
          ...paragraphs.slice(0, 3).map((p: string) => p.trim().split('.').slice(0, 2).join('.').trim()),
        ].filter((p: string) => p.length > 20 && p.length < 400);
        
        // Deduplicate and limit
        keyPoints = [...new Set(allPoints)].slice(0, 5);
      }

      return {
        title: item.title || 'Untitled',
        url: item.url || '',
        description: item.description || markdown.slice(0, 200) || '',
        source: item.url ? new URL(item.url).hostname.replace('www.', '') : 'Unknown',
        image: item.metadata?.ogImage || item.metadata?.image || '',
        ...(extractPoints ? { keyPoints, excerpt: markdown.slice(0, 600) } : {}),
      };
    });

    const textSummary = results
      .map((r: any, i: number) => `${i + 1}. ${r.title} (${r.source}): ${r.description}`)
      .join('\n\n');

    return new Response(
      JSON.stringify({ results, textSummary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
