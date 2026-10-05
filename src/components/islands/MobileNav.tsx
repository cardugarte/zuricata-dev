import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/projects', label: 'Projects' },
  { href: '/contact', label: 'Contact' },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="text-text-label transition-colors duration-200 hover:text-accent"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span className="relative block h-11 w-11">
          <Menu
            size={22}
            className={`absolute inset-0 m-auto transition-all duration-200 ${
              open ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
            }`}
          />
          <X
            size={22}
            className={`absolute inset-0 m-auto transition-all duration-200 ${
              open ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
            }`}
          />
        </span>
      </button>

      <div
        className={`absolute left-0 right-0 top-14 overflow-hidden border-b border-border bg-surface-base transition-all duration-200 ease-out ${
          open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 border-transparent'
        }`}
      >
        <nav className="mx-auto flex max-w-3xl flex-col px-6 py-3">
          {navLinks.map(({ href, label }, index) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="nav-link block py-3 no-underline transition-all duration-200"
              style={{
                transitionDelay: open ? `${index * 50}ms` : '0ms',
                opacity: open ? 1 : 0,
                transform: open ? 'translateX(0)' : 'translateX(-8px)',
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
