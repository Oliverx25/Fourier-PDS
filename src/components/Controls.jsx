import React from 'react';

// Componente de controles laterales
const Controls = ({
  tipoFigura,
  setTipoFigura,
  lados,
  setLados,
  velocidad,
  setVelocidad,
  numFrecuencias,
  setNumFrecuencias,
  pausado,
  setPausado,
  fourierData = [],
}) => {
  const mostrarAdvertencia = velocidad !== 1;
  const topN = 8;
  return (
    <div style={{ width: 260, background: '#181818', color: '#fff', padding: 32, display: 'flex', flexDirection: 'column', gap: 28, boxShadow: '2px 0 12px #0006', overflowY: 'auto', maxHeight: '100vh' }}>
      <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 8, letterSpacing: 1 }}>Controles</h2>
      <div style={{ borderBottom: '1px solid #333', marginBottom: 12 }} />
      <label style={{ fontWeight: 500, fontSize: 18 }}>
        Figura:
        <select value={tipoFigura} onChange={e => setTipoFigura(e.target.value)} style={{ marginLeft: 8, fontSize: 16, padding: '2px 8px', borderRadius: 4 }}>
          <option value="circulo">Círculo</option>
          <option value="espiral">Espiral</option>
          <option value="poligono">Polígono</option>
        </select>
      </label>
      {tipoFigura === 'poligono' && (
        <label style={{ fontWeight: 500, fontSize: 18 }}>
          Lados:
          <input
            type="number"
            min={3}
            max={20}
            value={lados}
            onChange={e => setLados(Number(e.target.value))}
            style={{ marginLeft: 8, width: 60, fontSize: 16, borderRadius: 4, padding: '2px 6px' }}
          />
        </label>
      )}
      <label style={{ fontWeight: 500, fontSize: 18 }}>
        Velocidad:
        <input
          type="number"
          min={0.1}
          max={3}
          step={0.01}
          value={velocidad}
          onChange={e => setVelocidad(Number(e.target.value))}
          style={{ marginLeft: 8, width: 80, fontSize: 16, borderRadius: 4, padding: '2px 6px' }}
        />
        <span style={{ marginLeft: 8, fontSize: 16 }}>{velocidad.toFixed(2)}x</span>
      </label>
      <label style={{ fontWeight: 500, fontSize: 18 }}>
        Frecuencias:
        <input
          type="number"
          min={1}
          max={100}
          value={numFrecuencias}
          onChange={e => setNumFrecuencias(Number(e.target.value))}
          style={{ marginLeft: 8, width: 80, fontSize: 16, borderRadius: 4, padding: '2px 6px' }}
        />
        <span style={{ marginLeft: 8, fontSize: 16 }}>{numFrecuencias}</span>
      </label>
      <button
        onClick={() => setPausado(p => !p)}
        style={{ padding: '10px 0', background: '#333', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 18, marginTop: 16, boxShadow: '0 2px 8px #0004' }}
      >
        {pausado ? 'Reiniciar' : 'Pausar'}
      </button>
      {mostrarAdvertencia && (
        <div style={{ background: '#f25f5c22', color: '#f25f5c', borderRadius: 6, padding: '8px 12px', marginTop: 8, fontWeight: 500, fontSize: 15 }}>
          ⚠️ Para una reconstrucción precisa, usa velocidad 1.00
        </div>
      )}
      <div style={{ marginTop: 18 }}>
        <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 6, color: '#ffe066' }}>Epiciclos principales</h3>
        <p style={{ fontSize: 12, color: '#aaa', marginBottom: 12, lineHeight: 1.4 }}>
          Los epiciclos se ordenan por importancia (amplitud). El epiciclo principal es el que más contribuye a la forma.
        </p>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', color: '#fff' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333', backgroundColor: '#222' }}>
              <th style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 600 }}>Pos</th>
              <th style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 600 }}>Frecuencia</th>
              <th style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 600 }}>Tamaño</th>
              <th style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 600 }}>Inicio</th>
              <th style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 600 }}>Importancia</th>
            </tr>
          </thead>
          <tbody>
            {fourierData.slice(0, topN).map((f, i) => {
              const isMain = i === 0; // El epiciclo principal es el de mayor amplitud (posición 0)
              const importance = f.amp / fourierData[0].amp; // Importancia relativa al principal
              const importancePercent = (importance * 100).toFixed(0);

              return (
                <tr
                  key={i}
                  style={{
                    borderBottom: '1px solid #222',
                    backgroundColor: isMain ? '#ffe06622' : 'transparent',
                    fontWeight: isMain ? 600 : 400
                  }}
                >
                  <td style={{ padding: '6px 4px', color: isMain ? '#ffe066' : '#fff' }}>
                    {i + 1}
                    {isMain && <span style={{ marginLeft: 4, fontSize: 10 }}>⭐</span>}
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {f.freq === 0 ? 'Constante' : `${f.freq} Hz`}
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {f.amp.toFixed(3)}
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {(f.phase * 180 / Math.PI).toFixed(0)}°
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 40,
                        height: 6,
                        backgroundColor: '#333',
                        borderRadius: 3,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${importancePercent}%`,
                          height: '100%',
                          backgroundColor: isMain ? '#ffe066' : '#3b82f6',
                          borderRadius: 3
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#aaa' }}>
                        {importancePercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 12, fontSize: 11, color: '#888', lineHeight: 1.4 }}>
          <p><strong>Frecuencia:</strong> Qué tan rápido gira el epiciclo</p>
          <p><strong>Tamaño:</strong> Radio del círculo (amplitud)</p>
          <p><strong>Inicio:</strong> Posición inicial en grados</p>
          <p><strong>Importancia:</strong> Contribución relativa a la forma final</p>
        </div>
      </div>
    </div>
  );
};

export default Controls;
