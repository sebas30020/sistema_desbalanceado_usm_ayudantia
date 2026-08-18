import { memo, useMemo } from 'react';
import { mag, angDeg } from '../lib/complex.js';
import { plot, niceStep } from '../lib/theme.js';

// Sistema de coordenadas del diagrama, en unidades del viewBox.
export const VIEW = 250;
export const CENTER = VIEW / 2;
export const RADIUS = 92;
const TRAIL_DEG = 55;

const DEG = Math.PI / 180;

// Plano complejo -> pantalla. El eje imaginario se invierte porque en SVG la
// coordenada y crece hacia abajo; asi un angulo creciente gira antihorario.
export const toScreen = (v, scale, ox = 0, oy = 0) => ({
  x: CENTER + ox + v.re * scale,
  y: CENTER + oy - v.im * scale,
});

const polar = (r, deg) => ({
  x: CENTER + r * Math.cos(deg * DEG),
  y: CENTER - r * Math.sin(deg * DEG),
});

function arcPath(r, fromDeg, toDeg) {
  const p1 = polar(r, fromDeg);
  const p2 = polar(r, toDeg);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  // sweep-flag 0 = antihorario en pantalla (por el eje y invertido).
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 0 ${p2.x} ${p2.y}`;
}

// Flecha desde (ox, oy) hasta el extremo del fasor, con punta y etiqueta.
export function Arrow({ from, to, color, label, width = 2, labelSide = 1, dim = false }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.4) return null;

  const head = Math.min(9, Math.max(4, len * 0.28));
  const a = Math.atan2(dy, dx);
  const p1 = { x: to.x - head * Math.cos(a - Math.PI / 7), y: to.y - head * Math.sin(a - Math.PI / 7) };
  const p2 = { x: to.x - head * Math.cos(a + Math.PI / 7), y: to.y - head * Math.sin(a + Math.PI / 7) };
  // La etiqueta se aleja del origen siguiendo la direccion del fasor.
  const lx = to.x + (dx / len) * 13 * labelSide;
  const ly = to.y + (dy / len) * 13 * labelSide;

  return (
    <g opacity={dim ? 0.55 : 1}>
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${to.x},${to.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`} fill={color} />
      {label && (
        <text x={lx} y={ly} fill={color} fontSize="11" fontWeight="700" textAnchor="middle" dominantBaseline="middle">
          {label}
        </text>
      )}
    </g>
  );
}

export function Grid({ scale, maxMag, unit = 'p.u.' }) {
  const rings = useMemo(() => {
    const step = niceStep(maxMag);
    const out = [];
    for (let k = 1; k * step * scale <= RADIUS + 0.5; k += 1) {
      out.push({ value: k * step, r: k * step * scale });
    }
    return out;
  }, [scale, maxMag]);

  return (
    <g>
      <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={plot.face} stroke={plot.ringStrong} strokeWidth="1" />
      {/* Radios cada 30 grados */}
      {Array.from({ length: 12 }, (_, i) => i * 30).map((d) => {
        const p = polar(RADIUS, d);
        return <line key={d} x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} stroke={plot.spoke} strokeWidth="0.75" />;
      })}
      {/* Anillos de magnitud, rotulados sobre el eje real positivo */}
      {rings.map((ring) => (
        <g key={ring.value}>
          <circle cx={CENTER} cy={CENTER} r={ring.r} fill="none" stroke={plot.ring} strokeWidth="0.75" strokeDasharray="3,4" />
          <text x={CENTER + ring.r} y={CENTER + 10} fill={plot.tick} fontSize="7.5" textAnchor="middle">
            {ring.value >= 1 ? ring.value.toFixed(1) : ring.value.toFixed(2)}
          </text>
        </g>
      ))}
      {/* Ejes real e imaginario */}
      <line x1={CENTER - RADIUS - 8} y1={CENTER} x2={CENTER + RADIUS + 8} y2={CENTER} stroke={plot.axis} strokeWidth="0.9" />
      <line x1={CENTER} y1={CENTER + RADIUS + 8} x2={CENTER} y2={CENTER - RADIUS - 8} stroke={plot.axis} strokeWidth="0.9" />
      <polygon points={`${CENTER + RADIUS + 12},${CENTER} ${CENTER + RADIUS + 5},${CENTER - 3.2} ${CENTER + RADIUS + 5},${CENTER + 3.2}`} fill={plot.axis} />
      <polygon points={`${CENTER},${CENTER - RADIUS - 12} ${CENTER - 3.2},${CENTER - RADIUS - 5} ${CENTER + 3.2},${CENTER - RADIUS - 5}`} fill={plot.axis} />
      <text x={CENTER + RADIUS + 16} y={CENTER + 3.5} fill={plot.tick} fontSize="8.5" fontStyle="italic">Re</text>
      <text x={CENTER + 6} y={CENTER - RADIUS - 13} fill={plot.tick} fontSize="8.5" fontStyle="italic">Im</text>
      <text x={CENTER + RADIUS + 16} y={CENTER + 14} fill={plot.tick} fontSize="7">{unit}</text>
    </g>
  );
}

// Diagrama fasorial: grilla con escala legible + los fasores girando a wt.
function PhasorPlot({ title, subtitle, vectors, scale, maxMag, angle, showTrace, unit = 'p.u.' }) {
  return (
    <figure className="plot">
      <figcaption>
        <span className="plot-title">{title}</span>
        {subtitle && <span className="plot-sub">{subtitle}</span>}
      </figcaption>
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={title}>
        <Grid scale={scale} maxMag={maxMag} unit={unit} />

        {showTrace &&
          vectors.map((v) => {
            const r = mag(v.value) * scale;
            if (r < 2) return null;
            const tip = angDeg(v.value) + angle;
            return (
              <g key={`trace-${v.key}`}>
                <circle cx={CENTER} cy={CENTER} r={r} fill="none" stroke={v.color} strokeWidth="0.6" strokeDasharray="2,5" opacity="0.30" />
                <path d={arcPath(r, tip - TRAIL_DEG, tip)} fill="none" stroke={v.color} strokeWidth="2" strokeLinecap="round" opacity="0.35" />
              </g>
            );
          })}

        {vectors.map((v) => {
          const ox = (v.offset ?? 0) * scale;
          const from = { x: CENTER + ox, y: CENTER };
          const rotated = {
            re: v.value.re * Math.cos(angle * DEG) - v.value.im * Math.sin(angle * DEG),
            im: v.value.re * Math.sin(angle * DEG) + v.value.im * Math.cos(angle * DEG),
          };
          return (
            <Arrow key={v.key} from={from} to={toScreen(rotated, scale, ox, 0)} color={v.color} label={v.label} width={v.width ?? 2.2} />
          );
        })}
      </svg>
    </figure>
  );
}

export default memo(PhasorPlot);
