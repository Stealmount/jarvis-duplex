export const MODES = {
  general: {
    id: 'general',
    label: 'General',
    icon: null,       // No icon — it's the default
    color: '#666666',
    description: 'Everyday conversations',
    isDefault: true,
  },
  therapy: {
    id: 'therapy',
    label: 'Therapy',
    icon: '○',
    color: '#6EBF8B',
    description: 'Empathetic listener',
  },
  deep: {
    id: 'deep',
    label: 'Deep Think',
    icon: '◈',
    color: '#7B8FFF',
    description: 'Analytical reasoning',
  },
  study: {
    id: 'study',
    label: 'Study',
    icon: '◇',
    color: '#F5C842',
    description: 'Socratic tutoring',
  },
  research: {
    id: 'research',
    label: 'Research',
    icon: '◆',
    color: '#4ABDE8',
    description: 'Web research & analysis',
  },
};
