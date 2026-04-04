'use client';

import { useGarden } from '@/lib/garden-context';

export default function GardenBadge() {
  const { count } = useGarden();
  return (
    <a href="/garden" className="hover:text-burnt transition-colors relative">
      My Garden
      {count > 0 && (
        <span className="absolute -top-2 -right-4 bg-burnt text-cream text-[10px] font-bold w-4 h-4 rounded-[4px] flex items-center justify-center">
          {count}
        </span>
      )}
    </a>
  );
}
