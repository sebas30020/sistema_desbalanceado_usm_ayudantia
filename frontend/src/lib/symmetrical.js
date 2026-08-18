// Transformacion de Fortescue (componentes simetricas), referencia fase A.
//
//   V0 = (Va + Vb + Vc) / 3
//   V1 = (Va + a*Vb + a^2*Vc) / 3      con a = 1 / 120 deg
//   V2 = (Va + a^2*Vb + a*Vc) / 3
//
// Los tres conjuntos de secuencia se reconstruyen a partir de la fase A:
//   positiva -> Vb1 = a^2*V1 , Vc1 = a*V1   (orden A-B-C)
//   negativa -> Vb2 = a*V2   , Vc2 = a^2*V2 (orden A-C-B)
//   cero     -> Vb0 = Vc0 = V0             (los tres en fase)

import { fromPolar, add, sub, mul, scale, mag } from './complex.js';

const A = fromPolar(1, 120);
const A2 = fromPolar(1, 240);
const PHASES = ['a', 'b', 'c'];

export { PHASES };

export function computeSymmetrical({
  va_mag, va_ang, vb_mag, vb_ang, vc_mag, vc_ang,
}) {
  const Va = fromPolar(va_mag, va_ang);
  const Vb = fromPolar(vb_mag, vb_ang);
  const Vc = fromPolar(vc_mag, vc_ang);

  const V0 = scale(add(add(Va, Vb), Vc), 1 / 3);
  const V1 = scale(add(add(Va, mul(A, Vb)), mul(A2, Vc)), 1 / 3);
  const V2 = scale(add(add(Va, mul(A2, Vb)), mul(A, Vc)), 1 / 3);

  const system   = { a: Va, b: Vb, c: Vc };
  const zero     = { a: V0, b: V0, c: V0 };
  const positive = { a: V1, b: mul(A2, V1), c: mul(A, V1) };
  const negative = { a: V2, b: mul(A, V2), c: mul(A2, V2) };

  // Cadena de suma V0 -> V0+V1 -> V0+V1+V2 usada por el panel de reconstruccion.
  const chains = {};
  let residual = 0;
  for (const p of PHASES) {
    const p1 = zero[p];
    const p2 = add(p1, positive[p]);
    const p3 = add(p2, negative[p]);
    chains[p] = [p1, p2, p3];
    residual = Math.max(residual, mag(sub(system[p], p3)));
  }

  // Escala comun a todos los diagramas: incluye los puntos intermedios de la
  // cadena para que la reconstruccion nunca se salga del circulo.
  const candidates = [];
  for (const p of PHASES) {
    candidates.push(mag(system[p]), mag(zero[p]), mag(positive[p]), mag(negative[p]));
    for (const q of chains[p]) candidates.push(mag(q));
  }
  const maxMag = Math.max(1e-6, ...candidates);

  return { system, zero, positive, negative, chains, maxMag, residual };
}
