export async function streamCloudflare(modelId, messages, systemPrompt) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        max_tokens: 2048,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudflare error ${res.status}: ${err}`);
  }

  // Cloudflare Workers AI streams SSE with a slightly different format
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = res.body.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = '';
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              return;
            }
            try {
              const parsed = JSON.parse(payload);
              const text = parsed.response || '';
              if (text) {
                const sseData = JSON.stringify({
                  choices: [{ delta: { content: text } }],
                });
                controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
              }
            } catch {}
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return stream;
}
