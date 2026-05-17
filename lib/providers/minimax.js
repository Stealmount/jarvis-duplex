export async function streamMinimax(modelId, messages, systemPrompt) {
  const groupId = process.env.MINIMAX_GROUP_ID;
  const res = await fetch(
    `https://api.minimax.chat/v1/text/chatcompletion_v2?GroupId=${groupId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MiniMax error ${res.status}: ${err}`);
  }

  return res.body;
}
