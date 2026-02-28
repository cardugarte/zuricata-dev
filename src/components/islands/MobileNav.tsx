import { useState } from 'react';

const navLinks = [
  { href: '/', label: '~/home' },
  { href: '/blog', label: '~/blog' },
  { href: '/projects', label: '~/projects' },
  { href: '/contact', label: '~/contact' },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="font-mono text-sm text-text-secondary"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? '[close]' : '[menu]'}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-14 border-b border-border bg-surface-base/95 backdrop-blur-md">
          <nav className="mx-auto flex max-w-3xl flex-col gap-1 px-6 py-4">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="nav-link block py-2 no-underline"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
