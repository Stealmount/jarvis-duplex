export async function streamAnthropic(modelId, messages, systemPrompt) {
  // Convert OpenAI messages to Anthropic messages
  const anthropicMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }));

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      system: systemPrompt,
      messages: anthropicMessages,
      stream: true,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error ${res.status}: ${err}`);
  }

  // Transform Anthropic SSE to OpenAI SSE format
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true });
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          if (!dataStr || dataStr === '[DONE]') continue;
          
          try {
            const data = JSON.parse(dataStr);
            if (data.type === 'content_block_delta' && data.delta?.text) {
              const payload = {
                choices: [{ delta: { content: data.delta.text } }]
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
            } else if (data.type === 'message_stop') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            }
          } catch (e) {
            // Ignore parse errors on partial chunks
          }
        }
      }
    }
  });

  return res.body.pipeThrough(transformStream);
}
