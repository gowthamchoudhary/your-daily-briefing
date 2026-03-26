const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function extractMeaningfulPoints(markdown: string): string[] {
  if (!markdown || markdown.length < 50) return [];

  const points: string[] = [];

  // Remove markdown links but keep the text: [text](url) -> text
  const cleaned = markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // remove images
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/\|[^ \n]*\|/g, '') // remove table rows
    .replace(/[-=]{3,}/g, '') // remove horizontal rules
    .replace(/<[^>]+>/g, ''); // remove HTML tags

  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Skip navigation, social media, short junk
    if (line.length < 30 || line.length > 500) continue;
    if (/^(Skip to|Search|Menu|Home|About|Contact|Follow|Subscribe|Sign|Log|Cookie|Privacy|Terms|©|Advertisement)/i.test(line)) continue;
    if (/^(Mobile|Desktop|App|Download|Install)/i.test(line)) continue;
    if (/(twitter|facebook|linkedin|youtube|instagram|threads|mastodon|bluesky|bsky|reddit)\.(com|net|app)/i.test(line)) continue;
    if (/^(Share|Tweet|Pin|Email|Print|RSS|Feed)/i.test(line)) continue;
    if (/^\w+:[@#]/i.test(line)) continue; // "Threads:@user" patterns
    if (/^#{4,}/.test(line)) continue; // skip deep headers (nav items)

    // Clean bullet/number prefixes
    let clean = line.replace(/^[-•*#\d.)\s]+/, '').trim();

    // Must have at least 2 words and look like a sentence
    const wordCount = clean.split(/\s+/).length;
    if (wordCount < 5) continue;

    // Skip lines that are mostly links or special chars
    const alphaRatio = (clean.match(/[a-zA-Z]/g) || []).length / clean.length;
    if (alphaRatio < 0.5) continue;

    points.push(clean);
  }

  // Deduplicate by checking similarity
  const unique: string[] = [];
  for (const p of points) {
    const isDupe = unique.some(u => {
      const overlap = u.slice(0, 40) === p.slice(0, 40);
      return overlap;
    });
    if (!isDupe) unique.push(p);
  }

  return unique.slice(0, 6);
}

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
          onlyMainContent: true,
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

      let keyPoints: string[] = [];
      if (extractPoints && markdown) {
        keyPoints = extractMeaningfulPoints(markdown);
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
