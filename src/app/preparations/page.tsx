import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Disclaimer from '@/components/ui/Disclaimer';
import { plants } from '@/lib/data';

export const metadata = {
  title: 'Preparation Methods — Rootwork',
  description: 'How to prepare medicinal plants: teas, tinctures, decoctions, poultices, and more.',
};

interface Method {
  name: string;
  description: string;
  instructions: string;
  keywords: string[];
}

const methods: Method[] = [
  {
    name: 'Tea / Infusion',
    description: 'Steeping dried or fresh herbs in hot water to extract water-soluble compounds. Best for leaves, flowers, and delicate plant parts.',
    instructions: 'Pour boiling water over 1-2 teaspoons of dried herb (or 1 tablespoon fresh) per cup. Cover and steep for 5-15 minutes. Strain and drink. Can be sweetened with honey.',
    keywords: ['tea', 'infusion', 'steep', 'tisane'],
  },
  {
    name: 'Decoction',
    description: 'Simmering tougher plant materials in water to extract compounds from roots, bark, and seeds that require more heat to release their properties.',
    instructions: 'Add 1-2 teaspoons of dried herb per cup of cold water. Bring to a boil, then reduce heat and simmer for 15-30 minutes. Strain while hot.',
    keywords: ['decoction', 'simmer', 'boil'],
  },
  {
    name: 'Tincture',
    description: 'Alcohol-based extract that preserves plant compounds for long-term storage. Tinctures are concentrated and taken in small doses.',
    instructions: 'Fill a jar with dried herb and cover with high-proof alcohol (vodka or grain alcohol). Seal and store in a dark place for 4-6 weeks, shaking daily. Strain and bottle. Typical dose: 1-3 mL (20-60 drops).',
    keywords: ['tincture', 'extract', 'alcohol'],
  },
  {
    name: 'Poultice / Salve',
    description: 'External preparations applied directly to the skin. Poultices use fresh or moistened dried herbs; salves are herb-infused oils mixed with beeswax.',
    instructions: 'Poultice: Mash fresh herbs or moisten dried herbs with warm water, apply directly to skin, and cover with a cloth. Salve: Infuse dried herbs in oil for 4-6 weeks, strain, then melt with beeswax (1:4 ratio).',
    keywords: ['poultice', 'salve', 'compress', 'plaster'],
  },
  {
    name: 'Topical Application',
    description: 'Direct application of plant materials, oils, or preparations to the skin for localized treatment of wounds, inflammation, or skin conditions.',
    instructions: 'Apply essential oils diluted in a carrier oil (2-3 drops per teaspoon of carrier). Fresh gel (like aloe) can be applied directly. Always patch test first.',
    keywords: ['topical', 'oil', 'cream', 'direct application', 'essential oil'],
  },
  {
    name: 'Culinary Use',
    description: 'Incorporating medicinal herbs into cooking for daily health benefits. Many culinary herbs have significant therapeutic properties when consumed regularly.',
    instructions: 'Add fresh or dried herbs to meals during cooking. Common approaches: seasoning blends, herbal vinegars, infused honeys, and adding fresh herbs to salads and dishes.',
    keywords: ['culinary', 'cooking', 'food', 'spice', 'seasoning'],
  },
  {
    name: 'Capsule / Extract',
    description: 'Concentrated, standardized preparations in capsule or liquid extract form. Provides precise dosing and is convenient for herbs with strong flavors.',
    instructions: 'Follow manufacturer dosing guidelines. Standardized extracts specify the concentration of active compounds. Store in a cool, dry place away from light.',
    keywords: ['capsule', 'supplement', 'standardized extract', 'powder'],
  },
];

function getPlantsForMethod(method: Method) {
  return plants.filter((p) =>
    p.preparations.some((prep) =>
      method.keywords.some((kw) => prep.toLowerCase().includes(kw))
    )
  ).slice(0, 8);
}

export default function PreparationsPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-parchment" style={{ fontFamily: 'var(--font-display)' }}>
          Preparation Methods
        </h1>
        <p className="text-text-muted mt-1">How to prepare medicinal plants safely and effectively.</p>
      </div>

      {methods.map((method) => {
        const matchedPlants = getPlantsForMethod(method);
        return (
          <section key={method.name} className="bg-surface border border-border rounded-[var(--radius-card)] p-6">
            <h2 className="text-2xl font-semibold text-parchment mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              {method.name}
            </h2>
            <p className="text-text-muted mb-4">{method.description}</p>

            <div className="bg-cream/50 border border-border rounded-[var(--radius-card)] p-4 mb-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">General Instructions</h3>
              <p className="text-sm text-parchment">{method.instructions}</p>
            </div>

            {matchedPlants.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Plants commonly prepared this way</h3>
                <div className="flex flex-wrap gap-2">
                  {matchedPlants.map((p) => (
                    <Badge key={p.slug} href={`/plants/${p.slug}`}>{p.name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}

      <Disclaimer />
    </div>
  );
}
