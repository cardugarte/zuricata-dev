export interface Link {
  label: string;
  url: string;
  description: string;
  icon: 'github' | 'x' | 'nostr' | 'plane' | 'mail';
}

export const links: Link[] = [
  {
    label: 'GitHub',
    url: 'https://github.com/cardugarte',
    description: 'Code, contributions, and open source.',
    icon: 'github',
  },
  {
    label: 'X',
    url: 'https://x.com/cardugarte',
    description: 'Thoughts on AI, Bitcoin, and building.',
    icon: 'x',
  },
  {
    label: 'Nostr',
    url: 'https://primal.net/p/npub12ehepccx7dudmcdlegw9k6acjdyj4xyz5wrxsy3snac4fjlsrldq2tq6hm',
    description: 'Decentralized. Censorship-resistant. Sovereign.',
    icon: 'nostr',
  },
  {
    label: 'Travelsats',
    url: 'https://travelsats.ar',
    description: 'Adventure travel meets Lightning.',
    icon: 'plane',
  },
  {
    label: 'Email',
    url: 'mailto:hi@zuricata.dev',
    description: 'For direct communication. PGP preferred.',
    icon: 'mail',
  },
];
