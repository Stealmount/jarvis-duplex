export async function searchTavily(query) {
  if (!process.env.TAVILY_API_KEY) {
    return { source: 'model_knowledge', answer: null, results: [] };
  }

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: true,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        source: 'tavily',
        answer: data.answer,
        results: (data.results || []).map(r => ({
          title: r.title,
          url: r.url,
          content: (r.content || '').slice(0, 500),
        })),
      };
    }
  } catch (e) {
    console.error('Tavily search failed:', e.message);
  }

  return { source: 'model_knowledge', answer: null, results: [] };
}
