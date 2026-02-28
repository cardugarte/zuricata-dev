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
    title: 'zuricata.dev',
    description:
      'Personal site built with Astro, React islands, and Tailwind CSS. Dark cyberpunk aesthetic, zero third-party requests.',
    url: 'https://zuricata.dev',
    repo: 'https://github.com/zuricata/zuricata-dev',
    tags: ['astro', 'react', 'tailwind'],
    featured: true,
    status: 'active',
  },
];
