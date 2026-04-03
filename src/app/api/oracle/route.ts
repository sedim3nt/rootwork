import { streamText } from 'ai';
import { defaultModel } from '@/lib/ai-provider';
import plants from '@/data/plants.json';

type Plant = (typeof plants)[number];

function searchPlants(query: string): Plant[] {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter((t) => t.length > 2);

  const scored = plants.map((plant) => {
    let score = 0;
    const searchable = [
      plant.name,
      plant.latinName,
      plant.family,
      ...plant.traditionalUses,
      ...plant.modernUses,
      ...plant.compounds,
      ...plant.partsUsed,
    ]
      .join(' ')
      .toLowerCase();

    for (const term of terms) {
      if (plant.name.toLowerCase().includes(term)) score += 10;
      if (plant.latinName.toLowerCase().includes(term)) score += 8;
      if (searchable.includes(term)) score += 3;
    }

    return { plant, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((s) => s.plant);
}

function formatPlantContext(plant: Plant): string {
  return [
    `## ${plant.name} (${plant.latinName})`,
    `Family: ${plant.family}`,
    `Parts used: ${plant.partsUsed.join(', ')}`,
    `Key compounds: ${plant.compounds.slice(0, 5).join('; ')}`,
    `Traditional uses: ${plant.traditionalUses.slice(0, 4).join('; ')}`,
    `Modern uses: ${plant.modernUses.slice(0, 4).join('; ')}`,
    plant.contraindications?.length
      ? `⚠️ Contraindications: ${plant.contraindications.slice(0, 3).join('; ')}`
      : '',
    plant.drugInteractions?.length
      ? `⚠️ Drug interactions: ${plant.drugInteractions.slice(0, 3).join('; ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

const SYSTEM_PROMPT = `You are The Garden Oracle, a wise herbalist guiding people through the Rootwork botanical encyclopedia. You have deep knowledge of ${plants.length} medicinal plants.

When asked about a plant, draw from the encyclopedia data provided. When asked about symptoms or uses, recommend relevant plants from the collection. Always include: botanical name, common name, primary uses, and safety warnings.

NEVER provide dosage advice — always say "consult a qualified herbalist or healthcare provider for dosage."

Be warm, knowledgeable, like a grandmother who studied botany. Keep answers concise but thorough — 2-4 paragraphs max.

⚠️ Always end with: "This is for educational purposes only. Not medical advice. Consult a qualified herbalist or healthcare provider."`;

export async function POST(req: Request) {
  const { query } = (await req.json()) as { query: string };

  if (!query || typeof query !== 'string') {
    return new Response(JSON.stringify({ error: 'Query is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const relevant = searchPlants(query);
  const context =
    relevant.length > 0
      ? `\n\nRelevant plants from the encyclopedia:\n\n${relevant.map(formatPlantContext).join('\n\n---\n\n')}`
      : '\n\nNo exact matches found in the encyclopedia. Answer generally based on your herbalism knowledge, and let the user know which plants in our collection might be closest.';

  const result = streamText({
    model: defaultModel,
    system: SYSTEM_PROMPT + context,
    messages: [{ role: 'user', content: query }],
    maxOutputTokens: 1024,
  });

  return result.toTextStreamResponse();
}
