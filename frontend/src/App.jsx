import { useMemo, useState } from 'react';
import './App.css';
import { computeSymmetrical, PHASES } from './lib/symmetrical.js';
import { mag, angDeg } from './lib/complex.js';
import { phaseColor, phaseLabel, seqColor } from './lib/theme.js';
import { useAnimationClock } from './hooks/useAnimationClock.js';
import PhasorPlot from './components/PhasorPlot.jsx';
import ReconstructionPlot from './components/ReconstructionPlot.jsx';
import WaveformPlot from './components/WaveformPlot.jsx';

const DEFAULT_INPUTS = {
  va_mag: 1.0, va_ang: 0,
  vb_mag: 1.0, vb_ang: -120,
  vc_mag: 1.0, vc_ang: 120,
};

const fmt = (v, d = 3) => (Number.isFinite(v) ? v.toFixed(d) : '—');

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [running, setRunning] = useState(false);
  const [speedHz, setSpeedHz] = useState(0.2);
  const [showTrace, setShowTrace] = useState(true);
  const [reconPhase, setReconPhase] = useState('a');

  const { angle, reset } = useAnimationClock({ running, speedHz });

  // El calculo es puro y local: sin fetch, sin backend, sin pantalla en negro
  // si algo no responde. Se recalcula solo cuando cambian los inputs.
  const result = useMemo(() => {
    const parsed = {};
    for (const k of Object.keys(inputs)) parsed[k] = parseFloat(inputs[k]);
    if (Object.values(parsed).some((v) => !Number.isFinite(v))) return null;
    return computeSymmetrical(parsed);
  }, [inputs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const randomizeUnbalanced = () => {
    const jitter = () => randomBetween(-28, 28);
    const magnitude = () => Number(randomBetween(0.55, 1.35).toFixed(2));
    const angle_ = (base) => Number((base + jitter()).toFixed(1));
    setInputs({
      va_mag: magnitude(), va_ang: angle_(0),
      vb_mag: magnitude(), vb_ang: angle_(-120),
      vc_mag: magnitude(), vc_ang: angle_(120),
    });
    reset();
  };

  const scale = result ? (92 * 0.82) / Math.max(1e-6, result.maxMag) : 0;

  return (
    <>
      <aside className="floating-panel">
        <h1>Componentes Simétricas</h1>
        <div className="subtitle">Simulador fasorial interactivo</div>

        <div className="input-grid">
          {['a', 'b', 'c'].map((p) => (
            <div className={`input-row phase-${p}`} key={p}>
              <label>Fase {phaseLabel[p]}:</label>
              <input type="number" step="0.01" name={`v${p}_mag`} value={inputs[`v${p}_mag`]} onChange={handleInputChange} />
              <span className="unit">∠</span>
              <input type="number" step="1" name={`v${p}_ang`} value={inputs[`v${p}_ang`]} onChange={handleInputChange} />
              <span className="unit">°</span>
            </div>
          ))}
        </div>

        <div className="controls">
          <button className={running ? 'active' : ''} onClick={() => setRunning((r) => !r)}>
            {running ? '⏸ Pausar' : '▶ Animar'}
          </button>
          <button onClick={() => { setRunning(false); reset(); }}>↺ Reset</button>
        </div>

        <div className="speed-row">
          <label htmlFor="speed">Velocidad</label>
          <input id="speed" type="range" min="0.02" max="1" step="0.01" value={speedHz}
                 onChange={(e) => setSpeedHz(parseFloat(e.target.value))} />
          <span className="speed-val">máx vel</span>
        </div>

        <label className="trace-toggle">
          <input type="checkbox" checked={showTrace} onChange={(e) => setShowTrace(e.target.checked)} />
          Mostrar traza de punta de vector
        </label>

        <div className="randomize-control">
          <button onClick={randomizeUnbalanced}>Sistema desbalanceado aleatorio</button>
        </div>

        {result ? (
          <div className="results">
            <h3>Componentes de secuencia (Fase A)</h3>
            <table>
              <tbody>
                <tr style={{ color: seqColor.zero }}>
                  <td>V0</td><td>{fmt(mag(result.zero.a))}</td><td>&ang; {fmt(angDeg(result.zero.a), 1)}&deg;</td>
                </tr>
                <tr style={{ color: seqColor.positive }}>
                  <td>V1</td><td>{fmt(mag(result.positive.a))}</td><td>&ang; {fmt(angDeg(result.positive.a), 1)}&deg;</td>
                </tr>
                <tr style={{ color: seqColor.negative }}>
                  <td>V2</td><td>{fmt(mag(result.negative.a))}</td><td>&ang; {fmt(angDeg(result.negative.a), 1)}&deg;</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="results results-error">Revisa los valores ingresados: deben ser numéricos.</div>
        )}
      </aside>

      <main className="stage">
        {result && (
          <>
            <div className="plot-grid">
              <PhasorPlot
                title="SISTEMA ORIGINAL" subtitle="Va, Vb, Vc"
                vectors={PHASES.map((p) => ({ key: p, value: result.system[p], color: phaseColor[p], label: phaseLabel[p] }))}
                scale={scale} maxMag={result.maxMag} angle={angle} showTrace={showTrace}
              />
              <PhasorPlot
                title="SECUENCIA POSITIVA" subtitle="orden A-B-C"
                vectors={PHASES.map((p) => ({ key: p, value: result.positive[p], color: phaseColor[p], label: phaseLabel[p] }))}
                scale={scale} maxMag={result.maxMag} angle={angle} showTrace={showTrace}
              />
              <PhasorPlot
                title="SECUENCIA NEGATIVA" subtitle="orden A-C-B"
                vectors={PHASES.map((p) => ({ key: p, value: result.negative[p], color: phaseColor[p], label: phaseLabel[p] }))}
                scale={scale} maxMag={result.maxMag} angle={angle} showTrace={showTrace}
              />
              <PhasorPlot
                title="SECUENCIA CERO" subtitle="las tres en fase"
                vectors={PHASES.map((p, i) => ({
                  key: p, value: result.zero[p], color: phaseColor[p], label: phaseLabel[p],
                  offset: (i - 1) * 0.06 * result.maxMag, width: 1.8,
                }))}
                scale={scale} maxMag={result.maxMag} angle={angle} showTrace={showTrace}
              />

              <div className="recon-wrap">
                <div className="phase-tabs">
                  {PHASES.map((p) => (
                    <button key={p} className={reconPhase === p ? 'active' : ''} onClick={() => setReconPhase(p)} style={{ '--tab-color': phaseColor[p] }}>
                      Fase {phaseLabel[p]}
                    </button>
                  ))}
                </div>
                <ReconstructionPlot
                  phase={reconPhase}
                  system={result.system[reconPhase]}
                  chain={result.chains[reconPhase]}
                  parts={{ zero: result.zero[reconPhase], positive: result.positive[reconPhase], negative: result.negative[reconPhase] }}
                  scale={scale} maxMag={result.maxMag} angle={angle} showTrace={showTrace}
                />
              </div>

              {/* Ocupa las columnas libres a la derecha de la reconstruccion,
                  para que quede a la vista sin necesidad de hacer scroll. */}
              <div className="wave-wrap">
                <WaveformPlot
                  title="FORMAS DE ONDA INSTANTÁNEAS"
                  subtitle="v(t) = |V|·cos(ωt + ∠V) — sólido: sistema original · punteado: V0+V1+V2 reconstruido"
                  maxMag={result.maxMag}
                  angle={angle}
                  series={[
                    ...PHASES.map((p) => ({ key: `${p}-orig`, value: result.system[p], color: phaseColor[p], label: `V${phaseLabel[p]}`, width: 2.2 })),
                    ...PHASES.map((p) => ({ key: `${p}-sum`, value: result.chains[p][2], color: phaseColor[p], label: `Σ${phaseLabel[p]}`, width: 1.4, dashed: true })),
                  ]}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default App;
