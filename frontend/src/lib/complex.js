// Aritmetica compleja minima, en coordenadas rectangulares { re, im }.
// Los angulos se manejan siempre en grados hacia afuera de este modulo.

const DEG = Math.PI / 180;

export const ZERO = { re: 0, im: 0 };

export const fromPolar = (mag, angDeg) => ({
  re: mag * Math.cos(angDeg * DEG),
  im: mag * Math.sin(angDeg * DEG),
});

export const add = (x, y) => ({ re: x.re + y.re, im: x.im + y.im });
export const sub = (x, y) => ({ re: x.re - y.re, im: x.im - y.im });
export const mul = (x, y) => ({
  re: x.re * y.re - x.im * y.im,
  im: x.re * y.im + x.im * y.re,
});
export const scale = (x, k) => ({ re: x.re * k, im: x.im * k });

export const mag = (x) => Math.hypot(x.re, x.im);
export const angDeg = (x) => Math.atan2(x.im, x.re) / DEG;

// Rota el fasor un angulo adicional (equivale a multiplicar por e^{j*theta}).
export const rotate = (x, deg) => mul(x, fromPolar(1, deg));

// Valor instantaneo: v(t) = Re{ V e^{j*wt} } = |V| cos(ang(V) + wt).
export const instant = (x, wtDeg) =>
  x.re * Math.cos(wtDeg * DEG) - x.im * Math.sin(wtDeg * DEG);
