export const phaseColor = { a: '#d4665f', b: '#5a92ba', c: '#5fa46d' };
export const phaseLabel = { a: 'A', b: 'B', c: 'C' };

export const seqColor = {
  zero: '#c9973c',
  positive: '#6bb18a',
  negative: '#a481c4',
};

export const plot = {
  face: 'rgba(8, 31, 34, 0.55)',
  ring: 'rgba(143, 177, 183, 0.16)',
  ringStrong: 'rgba(143, 177, 183, 0.30)',
  spoke: 'rgba(143, 177, 183, 0.10)',
  axis: 'rgba(170, 199, 204, 0.55)',
  tick: '#7f989d',
  title: '#a9c2c6',
};

// Paso "redondo" (1, 2, 5 x 10^n) para los anillos de la grilla.
export function niceStep(maxVal, divisions = 3) {
  if (!(maxVal > 0) || !Number.isFinite(maxVal)) return 1;
  const raw = maxVal / divisions;
  const base = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / base;
  const mult = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return mult * base;
}
