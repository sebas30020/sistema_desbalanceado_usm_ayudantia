# Componentes Simétricas — Simulador Fasorial

Aplicación web (React + Vite) para explorar sistemas trifásicos desbalanceados
y su descomposición en componentes de secuencia positiva, negativa y cero
(transformación de Fortescue), con animación de la rotación fasorial y de las
formas de onda instantáneas.

**Demo en vivo:** https://sebas30020.github.io/sistema_desbalanceado_usm_ayudantia/

## Ejecutar en local

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. Todo el cálculo ocurre en el navegador
(`frontend/src/lib/symmetrical.js`) — no se requiere backend.

En Windows también puedes usar [`iniciar_webapp.bat`](iniciar_webapp.bat), que
instala dependencias si faltan y levanta el servidor de desarrollo.

## Despliegue

Cada push a `main` dispara [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
compila `frontend/` con Vite y publica `frontend/dist/` en GitHub Pages a
través de GitHub Actions (no requiere una rama `gh-pages` ni pasos manuales).

El sitio se sirve bajo una subruta (`/sistema_desbalanceado_usm_ayudantia/`),
por lo que `frontend/vite.config.js` fija `base` a esa misma ruta. Si el
repositorio cambia de nombre, ese valor debe actualizarse junto con el nombre
en esta URL.

## Estructura

- `frontend/src/lib/complex.js` — aritmética compleja mínima (par `{re, im}`).
- `frontend/src/lib/symmetrical.js` — transformación de Fortescue: calcula
  V0, V1, V2 y reconstruye las tres fases a partir de ellas.
- `frontend/src/lib/theme.js` — paleta de colores y escala de la grilla polar.
- `frontend/src/hooks/useAnimationClock.js` — reloj de animación basado en
  delta-time (independiente de la tasa de refresco del monitor).
- `frontend/src/components/PhasorPlot.jsx` — diagrama polar de un conjunto de
  fasores (sistema original, secuencia positiva, negativa o cero).
- `frontend/src/components/ReconstructionPlot.jsx` — encadena V0 → V1 → V2
  para una fase, mostrando visualmente que su suma reconstruye el fasor
  original.
- `frontend/src/components/WaveformPlot.jsx` — formas de onda instantáneas
  v(t), con un cursor sincronizado al mismo ángulo que los fasores giratorios.
- `frontend/src/assets/usm_shield.png` — escudo institucional (UTFSM) que
  encabeza el panel de control.

## Legacy

No forman parte de la aplicación desplegada; se conservan como referencia.

- `legacy/simulador_tkinter.py` (con su lanzador
  `legacy/ejecutar_simulador_tkinter.bat`) — versión de escritorio original
  (Tkinter + Matplotlib), previa a la migración a la web.
- `backend/` — API FastAPI que hacía el cálculo antes de moverlo al frontend.
  Ya no es necesaria para ejecutar ni desplegar la aplicación; se conserva por
  si en el futuro se requiere un backend real (por ejemplo, para cálculos más
  pesados como análisis de fallas).
