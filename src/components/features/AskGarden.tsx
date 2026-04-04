'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  oracleText?: string;
  oracleLoading?: boolean;
  oracleError?: string;
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
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const streamOracle = useCallback(async (query: string, messageId: number) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);

    try {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Oracle unavailable (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const text = accumulated;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, oracleText: text, oracleLoading: true } : m
          )
        );
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, oracleLoading: false } : m
        )
      );
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, oracleLoading: false, oracleError: 'The Oracle is resting. Try again later.' }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, []);

  function ask(query: string) {
    if (!query.trim() || isStreaming) return;

    const userMsg: Message = { id: nextId.current++, type: 'user', text: query };

    const results = fuse.search(query).slice(0, 8);
    const plantMatches: PlantMatch[] = results.map((r) => ({
      slug: r.item.slug,
      name: r.item.name,
      latinName: r.item.latinName,
      family: r.item.family,
      excerpt: getExcerpt(r.item, query),
    }));

    const gardenMsgId = nextId.current++;
    const gardenMsg: Message = {
      id: gardenMsgId,
      type: 'garden',
      text: buildResponse(query, plantMatches),
      plants: plantMatches,
      oracleText: '',
      oracleLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, gardenMsg]);
    setInput('');
    inputRef.current?.focus();

    // Stream Oracle response
    streamOracle(query, gardenMsgId);
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
              Ask about symptoms, plants, or traditional uses. The garden will search its knowledge of {plants.length} medicinal plants, and the Oracle will share deeper wisdom.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="text-sm bg-surface border border-border rounded-[4px] px-4 py-2 text-text-muted hover:border-burnt/40 hover:text-burnt transition-colors"
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
              <div className="max-w-[80%] bg-sienna text-cream rounded-[4px] rounded-br-sm px-4 py-3">
                <p className="text-sm">{msg.text}</p>
              </div>
            ) : (
              <div className="max-w-[90%] space-y-3">
                {/* Fuzzy search results */}
                <div className="bg-cream border border-border rounded-[4px] rounded-bl-sm px-5 py-4 space-y-3">
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

                {/* Oracle response */}
                {(msg.oracleText || msg.oracleLoading || msg.oracleError) && (
                  <div className="bg-surface border border-burnt/20 rounded-[4px] rounded-bl-sm px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🔮</span>
                      <span className="text-sm font-semibold text-burnt" style={{ fontFamily: 'var(--font-display)' }}>
                        The Oracle says…
                      </span>
                      {msg.oracleLoading && !msg.oracleError && (
                        <span className="inline-block w-2 h-2 bg-burnt rounded-[4px] animate-pulse" />
                      )}
                    </div>

                    {msg.oracleError ? (
                      <p className="text-sm text-text-muted italic">{msg.oracleError}</p>
                    ) : (
                      <div className="text-sm text-text leading-relaxed whitespace-pre-wrap">
                        {msg.oracleText}
                        {msg.oracleLoading && <span className="inline-block w-1 h-4 bg-burnt/60 animate-pulse ml-0.5 align-text-bottom" />}
                      </div>
                    )}

                    {msg.oracleText && !msg.oracleLoading && (
                      <p className="mt-3 text-xs text-text-muted italic border-t border-border pt-2">
                        ⚠️ AI-generated information. Not medical advice. Consult a qualified herbalist or healthcare provider.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions after conversation starts */}
      {messages.length > 0 && !isStreaming && (
        <div className="flex flex-wrap gap-1.5 pb-2">
          {SUGGESTED.slice(0, 4).map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              className="text-xs bg-surface border border-border rounded-[4px] px-3 py-1 text-text-muted hover:border-burnt/40 hover:text-burnt transition-colors"
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
            placeholder={isStreaming ? 'The Oracle is thinking…' : 'Ask the garden a question…'}
            autoFocus
            disabled={isStreaming}
            className="flex-1 bg-surface border border-border rounded-[var(--radius-card)] px-4 py-3 text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:border-burnt focus:ring-1 focus:ring-burnt/30 transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
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
