const GUEST_KEY    = 'jarvis_guest_id';
const GUEST_MSGS   = 'jarvis_guest_msgs';
const GUEST_IMGS   = 'jarvis_guest_imgs';
const GUEST_EXPIRY = 'jarvis_guest_expiry';
const WEEK_MS      = 7 * 24 * 60 * 60 * 1000;

export function getOrCreateGuestId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = 'guest_' + Math.random().toString(36).slice(2);
    localStorage.setItem(GUEST_KEY, id);
    // Set expiry 1 week from now
    localStorage.setItem(GUEST_EXPIRY, Date.now() + WEEK_MS);
  }
  return id;
}

export function getGuestUsage() {
  if (typeof window === 'undefined') return null;
  const expiry = parseInt(localStorage.getItem(GUEST_EXPIRY) || '0');

  // If expired, reset
  if (Date.now() > expiry) {
    localStorage.setItem(GUEST_MSGS, '0');
    localStorage.setItem(GUEST_IMGS, '0');
    localStorage.setItem(GUEST_EXPIRY, Date.now() + WEEK_MS);
  }

  return {
    messages:   parseInt(localStorage.getItem(GUEST_MSGS) || '0'),
    images:     parseInt(localStorage.getItem(GUEST_IMGS) || '0'),
    msgLimit:   50,
    imgLimit:   10,
    expiresAt:  expiry,
    msgsLeft:   50 - parseInt(localStorage.getItem(GUEST_MSGS) || '0'),
    imgsLeft:   10 - parseInt(localStorage.getItem(GUEST_IMGS) || '0'),
  };
}

export function incrementGuestMessage() {
  if (typeof window === 'undefined') return null;
  const current = parseInt(localStorage.getItem(GUEST_MSGS) || '0');
  localStorage.setItem(GUEST_MSGS, current + 1);
  return current + 1;
}

export function incrementGuestImage() {
  if (typeof window === 'undefined') return null;
  const current = parseInt(localStorage.getItem(GUEST_IMGS) || '0');
  localStorage.setItem(GUEST_IMGS, current + 1);
  return current + 1;
}

export function isGuestLimitReached(type) {
  if (typeof window === 'undefined') return false;
  const usage = getGuestUsage();
  if (type === 'message') return usage.messages >= usage.msgLimit;
  if (type === 'image')   return usage.images >= usage.imgLimit;
  return false;
}
