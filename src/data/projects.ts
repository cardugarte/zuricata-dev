export interface Project {
  title: string;
  description: string;
  url?: string;
  repo?: string;
  tags: string[];
  featured: boolean;
  status: 'active' | 'archived';
}

export const projects: Project[] = [
  {
    title: 'Travelsats',
    description:
      'Bitcoin-powered adventure tourism in Argentina. 50+ experiences, Lightning payments, Nostr identity.',
    url: 'https://travelsats.ar',
    tags: ['bitcoin', 'lightning', 'nostr', 'next.js'],
    featured: true,
    status: 'active',
  },
  {
    title: 'Xplorers',
    description:
      'AI automation agency. Chatbots, process optimization, sentiment analysis, and system integration for businesses.',
    url: 'https://xplorers.ar',
    tags: ['ai', 'n8n', 'automation'],
    featured: true,
    status: 'active',
  },
  {
    title: 'Notarial Assistant',
    description:
      'AI agent for Argentine notarial law. Google ADK, document editing, contract analysis with RAG.',
    repo: 'https://github.com/cardugarte/notarial-assistant',
    tags: ['python', 'google-adk', 'rag', 'supabase'],
    featured: true,
    status: 'active',
  },
  {
    title: 'zuricata.dev',
    description:
      'Personal site built with Astro, React islands, and Tailwind CSS. Dark cyberpunk aesthetic, zero third-party requests.',
    url: 'https://zuricata.dev',
    repo: 'https://github.com/cardugarte/zuricata-dev',
    tags: ['astro', 'react', 'tailwind'],
    featured: false,
    status: 'active',
  },
];
