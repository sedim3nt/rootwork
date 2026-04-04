'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import plants from '@/data/plants.json';
import categories from '@/data/categories.json';
import Disclaimer from '@/components/ui/Disclaimer';

type Plant = (typeof plants)[number];

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Edge {
  source: string;
  target: string;
  type: 'family' | 'use';
}

function buildGraph(filter: 'all' | 'family' | 'use') {
  // Use a subset for performance — pick plants spread across families
  const familyMap = new Map<string, Plant[]>();
  for (const p of plants) {
    const existing = familyMap.get(p.family) || [];
    existing.push(p);
    familyMap.set(p.family, existing);
  }

  // Take up to 2 plants per family, max 40 nodes for readability
  const selectedPlants: Plant[] = [];
  for (const [, fPlants] of familyMap) {
    selectedPlants.push(...fPlants.slice(0, 2));
    if (selectedPlants.length >= 40) break;
  }

  const nodes: Node[] = selectedPlants.map((p, i) => {
    const angle = (i / selectedPlants.length) * 2 * Math.PI;
    const r = 250 + Math.random() * 100;
    return {
      id: p.slug,
      label: p.name,
      x: 400 + r * Math.cos(angle),
      y: 350 + r * Math.sin(angle),
      vx: 0,
      vy: 0,
    };
  });

  const edges: Edge[] = [];
  const slugSet = new Set(selectedPlants.map((p) => p.slug));

  if (filter !== 'use') {
    // Family edges
    for (const [, fPlants] of familyMap) {
      const inGraph = fPlants.filter((p) => slugSet.has(p.slug));
      for (let i = 0; i < inGraph.length; i++) {
        for (let j = i + 1; j < inGraph.length; j++) {
          edges.push({ source: inGraph[i].slug, target: inGraph[j].slug, type: 'family' });
        }
      }
    }
  }

  if (filter !== 'family') {
    // Shared use edges (from categories)
    for (const cat of categories) {
      const catSlugs = (cat.plants || [])
        .map((p: { slug: string; name: string }) => p.slug)
        .filter((s: string) => slugSet.has(s));

      for (let i = 0; i < catSlugs.length; i++) {
        for (let j = i + 1; j < catSlugs.length; j++) {
          // Avoid duplicate edges
          if (!edges.some((e) => e.type === 'use' && ((e.source === catSlugs[i] && e.target === catSlugs[j]) || (e.source === catSlugs[j] && e.target === catSlugs[i])))) {
            edges.push({ source: catSlugs[i], target: catSlugs[j], type: 'use' });
          }
        }
      }
    }
  }

  return { nodes, edges };
}

function simulate(nodes: Node[], edges: Edge[], iterations: number): Node[] {
  const result = nodes.map((n) => ({ ...n }));
  const centerX = 400;
  const centerY = 350;

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations;

    // Repulsion between all nodes
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const dx = result[j].x - result[i].x;
        const dy = result[j].y - result[i].y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (800 * alpha) / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        result[i].vx -= fx;
        result[i].vy -= fy;
        result[j].vx += fx;
        result[j].vy += fy;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const a = result.find((n) => n.id === edge.source)!;
      const b = result.find((n) => n.id === edge.target)!;
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const force = (dist - 120) * 0.01 * alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Center gravity
    for (const node of result) {
      node.vx += (centerX - node.x) * 0.001 * alpha;
      node.vy += (centerY - node.y) * 0.001 * alpha;
    }

    // Apply velocities with damping
    for (const node of result) {
      node.vx *= 0.6;
      node.vy *= 0.6;
      node.x += node.vx;
      node.y += node.vy;
      // Bounds
      node.x = Math.max(40, Math.min(760, node.x));
      node.y = Math.max(40, Math.min(660, node.y));
    }
  }

  return result;
}

export default function ExplorePage() {
  const [filter, setFilter] = useState<'all' | 'family' | 'use'>('all');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const router = useRouter();

  const { nodes: rawNodes, edges } = useMemo(() => buildGraph(filter), [filter]);
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    const simulated = simulate(rawNodes, edges, 150);
    setNodes(simulated);
  }, [rawNodes, edges]);

  const connectedToHovered = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const connected = new Set<string>();
    for (const edge of edges) {
      if (edge.source === hoveredNode) connected.add(edge.target);
      if (edge.target === hoveredNode) connected.add(edge.source);
    }
    return connected;
  }, [hoveredNode, edges]);

  const handleNodeClick = useCallback((slug: string) => {
    router.push(`/plants/${slug}`);
  }, [router]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-parchment" style={{ fontFamily: 'var(--font-display)' }}>
          Knowledge Graph
        </h1>
        <p className="text-text-muted mt-1">
          Explore relationships between plants. Click any plant to view its profile.
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'family', 'use'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-4 py-2 rounded-[4px] border transition-colors ${
              filter === f ? 'bg-burnt text-cream border-burnt' : 'bg-surface border-border text-text-muted hover:border-burnt/40'
            }`}
          >
            {f === 'all' ? 'All Connections' : f === 'family' ? 'Family' : 'Shared Uses'}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-burnt inline-block rounded-[4px]" /> Family
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-sienna inline-block rounded-[4px]" /> Shared Use
        </span>
      </div>

      {/* Graph */}
      <div className="bg-cream border border-border rounded-[var(--radius-card)] overflow-hidden">
        <svg viewBox="0 0 800 700" className="w-full h-auto" style={{ minHeight: 400 }}>
          {/* Edges */}
          {edges.map((edge, i) => {
            const a = nodes.find((n) => n.id === edge.source);
            const b = nodes.find((n) => n.id === edge.target);
            if (!a || !b) return null;
            const isHighlighted = hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode);
            const isOther = hoveredNode && !isHighlighted;
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={edge.type === 'family' ? '#C17817' : '#4A3728'}
                strokeWidth={isHighlighted ? 2 : 0.5}
                opacity={isOther ? 0.05 : isHighlighted ? 0.8 : 0.15}
              />
            );
          })}
          {/* Nodes */}
          {nodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            const isConnected = connectedToHovered.has(node.id);
            const isDimmed = hoveredNode && !isHovered && !isConnected;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
                opacity={isDimmed ? 0.2 : 1}
              >
                <circle
                  r={isHovered ? 8 : 5}
                  fill={isHovered ? '#C17817' : '#4A3728'}
                  stroke="#F2E8DC"
                  strokeWidth={1.5}
                />
                <text
                  y={isHovered ? -12 : -9}
                  textAnchor="middle"
                  className="text-[9px] fill-parchment pointer-events-none"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: isHovered ? 600 : 400 }}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <Disclaimer />
    </div>
  );
}
