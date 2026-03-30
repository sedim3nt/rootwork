interface SafetyCardProps {
  contraindications: string[];
  sideEffects: string[];
  drugInteractions: string[];
  partsUsed: string[];
}

export default function SafetyCard({ contraindications, sideEffects, drugInteractions, partsUsed }: SafetyCardProps) {
  return (
    <div className="border-2 border-safety/30 bg-safety-bg/50 rounded-[var(--radius-card)] p-6">
      <h2 className="text-xl font-bold text-safety flex items-center gap-2 mb-5" style={{ fontFamily: 'var(--font-display)' }}>
        <span>⚠️</span> Safety Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Contraindications + Side Effects */}
        <div className="space-y-5">
          {contraindications.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-safety uppercase tracking-wide mb-2">Contraindications</h3>
              <ul className="space-y-1">
                {contraindications.map((item, i) => (
                  <li key={i} className="text-sm text-parchment pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-safety">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {sideEffects.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-caution uppercase tracking-wide mb-2">Side Effects</h3>
              <ul className="space-y-1">
                {sideEffects.map((item, i) => (
                  <li key={i} className="text-sm text-parchment pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-caution">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column: Drug Interactions + Parts Used */}
        <div className="space-y-5">
          {drugInteractions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-safety uppercase tracking-wide mb-2">Drug Interactions</h3>
              <ul className="space-y-1">
                {drugInteractions.map((item, i) => (
                  <li key={i} className="text-sm text-parchment pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-safety">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {partsUsed.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-sienna uppercase tracking-wide mb-2">Parts Used</h3>
              <ul className="space-y-1">
                {partsUsed.map((item, i) => (
                  <li key={i} className="text-sm text-parchment pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-sienna">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
