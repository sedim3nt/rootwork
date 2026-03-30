'use client';

import { useState } from 'react';

const links = [
  { href: '/ask', label: 'Ask the Garden' },
  { href: '/search', label: 'Search' },
  { href: '/plants', label: 'All Plants' },
  { href: '/families', label: 'Families' },
  { href: '/uses', label: 'Uses' },
  { href: '/preparations', label: 'Preparations' },
  { href: '/explore', label: 'Knowledge Graph' },
  { href: '/interactions', label: 'Interaction Checker' },
  { href: '/symptoms', label: "What's Wrong?" },
  { href: '/garden', label: 'My Garden' },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-text-muted hover:text-burnt transition-colors"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-cream/98 backdrop-blur-sm border-b border-border shadow-lg z-40">
          <nav className="max-w-[1220px] mx-auto px-4 py-4 space-y-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm text-text-muted hover:text-burnt hover:bg-surface rounded-[var(--radius-card)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
