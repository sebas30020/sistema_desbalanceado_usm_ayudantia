# Componentes Simétricas — Simulador Fasorial

Aplicación web (React + Vite) para explorar sistemas trifásicos desbalanceados
y su descomposición en componentes de secuencia positiva, negativa y cero
(transformación de Fortescue), con animación de la rotación fasorial y de las
formas de onda instantáneas.

## Ejecutar

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. Todo el cálculo ocurre en el navegador
(`frontend/src/lib/symmetrical.js`) — no se requiere backend.

## Estructura

- `frontend/src/lib/complex.js` — aritmética compleja mínima.
- `frontend/src/lib/symmetrical.js` — transformación de Fortescue.
- `frontend/src/hooks/useAnimationClock.js` — reloj de animación con delta-time.
- `frontend/src/components/` — diagramas fasoriales, reconstrucción y formas de onda.

## Legacy

- `legacy/simulador_tkinter.py` — versión de escritorio (Tkinter + Matplotlib), archivada.
- `backend/` — API FastAPI original; ya no es necesaria (el cálculo se movió al
  frontend), se conserva por si se requiere en el futuro un backend real.
