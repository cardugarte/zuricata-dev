export interface Talk {
  slug: string;
  title: string;
  description: string;
  meta: string;
  date?: string;
}

/**
 * Published decks from cardugarte/talks, built with their original
 * base path (`/talks/<slug>/`) and served as static files from public/talks.
 * Order is newest first when a date is known.
 */
export const talks: Talk[] = [
  {
    slug: 'campamento-de-agentes',
    title: 'Un campamento de agentes',
    description:
      'Cómo Travelsats publica en redes todos los días con Grok Bot.',
    meta: '3 oct 2026, Grok Bot Meetup Mendoza',
    date: '2026-10-03',
  },
  {
    slug: 'punatech-2026',
    title: 'De chatbot a colega',
    description:
      'Agentes de IA que trabajan con vos: del modelo de lenguaje al colega digital.',
    meta: 'Mayo 2026, PunaTech, Salta',
    date: '2026-05',
  },
  {
    slug: 'agents-at-work',
    title: 'Agents at Work',
    description: 'De chatbot a colega.',
    meta: '2026, OpenClaw',
    date: '2026',
  },
  {
    slug: 'guerra-silenciosa-ia',
    title: 'La guerra silenciosa',
    description: 'Chips, centros de datos, modelos y poder geopolítico.',
    meta: 'Aleph Hackathon Mendoza Hub',
  },
];
