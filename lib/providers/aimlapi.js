/**
 * AIML API provider — OpenAI-compatible gateway
 * https://docs.aimlapi.com
 */
export async function streamAimlapi(modelId, messages, systemPrompt) {
  const key = process.env.AIMLAPI_API_KEY;
  if (!key) throw new Error('AIMLAPI_API_KEY not set');

  const body = {
    model: modelId,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    stream: true,
    temperature: 0.7,
  };

  const res = await fetch('https://api.aimlapi.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AIML API error ${res.status}: ${err}`);
  }

  return res.body;
}
