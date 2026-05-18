/**
 * Minimum time before JARVIS starts speaking after user sends message.
 * Makes the AI feel like it's actually reading and thinking.
 * NOT artificial delay — it's the time before the first token appears in UI.
 */
export function getThinkingDelay(mode, messageLength) {
  const wordCount = messageLength.split(/\s+/).length;

  // Base delay by mode
  const baseDelays = {
    general:  400,   // Quick but not instant
    therapy:  800,   // Feels like taking a breath before responding
    deep:     1200,  // Clearly thinking
    study:    600,
    research: 500,
  };

  // Scale with message complexity
  const complexityBonus = Math.min(wordCount * 15, 600);

  return (baseDelays[mode] || 400) + complexityBonus;
}

/**
 * Token display rate — how fast text appears on screen.
 * Claude-like: smooth, not instant, not slow.
 * ~30-40ms per token feels natural and readable.
 */
export const TOKEN_DISPLAY_DELAY_MS = 35;

/**
 * Apply display delay between SSE tokens.
 * Call this in the streaming handler.
 */
export async function applyTokenDelay() {
  await new Promise(r => setTimeout(r, TOKEN_DISPLAY_DELAY_MS));
}
