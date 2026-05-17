export async function streamCohere(modelId, messages, systemPrompt) {
  // Cohere's chat endpoint uses a different format
  const chatHistory = [];
  for (const msg of messages.slice(0, -1)) {
    chatHistory.push({
      role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
      message: msg.content,
    });
  }

  const lastMessage = messages[messages.length - 1]?.content || '';

  const res = await fetch('https://api.cohere.ai/v1/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      message: lastMessage,
      preamble: systemPrompt,
      chat_history: chatHistory,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cohere error ${res.status}: ${err}`);
  }

  // Transform Cohere's streaming format to SSE
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
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.event_type === 'text-generation' && parsed.text) {
                const sseData = JSON.stringify({
                  choices: [{ delta: { content: parsed.text } }],
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
