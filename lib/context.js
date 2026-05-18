/**
 * Context window manager for JARVIS.
 * Handles rolling window + auto-summary compression
 * to keep conversations within token limits while preserving memory.
 */

const RECENT_WINDOW = 20;     // Send verbatim
const SUMMARY_THRESHOLD = 25;  // Start summarizing at 25 messages

/**
 * Build the message array to send to the LLM.
 * Handles compression of older context.
 *
 * @param {Array} allMessages - Full thread history [{role, content}]
 * @param {string} contextSummary - Pre-generated summary of older messages (from DB)
 * @returns {Array} messages - What to send to the LLM
 */
export function buildContextWindow(allMessages, contextSummary) {
  if (!allMessages || allMessages.length === 0) return [];

  const recentMessages = allMessages.slice(-RECENT_WINDOW);

  if (allMessages.length <= RECENT_WINDOW || !contextSummary) {
    return recentMessages;
  }

  // Inject summary as a system message at the start
  const summaryMessage = {
    role: 'system',
    content: `--- EARLIER CONVERSATION SUMMARY ---
The following is a summary of what was discussed earlier in this thread.
Use this as context for the ongoing conversation:

${contextSummary}
--- END SUMMARY ---`,
  };

  return [summaryMessage, ...recentMessages];
}

/**
 * Check if a thread needs its summary regenerated.
 * Called after every message save.
 */
export function needsSummaryUpdate(messageCount, existingSummary) {
  if (messageCount < SUMMARY_THRESHOLD) return false;
  if (!existingSummary) return true;

  // Regenerate summary every 10 new messages
  const messagesSinceSummary = messageCount % 10;
  return messagesSinceSummary === 0;
}

/**
 * Build the summarization prompt for older messages.
 */
export function buildSummarizationPrompt(olderMessages, currentSummary) {
  return `You are a conversation summarizer. Create a concise but complete summary of the following conversation history.

The summary should capture:
- Key topics discussed
- Important facts, preferences, or constraints the user mentioned
- Decisions or conclusions reached
- The user's apparent goals in this conversation
- Any technical details, names, or specifics that would be important for future context

${currentSummary ? `Previous summary to update:\n${currentSummary}\n\nNew messages to incorporate:` : 'Messages to summarize:'}

${olderMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}

Write a flowing summary in 150-250 words. Be specific, not vague.`;
}

/**
 * Generate a title prompt for the first message in a thread.
 */
export function buildTitlePrompt(userMessage) {
  return `Generate a short, specific title (3-6 words) for a conversation that starts with:
"${userMessage.slice(0, 200)}"

Rules:
- No quotes around the title
- No punctuation at the end
- Capitalize like a headline
- Be specific, not generic ("How does React work" not "Question about coding")
- Return ONLY the title, nothing else`;
}

/**
 * Detect if user's message intent is for image generation
 */
export function isImageGenerationRequest(text) {
  return /\b(generate|create|draw|make|design)\b.{0,30}\b(image|picture|photo|illustration|artwork)\b/i.test(text)
    || /\b(visualize|show me what|what does.+look like)\b/i.test(text);
}
