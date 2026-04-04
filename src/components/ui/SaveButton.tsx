'use client';

import { useGarden } from '@/lib/garden-context';

interface SaveButtonProps {
  slug: string;
  size?: 'sm' | 'md';
}

export default function SaveButton({ slug, size = 'sm' }: SaveButtonProps) {
  const { isSaved, toggle } = useGarden();
  const active = isSaved(slug);
  const dim = size === 'md' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(slug); }}
      aria-label={active ? 'Remove from garden' : 'Save to garden'}
      className="p-1 rounded-[4px] hover:bg-cream-dark/40 transition-colors"
    >
      <svg className={`${dim} transition-colors ${active ? 'text-burnt fill-burnt' : 'text-text-muted'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} fill={active ? 'currentColor' : 'none'}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    </button>
  );
}
