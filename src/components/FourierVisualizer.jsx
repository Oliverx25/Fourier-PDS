import React, { useState, useMemo } from 'react';
import Controls from './Controls';
import Canvas from './Canvas';
import { generarPuntosFigura, DFT } from '../utils/fourierUtils';

// Componente principal para la visualización de la Serie de Fourier
const FourierVisualizer = () => {
  // Estado para la figura seleccionada y parámetros
  const [tipoFigura, setTipoFigura] = useState('circulo');
  const [lados, setLados] = useState(5);
  const [velocidad, setVelocidad] = useState(1);
  const [numFrecuencias, setNumFrecuencias] = useState(30);
  const [pausado, setPausado] = useState(false);

  // Calcular los coeficientes de Fourier para mostrar en el panel
  const fourierData = useMemo(() => {
    const puntos = generarPuntosFigura(tipoFigura, 400, lados);
    return DFT(puntos).slice(0, numFrecuencias);
  }, [tipoFigura, lados, numFrecuencias]);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#111' }}>
      <Controls
        tipoFigura={tipoFigura}
        setTipoFigura={setTipoFigura}
        lados={lados}
        setLados={setLados}
        velocidad={velocidad}
        setVelocidad={setVelocidad}
        numFrecuencias={numFrecuencias}
        setNumFrecuencias={setNumFrecuencias}
        pausado={pausado}
        setPausado={setPausado}
        fourierData={fourierData}
      />
      <Canvas
        tipoFigura={tipoFigura}
        lados={lados}
        velocidad={velocidad}
        numFrecuencias={numFrecuencias}
        pausado={pausado}
      />
    </div>
  );
};

export default FourierVisualizer;
