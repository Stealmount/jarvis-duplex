'use client';
import JarvisLogo from './JarvisLogo';
import { getGreeting, getSubtitle } from '@/lib/greeting';

const STARTERS = {
  general: [
    { text: 'Help me think through a decision', sub: 'Decision support' },
    { text: 'Explain something complex simply', sub: 'Learning' },
    { text: 'Review my writing', sub: 'Writing' },
    { text: 'Help me debug this code', sub: 'Coding' },
  ],
  therapy: [
    { text: "Something's been weighing on me", sub: 'Emotional processing' },
    { text: 'I need help thinking something through', sub: 'Cognitive clarity' },
    { text: 'I want to talk through what happened', sub: 'Reflective journaling' },
    { text: 'I want to understand myself better', sub: 'Pattern discovery' },
  ],
  deep: [
    { text: 'Analyze this problem from first principles', sub: 'First principles' },
    { text: 'What are the second-order effects of...', sub: 'Systems thinking' },
    { text: 'Help me find flaws in this argument', sub: 'Critical analysis' },
    { text: 'Prove or disprove this idea', sub: 'Rigorous reasoning' },
  ],
  study: [
    { text: 'Explain this concept with examples', sub: 'Conceptual clarity' },
    { text: 'Quiz me on what I just learned', sub: 'Active recall' },
    { text: 'Help me understand this problem', sub: 'Guided learning' },
    { text: 'What are the common mistakes in...', sub: 'Error pattern recognition' },
  ],
  research: [
    { text: 'Research and summarize this topic', sub: 'Research summary' },
    { text: 'Compare and contrast these two things', sub: 'Comparative analysis' },
    { text: 'What are the latest developments in...', sub: 'Current research' },
    { text: 'Find sources and evidence for...', sub: 'Source finding' },
  ],
};

export default function GreetingScreen({ userInfo, currentMode, onPromptSelect }) {
  const starters = STARTERS[currentMode] || STARTERS.general;
  const greeting = getGreeting(userInfo);
  const subtitle = getSubtitle(userInfo);

  return (
    <div className="greeting-screen">
      <div className="greeting-logo-wrap">
        <JarvisLogo size="greeting" />
      </div>
      <div className="greeting-text">
        <h1 className="greeting-headline">{greeting}</h1>
        <p className="greeting-sub">{subtitle}</p>
      </div>
      <div className="starter-prompts">
        {starters.map((prompt, i) => (
          <button
            key={i}
            className="starter-card"
            onClick={() => onPromptSelect(prompt.text)}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="starter-text">{prompt.text}</span>
            <span className="starter-sub">{prompt.sub}</span>
            <span className="starter-arrow">→</span>
          </button>
        ))}
      </div>
      <p className="greeting-hint">Or just start typing below...</p>
    </div>
  );
}
