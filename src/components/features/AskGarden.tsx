'use client';

import { useState, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import Link from 'next/link';
import plants from '@/data/plants.json';
import Disclaimer from '@/components/ui/Disclaimer';

interface PlantMatch {
  slug: string;
  name: string;
  latinName: string;
  family: string;
  excerpt: string;
}

interface Message {
  id: number;
  type: 'user' | 'garden';
  text: string;
  plants?: PlantMatch[];
}

const fuse = new Fuse(plants, {
  keys: [
    { name: 'name', weight: 2 },
    { name: 'latinName', weight: 1.5 },
    { name: 'traditionalUses', weight: 1.2 },
    { name: 'modernUses', weight: 1.2 },
    { name: 'compounds', weight: 0.8 },
    { name: 'family', weight: 0.6 },
    { name: 'partsUsed', weight: 0.5 },
  ],
  threshold: 0.4,
  includeMatches: true,
  includeScore: true,
});

const SUGGESTED = [
  'What helps with sleep?',
  'Tell me about adaptogens',
  'Plants for digestion',
  'What has anti-inflammatory properties?',
  'Herbs for anxiety',
  'Plants for immune support',
];

function getExcerpt(plant: (typeof plants)[number], query: string): string {
  const q = query.toLowerCase();
  const allUses = [...plant.traditionalUses, ...plant.modernUses];
  const match = allUses.find((u) => u.toLowerCase().includes(q.split(' ').slice(-1)[0]));
  if (match) return match;
  return allUses[0] || plant.compounds.slice(0, 3).join(', ');
}

function buildResponse(query: string, matches: PlantMatch[]): string {
  if (matches.length === 0) {
    return "The garden doesn't have knowledge about that yet. Try searching for specific symptoms, plant names, or therapeutic uses.";
  }
  const count = matches.length;
  const q = query.toLowerCase();
  if (q.includes('adaptogen')) return `Here are ${count} adaptogens from the garden:`;
  if (q.includes('sleep') || q.includes('insomnia')) return `The garden knows ${count} plants that may support restful sleep:`;
  if (q.includes('anxiety') || q.includes('stress') || q.includes('calm')) return `Here are ${count} plants the garden suggests for calm and ease:`;
  if (q.includes('digest') || q.includes('stomach') || q.includes('gut')) return `The garden found ${count} plants for digestive support:`;
  if (q.includes('immune')) return `Here are ${count} plants the garden recommends for immune support:`;
  if (q.includes('inflam')) return `The garden found ${count} plants with anti-inflammatory properties:`;
  if (q.includes('pain')) return `Here are ${count} plants that may help with pain:`;
  if (q.includes('skin') || q.includes('wound')) return `The garden found ${count} plants for skin and wound care:`;
  return `The garden found ${count} plants related to your query:`;
}

export default function AskGarden() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  let nextId = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function ask(query: string) {
    if (!query.trim()) return;

    const userMsg: Message = { id: nextId.current++, type: 'user', text: query };

    const results = fuse.search(query).slice(0, 8);
    const plantMatches: PlantMatch[] = results.map((r) => ({
      slug: r.item.slug,
      name: r.item.name,
      latinName: r.item.latinName,
      family: r.item.family,
      excerpt: getExcerpt(r.item, query),
    }));

    const gardenMsg: Message = {
      id: nextId.current++,
      type: 'garden',
      text: buildResponse(query, plantMatches),
      plants: plantMatches,
    };

    setMessages((prev) => [...prev, userMsg, gardenMsg]);
    setInput('');
    inputRef.current?.focus();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    ask(input);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🌿</div>
            <h2 className="text-2xl font-semibold text-parchment mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Ask the Garden
            </h2>
            <p className="text-text-muted max-w-md mx-auto">
              Ask about symptoms, plants, or traditional uses. The garden will search its knowledge of 100 medicinal plants.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="text-sm bg-surface border border-border rounded-full px-4 py-2 text-text-muted hover:border-burnt/40 hover:text-burnt transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'user' ? (
              <div className="max-w-[80%] bg-sienna text-cream rounded-2xl rounded-br-sm px-4 py-3">
                <p className="text-sm">{msg.text}</p>
              </div>
            ) : (
              <div className="max-w-[90%] bg-cream border border-border rounded-2xl rounded-bl-sm px-5 py-4 space-y-3">
                <p className="text-sm text-parchment">{msg.text}</p>
                {msg.plants && msg.plants.length > 0 && (
                  <div className="grid gap-2">
                    {msg.plants.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/plants/${p.slug}`}
                        className="flex items-start gap-3 bg-surface border border-border rounded-[var(--radius-card)] p-3 hover:border-burnt/40 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-parchment group-hover:text-burnt transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                            {p.name}
                          </span>
                          <span className="text-xs italic text-text-muted ml-2">{p.latinName}</span>
                          <p className="text-xs text-text-muted mt-1 line-clamp-2">{p.excerpt}</p>
                        </div>
                        <span className="text-xs text-burnt shrink-0">{p.family}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions after conversation starts */}
      {messages.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-2">
          {SUGGESTED.slice(0, 4).map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              className="text-xs bg-surface border border-border rounded-full px-3 py-1 text-text-muted hover:border-burnt/40 hover:text-burnt transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="sticky bottom-0 bg-bg pt-2">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the garden a question…"
            autoFocus
            className="flex-1 bg-surface border border-border rounded-[var(--radius-card)] px-4 py-3 text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-burnt focus:ring-1 focus:ring-burnt/30 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-burnt text-cream px-5 py-3 rounded-[var(--radius-card)] text-sm font-medium hover:bg-burnt/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Ask
          </button>
        </div>
        <div className="mt-2">
          <Disclaimer />
        </div>
      </form>
    </div>
  );
}
