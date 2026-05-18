// Time-based greeting system

export function getGreeting(userInfo) {
  const hour = new Date().getHours();

  let timeGreeting;
  if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
  else if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
  else if (hour >= 17 && hour < 21) timeGreeting = 'Good evening';
  else timeGreeting = 'Good night';

  let name = null;
  if (userInfo?.name) {
    const nameParts = userInfo.name.trim().split(/\s+/);
    name = nameParts[0];
  }

  return name ? `${timeGreeting}, ${name}.` : `${timeGreeting}.`;
}

export function getSubtitle(userInfo) {
  if (!userInfo || userInfo.role === 'guest') {
    return 'Sign in to save your conversations.';
  }
  return 'How can I help you today?';
}
