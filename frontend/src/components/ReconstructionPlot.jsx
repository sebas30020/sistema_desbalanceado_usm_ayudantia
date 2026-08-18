import { memo } from 'react';
import { rotate } from '../lib/complex.js';
import { phaseColor, phaseLabel, seqColor } from '../lib/theme.js';
import { Arrow, Grid, VIEW, CENTER, toScreen } from './PhasorPlot.jsx';

// Suma grafica V0 + V1 + V2 = V para UNA fase: cada componente arranca donde
// termino la anterior, y la flecha gruesa es el fasor original medido desde el
// origen. Si los dos extremos coinciden, la identidad se cumple visualmente.
function ReconstructionPlot({ phase, system, chain, parts, scale, maxMag, angle, showTrace }) {
  const color = phaseColor[phase];
  const label = phaseLabel[phase];

  const rot = (v) => rotate(v, angle);
  const pts = chain.map((v) => toScreen(rot(v), scale));
  const origin = { x: CENTER, y: CENTER };
  const steps = [
    { key: 'v0', value: parts.zero, color: seqColor.zero, from: origin, to: pts[0], label: `V0${label.toLowerCase()}` },
    { key: 'v1', value: parts.positive, color: seqColor.positive, from: pts[0], to: pts[1], label: `V1${label.toLowerCase()}` },
    { key: 'v2', value: parts.negative, color: seqColor.negative, from: pts[1], to: pts[2], label: `V2${label.toLowerCase()}` },
  ];
  const resultant = toScreen(rot(system), scale);

  return (
    <figure className="plot">
      <figcaption>
        <span className="plot-title">RECONSTRUCCIÓN FASE {label}</span>
        <span className="plot-sub">V0 + V1 + V2 = V{label.toLowerCase()}</span>
      </figcaption>
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Reconstrucción fase ${label}`}>
        <Grid scale={scale} maxMag={maxMag} />

        {showTrace && (
          <circle cx={CENTER} cy={CENTER} r={Math.hypot(system.re, system.im) * scale} fill="none" stroke={color} strokeWidth="0.6" strokeDasharray="2,5" opacity="0.28" />
        )}

        {/* Poligono que encadena las tres componentes */}
        <polyline
          points={[origin, ...pts].map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none" stroke="rgba(200, 214, 216, 0.35)" strokeWidth="1" strokeDasharray="3,3"
        />

        {steps.map((s) => (
          <Arrow key={s.key} from={s.from} to={s.to} color={s.color} label={s.label} width={1.9} />
        ))}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.2" fill="rgba(220, 232, 234, 0.75)" />
        ))}

        {/* Fasor original: debe caer exactamente sobre el ultimo vertice */}
        <Arrow from={origin} to={resultant} color={color} label={`V${label.toLowerCase()}`} width={2.8} />
      </svg>
    </figure>
  );
}

export default memo(ReconstructionPlot);
