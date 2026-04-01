import Link from 'next/link';
import { categories } from '@/lib/data';
import Disclaimer from '@/components/ui/Disclaimer';

export const metadata = {
  title: 'Therapeutic Uses — Rootwork',
  description: 'Browse medicinal plants by therapeutic category and traditional use.',
};

export default function UsesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-parchment" style={{ fontFamily: 'var(--font-display)' }}>
          Therapeutic Categories
        </h1>
        <p className="text-text-muted mt-1">{categories.length} categories</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const plantCount = cat.plants.length;
          return (
            <Link
              key={cat.slug}
              href={`/uses/${cat.slug}`}
              className="bg-surface border border-border rounded-[var(--radius-card)] p-5 hover:border-burnt/40 hover:shadow-md transition-all group"
            >
              <h3 className="font-semibold text-parchment group-hover:text-burnt transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                {cat.name}
              </h3>
              <p className="text-xs text-burnt mt-1">{plantCount} plant{plantCount !== 1 ? 's' : ''}</p>
              {cat.plants.length > 0 && (
                <p className="text-xs text-text-muted mt-2 line-clamp-2">
                  {cat.plants.slice(0, 3).map((p: {name:string}) => p.name).join(' · ')}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      <Disclaimer />
    </div>
  );
}
