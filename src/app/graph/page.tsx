'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { plants as allPlantsData } from '@/lib/data'
import Link from 'next/link'

interface PlantNode extends d3.SimulationNodeDatum {
  id: string
  name: string
  family: string
  uses: string[]
  type: 'plant' | 'family' | 'use'
  radius: number
}

interface PlantLink extends d3.SimulationLinkDatum<PlantNode> {
  type: 'family' | 'use'
}

export default function GraphPage() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [viewMode, setViewMode] = useState<'family' | 'use'>('family')
  const [selectedNode, setSelectedNode] = useState<PlantNode | null>(null)
  const plants = allPlantsData

  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth || 900
    const height = 600

    const nodes: PlantNode[] = []
    const links: PlantLink[] = []
    const familySet = new Set<string>()
    const useSet = new Set<string>()

    // Build nodes
    plants.forEach((p: any) => {
      nodes.push({
        id: p.slug,
        name: p.name,
        family: p.family || 'Unknown',
        uses: p.therapeuticUses || [],
        type: 'plant',
        radius: 6,
      })
      if (p.family && !familySet.has(p.family)) {
        familySet.add(p.family)
        nodes.push({ id: `fam-${p.family}`, name: p.family, family: p.family, uses: [], type: 'family', radius: 14 })
      }
      if (viewMode === 'use') {
        (p.therapeuticUses || []).forEach((u: string) => {
          if (!useSet.has(u)) {
            useSet.add(u)
            nodes.push({ id: `use-${u}`, name: u, family: '', uses: [], type: 'use', radius: 12 })
          }
        })
      }
    })

    // Build links
    plants.forEach((p: any) => {
      if (viewMode === 'family' && p.family) {
        links.push({ source: p.slug, target: `fam-${p.family}`, type: 'family' })
      }
      if (viewMode === 'use') {
        (p.therapeuticUses || []).forEach((u: string) => {
          links.push({ source: p.slug, target: `use-${u}`, type: 'use' })
        })
      }
    })

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10)

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(60))
      .force('charge', d3.forceManyBody().strength(-80))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 2))

    const g = svg.append('g')

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (e) => g.attr('transform', e.transform))
    svg.call(zoom)

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#5C4A32')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', 1)

    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => {
        if (d.type === 'family') return colorScale(d.name)
        if (d.type === 'use') return '#C85A2A'
        return '#8B7355'
      })
      .attr('stroke', (d) => d.type === 'plant' ? '#F5E6D3' : 'none')
      .attr('stroke-width', (d) => d.type === 'plant' ? 1 : 0)
      .attr('cursor', 'pointer')
      .on('click', (_, d) => setSelectedNode(d))
      .call(d3.drag<any, PlantNode>()
        .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
        .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null })
      )

    const label = g.append('g')
      .selectAll('text')
      .data(nodes.filter(n => n.type !== 'plant'))
      .join('text')
      .text((d) => d.name)
      .attr('font-size', 11)
      .attr('fill', '#F5E6D3')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => -d.radius - 4)
      .style('font-family', 'var(--font-display), serif')
      .style('pointer-events', 'none')

    simulation.on('tick', () => {
      link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y)
      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y)
      label.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y)
    })

    return () => { simulation.stop() }
  }, [viewMode, plants])

  return (
    <main className="min-h-screen" style={{ background: '#1A1208', color: '#F5E6D3' }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/" className="text-sm opacity-60 hover:opacity-100" style={{ color: '#C85A2A' }}>← Back to Rootwork</Link>

        <h1 className="text-4xl font-bold mt-6 mb-2" style={{ fontFamily: 'var(--font-display), serif' }}>
          Knowledge Graph
        </h1>
        <p className="text-lg opacity-70 mb-8">
          {plants.length} plants connected by {viewMode === 'family' ? 'botanical family' : 'therapeutic use'}. Drag nodes. Scroll to zoom.
        </p>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setViewMode('family')}
            className="px-4 py-2 rounded-[4px] text-sm font-medium transition-all"
            style={{
              background: viewMode === 'family' ? '#C85A2A' : 'transparent',
              border: `1px solid ${viewMode === 'family' ? '#C85A2A' : '#5C4A32'}`,
              color: '#F5E6D3',
            }}
          >
            By Family
          </button>
          <button
            onClick={() => setViewMode('use')}
            className="px-4 py-2 rounded-[4px] text-sm font-medium transition-all"
            style={{
              background: viewMode === 'use' ? '#C85A2A' : 'transparent',
              border: `1px solid ${viewMode === 'use' ? '#C85A2A' : '#5C4A32'}`,
              color: '#F5E6D3',
            }}
          >
            By Therapeutic Use
          </button>
        </div>

        <div className="rounded-[4px] overflow-hidden" style={{ border: '1px solid #5C4A32', background: '#0F0A04' }}>
          <svg ref={svgRef} width="100%" height={600} />
        </div>

        {selectedNode && (
          <div className="mt-6 p-6 rounded-[4px]" style={{ background: '#2A1F10', border: '1px solid #5C4A32' }}>
            <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display), serif' }}>
              {selectedNode.name}
            </h3>
            {selectedNode.type === 'plant' && (
              <>
                <p className="text-sm opacity-70 mt-1">Family: {selectedNode.family}</p>
                {selectedNode.uses.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedNode.uses.map((u) => (
                      <span key={u} className="px-2 py-1 rounded-[4px] text-xs" style={{ background: '#3A2A16', color: '#C85A2A' }}>{u}</span>
                    ))}
                  </div>
                )}
                <Link href={`/plants/${selectedNode.id}`} className="inline-block mt-4 text-sm font-medium hover:underline" style={{ color: '#C85A2A' }}>
                  View full profile →
                </Link>
              </>
            )}
            {selectedNode.type === 'family' && (
              <p className="text-sm opacity-70 mt-1">
                {plants.filter((p: any) => p.family === selectedNode.name).length} plants in this family
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
