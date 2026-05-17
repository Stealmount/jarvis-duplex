/**
 * Analyze a sentence and return how many milliseconds to pause
 * AFTER speaking it, before speaking the next sentence.
 *
 * This is called between sentence chunks during streaming TTS.
 */
export function getPauseAfterSentence(sentence, nextSentence) {
  if (!sentence) return 0;

  const trimmed = sentence.trim();
  const wordCount = trimmed.split(/\s+/).length;

  // Base pause: 180ms minimum
  let pause = 180;

  // Longer sentence = slightly longer breath
  if (wordCount > 15) pause += 100;
  if (wordCount > 25) pause += 150;

  // Ending punctuation affects pause length
  if (trimmed.endsWith('?')) pause += 200;  // Question = longer pause, more thought
  if (trimmed.endsWith('...')) pause += 350; // Trailing off = longer pause
  if (trimmed.endsWith('!')) pause += 100;
  if (trimmed.endsWith(':')) pause += 250;  // List incoming = bigger pause
  if (trimmed.endsWith(',')) pause += 80;   // Mid-clause = shorter

  // Topic shift detection — if next sentence starts a new thought
  const SHIFT_STARTERS = [
    'however', 'but', 'although', 'on the other hand',
    'now,', 'so,', 'actually,', 'anyway,', 'look,',
    'here\'s the thing', 'the thing is', 'to be honest',
  ];
  if (nextSentence) {
    const nextLower = nextSentence.toLowerCase().trim();
    if (SHIFT_STARTERS.some(s => nextLower.startsWith(s))) {
      pause += 300; // Bigger pause before a pivot
    }
  }

  // Cap: never more than 900ms between sentences
  return Math.min(pause, 900);
}

/**
 * Split LLM response into speakable chunks (sentences).
 * Handles edge cases: abbreviations, numbers, URLs, etc.
 */
export function splitIntoSentences(text) {
  if (!text) return [];

  // Don't split on: Mr. Mrs. Dr. vs. etc. e.g. i.e. numbers like 3.14
  const protected_text = text
    .replace(/\b(Mr|Mrs|Dr|Prof|Sr|Jr|vs|etc|e\.g|i\.e|approx|est)\./gi, '$1<DOT>')
    .replace(/(\d+)\.(\d+)/g, '$1<DOT>$2')  // decimals
    .replace(/https?:\/\/[^\s]+/g, url => url.replace(/\./g, '<DOT>')); // URLs

  const sentences = protected_text
    .split(/(?<=[.!?\u0964])\s+(?=[A-Z\u0900-\u097F"'])|(?<=\n)\n/)
    .map(s => s.replace(/<DOT>/g, '.').trim())
    .filter(s => s.length > 0);

  return sentences;
}

/**
 * For deep think mode: add a "thinking pause" before the first sentence.
 * This mimics a human taking a moment to compose their thoughts.
 */
export function getThinkingPause(mode, messageLength) {
  if (mode === 'deep') return 600;  // 600ms before JARVIS starts speaking in deep mode
  if (messageLength > 200) return 300; // Longer messages = brief thinking pause
  return 0;
}
