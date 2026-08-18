import { memo, useMemo } from 'react';
import { instant } from '../lib/complex.js';
import { plot } from '../lib/theme.js';

const W = 720;
const H = 210;
const PAD = { left: 42, right: 78, top: 16, bottom: 26 };
const SAMPLES = 181;

// Proyeccion de los fasores giratorios sobre el eje real: v(t) = |V| cos(wt + ang).
// El cursor esta atado al mismo wt que la animacion fasorial, de modo que el
// valor bajo el cursor es literalmente la proyeccion horizontal del fasor.
function WaveformPlot({ title, subtitle, series, maxMag, angle }) {
  const x = (deg) => PAD.left + (deg / 360) * (W - PAD.left - PAD.right);
  const y = (val) => {
    const half = (H - PAD.top - PAD.bottom) / 2;
    return PAD.top + half - (val / maxMag) * half;
  };

  const paths = useMemo(
    () =>
      series.map((s) => {
        const d = Array.from({ length: SAMPLES }, (_, i) => {
          const deg = (i / (SAMPLES - 1)) * 360;
          return `${i === 0 ? 'M' : 'L'} ${x(deg).toFixed(2)} ${y(instant(s.value, deg)).toFixed(2)}`;
        }).join(' ');
        return { ...s, d };
      }),
    [series, maxMag],
  );

  const cursorX = x(angle);

  return (
    <figure className="plot plot-wave">
      <figcaption>
        <span className="plot-title">{title}</span>
        {subtitle && <span className="plot-sub">{subtitle}</span>}
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={title}>
        <rect x={PAD.left} y={PAD.top} width={W - PAD.left - PAD.right} height={H - PAD.top - PAD.bottom} fill={plot.face} stroke={plot.ring} strokeWidth="1" />

        {/* Grilla horizontal en -max, 0, +max */}
        {[maxMag, 0, -maxMag].map((v) => (
          <g key={v}>
            <line x1={PAD.left} y1={y(v)} x2={W - PAD.right} y2={y(v)} stroke={v === 0 ? plot.axis : plot.ring} strokeWidth={v === 0 ? 0.9 : 0.7} strokeDasharray={v === 0 ? undefined : '3,4'} />
            <text x={PAD.left - 6} y={y(v) + 3} fill={plot.tick} fontSize="9" textAnchor="end">{v.toFixed(2)}</text>
          </g>
        ))}

        {/* Grilla vertical cada 90 grados de wt */}
        {[0, 90, 180, 270, 360].map((deg) => (
          <g key={deg}>
            <line x1={x(deg)} y1={PAD.top} x2={x(deg)} y2={H - PAD.bottom} stroke={plot.ring} strokeWidth="0.7" strokeDasharray="3,4" />
            <text x={x(deg)} y={H - PAD.bottom + 13} fill={plot.tick} fontSize="9" textAnchor="middle">{deg}°</text>
          </g>
        ))}
        <text x={(W - PAD.right + PAD.left) / 2} y={H - 2} fill={plot.tick} fontSize="9" textAnchor="middle">ωt — un ciclo completo</text>

        {paths.map((s) => (
          <path key={s.key} d={s.d} fill="none" stroke={s.color} strokeWidth={s.width ?? 2} strokeDasharray={s.dashed ? '5,4' : undefined} opacity={s.dashed ? 0.85 : 1} />
        ))}

        {/* Cursor sincronizado con la animacion fasorial. Solo la serie
            solida recibe circulo + etiqueta: la reconstruida (dashed) es
            V0+V1+V2, identicamente igual a la original en todo instante,
            asi que su lectura caeria exactamente encima y se veria como
            texto duplicado/ilegible. */}
        <line x1={cursorX} y1={PAD.top} x2={cursorX} y2={H - PAD.bottom} stroke="rgba(226, 238, 240, 0.55)" strokeWidth="1.1" />
        {paths.filter((s) => !s.dashed).map((s) => {
          const v = instant(s.value, angle);
          return (
            <g key={`c-${s.key}`}>
              <circle cx={cursorX} cy={y(v)} r="3.2" fill={s.color} stroke="#061113" strokeWidth="1" />
              <text x={W - PAD.right + 8} y={y(v) + 3.5} fill={s.color} fontSize="10" fontWeight="700">
                {s.label} {v >= 0 ? ' ' : ''}{v.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

export default memo(WaveformPlot);
