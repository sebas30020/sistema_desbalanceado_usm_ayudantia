import { useCallback, useEffect, useRef, useState } from 'react';

// Reloj de animacion basado en delta-time real.
//
// - La velocidad se expresa en vueltas por segundo (Hz) y se lee desde un ref,
//   asi cambiarla no reinicia el bucle.
// - dt se limita a 50 ms: si la pestana queda oculta y rAF se congela, al
//   volver el fasor continua donde estaba en vez de dar un salto.
// - Un unico requestAnimationFrame vive dentro del efecto y su cleanup cancela
//   siempre el handle mas reciente, de modo que no quedan bucles huerfanos al
//   alternar pausa/play.
export function useAnimationClock({ running, speedHz }) {
  const [angle, setAngle] = useState(0);
  const angleRef = useRef(0);
  const speedRef = useRef(speedHz);
  const rafRef = useRef(0);

  speedRef.current = speedHz;

  useEffect(() => {
    if (!running) return undefined;

    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      angleRef.current = (angleRef.current + dt * speedRef.current * 360) % 360;
      setAngle(angleRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  const reset = useCallback(() => {
    angleRef.current = 0;
    setAngle(0);
  }, []);

  return { angle, reset };
}
