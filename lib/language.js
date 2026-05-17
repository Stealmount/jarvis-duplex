/**
 * Detect the dominant language of a message.
 * Returns: 'hindi' | 'hinglish' | 'english'
 *
 * Hindi indicators: Devanagari script OR common romanized Hindi words
 * Hinglish: Mix of English + hindi words in roman script
 * English: Default
 */

const HINDI_DEVANAGARI = /[\u0900-\u097F]/;

const HINDI_ROMAN_WORDS = new Set([
  'kya', 'hai', 'hain', 'mein', 'nahi', 'nhi', 'aur', 'bhi', 'koi',
  'kuch', 'yaar', 'yar', 'bhai', 'dost', 'tha', 'thi', 'the', 'hoga',
  'hogi', 'hoge', 'kar', 'karo', 'karna', 'karta', 'karti', 'matlab',
  'matlab', 'samajh', 'dekh', 'dekho', 'bol', 'bolo', 'suno', 'sun',
  'pls', 'please', 'acha', 'accha', 'theek', 'thik', 'bilkul', 'haan',
  'nahin', 'nhin', 'tum', 'aap', 'mujhe', 'muje', 'tumhe', 'tumko',
  'apne', 'apna', 'apni', 'mere', 'mera', 'meri', 'tera', 'teri',
  'uska', 'uski', 'unka', 'unki', 'abhi', 'pehle', 'baad', 'phir',
  'sirf', 'bas', 'zyada', 'thoda', 'bahut', 'kitna', 'kaisa', 'kaise',
  'kyun', 'kyunki', 'isliye', 'lekin', 'magar', 'par', 'toh', 'to',
]);

export function detectLanguage(text) {
  if (!text || text.trim().length === 0) return 'english';

  // Devanagari = definitely Hindi
  if (HINDI_DEVANAGARI.test(text)) return 'hindi';

  const words = text.toLowerCase().split(/\s+/);
  const totalWords = words.length;
  if (totalWords === 0) return 'english';

  const hindiWordCount = words.filter(w => HINDI_ROMAN_WORDS.has(w)).length;
  const hindiRatio = hindiWordCount / totalWords;

  if (hindiRatio >= 0.4) return 'hinglish';    // 40%+ hindi words = hinglish
  if (hindiRatio >= 0.15) return 'hinglish';   // 15-40% = mild hinglish
  return 'english';                             // < 15% = treat as english
}

/**
 * Build a language instruction for the system prompt
 * based on detected language.
 */
export function getLanguageInstruction(lang) {
  if (lang === 'hindi') {
    return `The user is writing in Hindi. Respond in natural, fluent Hindi.
You may mix a few English technical terms where Hindi equivalents are awkward (like "API", "server", "code").
Do NOT respond in English unless the user explicitly asks.
Use proper Hindi grammar — no grammatical errors.`;
  }

  if (lang === 'hinglish') {
    return `The user is writing in Hinglish (Hindi + English mix).
Match their energy — respond in a similar Hinglish blend.
Don't force heavy Hindi. Don't force pure English.
Let it flow naturally the way an educated Indian would talk to a close friend.
Avoid grammatical errors in both languages.`;
  }

  // English (default)
  return `The user is writing in English. Respond in clear, polished English.
Do NOT insert Hindi or Hinglish unless the user writes in it first.
Be warm and conversational — not robotic — but speak proper English.`;
}
