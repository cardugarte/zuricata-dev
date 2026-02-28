export interface Link {
  label: string;
  url: string;
  description: string;
}

export const links: Link[] = [
  {
    label: 'GitHub',
    url: 'https://github.com/zuricata',
    description: 'Code, contributions, and open source.',
  },
  {
    label: 'Email',
    url: 'mailto:hello@zuricata.dev',
    description: 'For direct communication. PGP preferred.',
  },
];
