// lib/keys.js

// In-memory blacklist (persists during server lifetime)
const blacklistedKeys = new Set();

/**
 * Gets the next available valid key for a provider.
 * @param {string} provider - 'seedream' or 'stability'
 * @returns {string|null} - The key, or null if exhausted
 */
export async function getNextKey(provider) {
  if (provider === 'seedream') {
    const key1 = process.env.SEEDREAM_KEY_1;
    const key2 = process.env.SEEDREAM_KEY_2;
    if (key1 && !blacklistedKeys.has(key1)) return key1;
    if (key2 && !blacklistedKeys.has(key2)) return key2;
  }
  
  if (provider === 'stability') {
    const key = process.env.STABILITY_API_KEY;
    if (key && !blacklistedKeys.has(key)) return key;
  }
  
  return null;
}

/**
 * Blacklists a key to prevent further use during this server instance.
 * @param {string} provider 
 * @param {string} key 
 */
export async function blacklistKey(provider, key) {
  if (key) {
    blacklistedKeys.add(key);
    console.warn(`[KeyManager] Blacklisted key for ${provider}: ${key.substring(0, 8)}...`);
  }
}
