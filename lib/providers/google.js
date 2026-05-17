import { GoogleGenerativeAI } from '@google/generative-ai';

export async function streamGoogle(modelId, messages, systemPrompt) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: modelId });

  // Convert OpenAI message format to Gemini format
  const history = [];
  for (const msg of messages.slice(0, -1)) {
    history.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  const chat = model.startChat({
    history,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
    },
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessageStream(lastMessage.content);

  // Convert Gemini's async iterator to an SSE-compatible ReadableStream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            const sseData = JSON.stringify({
              choices: [{ delta: { content: text } }],
            });
            controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
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
