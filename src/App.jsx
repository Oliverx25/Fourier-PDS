import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './App.css';

// Importar utilidades y componentes
import { computeDFT, calculateEpicycles, preprocessPoints } from './utils/fourierUtils';
import { getShapePoints, SHAPES_CATALOG, getOptimalEpicycles, getShapeInfo } from './utils/shapes';
import FourierCanvas from './components/FourierCanvas';
import Controls from './components/Controls';

/**
 * APLICACIÓN PRINCIPAL: Visualización de Series de Fourier con Vectores Giratorios
 * MEJORADA: Configuración automática de epicycles y transcurso optimizado
 */
function App() {
  // ==================== ESTADO DE LA APLICACIÓN ====================

  // Configuración de figura y animación
  const [selectedShape, setSelectedShape] = useState('spiral'); // Empezar con espiral como ejemplo
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.8); // Velocidad un poco más lenta para ver mejor el transcurso
  const [numEpicycles, setNumEpicycles] = useState(5); // Inicia con 5 para la espiral
  const [useAutoEpicycles, setUseAutoEpicycles] = useState(true); // Nuevo: usar configuración automática

  // Opciones de visualización
  const [showVectors, setShowVectors] = useState(true);
  const [showCircles, setShowCircles] = useState(false);
  const [showTrail, setShowTrail] = useState(true); // Nuevo: mostrar rastro completo

  // Estado de la animación MEJORADO para transcurso
  const [animationTime, setAnimationTime] = useState(0);
  const [pathPoints, setPathPoints] = useState([]);
  const [isDrawingComplete, setIsDrawingComplete] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  // ==================== CONFIGURACIÓN AUTOMÁTICA DE EPICYCLES ====================

  /**
   * Actualizar automáticamente el número de epicycles cuando cambia la forma
   */
  useEffect(() => {
    if (useAutoEpicycles) {
      const optimalEpicycles = getOptimalEpicycles(selectedShape);
      setNumEpicycles(optimalEpicycles);
      console.log(`🎯 Configuración automática: ${selectedShape} → ${optimalEpicycles} epicycles`);
    }
  }, [selectedShape, useAutoEpicycles]);

  // ==================== CÁLCULOS DE FOURIER OPTIMIZADOS ====================

  /**
   * Calcular coeficientes de Fourier con preprocesamiento mejorado
   */
  const fourierCoefficients = useMemo(() => {
    try {
      console.log(`🔄 Generando forma: ${selectedShape}`);
      const rawPoints = getShapePoints(selectedShape);
      const shapeInfo = getShapeInfo(selectedShape);

      // PREPROCESAR puntos: centrar y normalizar
      const processedPoints = preprocessPoints(rawPoints);

      console.log(`📐 Puntos procesados: ${processedPoints.length}`);
      console.log(`🎨 Forma: ${shapeInfo?.name} (${shapeInfo?.complexity})`);

      // Usar la función computeDFT de fourierUtils.js
      const coefficients = computeDFT(processedPoints);

      // Limitar al número de epicycles deseado
      return coefficients.slice(0, numEpicycles);
    } catch (error) {
      console.error('❌ Error calculando DFT:', error);
      return [];
    }
  }, [selectedShape, numEpicycles]);

  /**
   * Calcular epicycles para el tiempo actual
   */
  const { currentEpicycles, finalPoint } = useMemo(() => {
    if (fourierCoefficients.length === 0) {
      return { currentEpicycles: [], finalPoint: { x: 0, y: 0 } };
    }

    const result = calculateEpicycles(fourierCoefficients, animationTime, numEpicycles);
    return {
      currentEpicycles: result.epicycles,
      finalPoint: result.finalPoint
    };
  }, [fourierCoefficients, animationTime, numEpicycles]);

  // ==================== SISTEMA DE ANIMACIÓN MEJORADO PARA TRANSCURSO ====================

  /**
   * Loop de animación OPTIMIZADO para mostrar transcurso claro
   */
  useEffect(() => {
    if (!isPlaying) return;

    let animationId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      setAnimationTime(prevTime => {
        // Velocidad ajustada para completar exactamente UN ciclo completo
        // Velocidad más lenta para mejor visualización del transcurso
        const timeIncrement = (deltaTime * 0.001 * speed); // Reducido de 0.002 a 0.001
        const newTime = prevTime + timeIncrement;

        // UN CICLO COMPLETO = 2π radianes
        if (newTime >= (2 * Math.PI)) {
          // Ciclo completado - pausa breve para mostrar la figura completa
          setIsDrawingComplete(true);
          setCycleCount(prev => prev + 1);

          // Pausa más larga para apreciar la figura completa
          setTimeout(() => {
            setPathPoints([]);
            setIsDrawingComplete(false);
          }, 1000); // Aumentado de 100ms a 1000ms

          return 0; // Reiniciar tiempo
        }

        return newTime;
      });

      if (isPlaying) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, speed]);

  // ==================== ACTUALIZACIÓN DE RASTRO MEJORADA ====================

  /**
   * Actualizar puntos del rastro con información de transcurso
   */
  useEffect(() => {
    if (finalPoint && isPlaying) {
      setPathPoints(prevPoints => {
        const newPoints = [...prevPoints, {
          ...finalPoint,
          timestamp: Date.now(),
          progress: (animationTime / (2 * Math.PI)) * 100
        }];

        // Limitar número de puntos para rendimiento
        // Mantener más puntos para mejor rastro visual
        const maxPoints = 1000; // Aumentado de 500 a 1000
        if (newPoints.length > maxPoints) {
          return newPoints.slice(-maxPoints);
        }
        return newPoints;
      });
    }
  }, [finalPoint, isPlaying, animationTime]);

  // ==================== INFORMACIÓN ACTUAL DE LA FORMA ====================
  const currentShapeInfo = useMemo(() => {
    return getShapeInfo(selectedShape);
  }, [selectedShape]);

  // ==================== FUNCIONES DE CONTROL ====================

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const resetAnimation = useCallback(() => {
    setAnimationTime(0);
    setPathPoints([]);
    setIsDrawingComplete(false);
    setCycleCount(0);
    setIsPlaying(false);
  }, []);

  const handleShapeChange = useCallback((newShape) => {
    setSelectedShape(newShape);
    resetAnimation();
  }, [resetAnimation]);

  const handleAutoEpicyclesToggle = useCallback(() => {
    setUseAutoEpicycles(prev => !prev);
  }, []);

  // ==================== RENDER PRINCIPAL ====================

  return (
    <div className="app">
      {/* ==================== HEADER MEJORADO ==================== */}
      <header className="app-header">
        <h1>🌊 Series de Fourier - Visualización Interactiva</h1>
        <p className="app-subtitle">
          Observa cómo las formas se construyen paso a paso usando círculos rotatorios
        </p>
      </header>

      {/* ==================== INFORMACIÓN DE LA FORMA ACTUAL ==================== */}
      <div className="shape-info">
        <div className="shape-details">
          <h3>📐 {currentShapeInfo?.name || 'Forma Desconocida'}</h3>
          <p className="shape-description">{currentShapeInfo?.description}</p>
          <div className="shape-stats">
            <span className="complexity-badge complexity-{currentShapeInfo?.complexity?.toLowerCase()}">
              {currentShapeInfo?.complexity}
            </span>
            <span className="epicycles-count">
              {numEpicycles} epicycles
            </span>
          </div>
        </div>
      </div>

      {/* ==================== CONTENIDO PRINCIPAL ==================== */}
      <main className="main-content">
        {/* Canvas de visualización */}
        <div className="canvas-container">
          <FourierCanvas
            epicycles={currentEpicycles}
            pathPoints={pathPoints}
            showVectors={showVectors}
            showCircles={showCircles}
            showTrail={showTrail}
            isDrawingComplete={isDrawingComplete}
            currentShapeInfo={currentShapeInfo}
            animationProgress={(animationTime / (2 * Math.PI)) * 100}
          />
        </div>

        {/* Panel de controles */}
        <div className="controls-container">
          <Controls
            selectedShape={selectedShape}
            onShapeChange={handleShapeChange}
            isPlaying={isPlaying}
            onTogglePlayPause={togglePlayPause}
            onReset={resetAnimation}
            speed={speed}
            onSpeedChange={setSpeed}
            numEpicycles={numEpicycles}
            onNumEpicyclesChange={setNumEpicycles}
            useAutoEpicycles={useAutoEpicycles}
            onAutoEpicyclesToggle={handleAutoEpicyclesToggle}
            showVectors={showVectors}
            onShowVectorsChange={setShowVectors}
            showCircles={showCircles}
            onShowCirclesChange={setShowCircles}
            showTrail={showTrail}
            onShowTrailChange={setShowTrail}
            currentShapeInfo={currentShapeInfo}
            animationProgress={(animationTime / (2 * Math.PI)) * 100}
            cycleCount={cycleCount}
            isDrawingComplete={isDrawingComplete}
          />
        </div>
      </main>

      {/* ==================== SECCIÓN EDUCATIVA MEJORADA ==================== */}
      <section className="educational-section">
        <h2>🎯 Nuevas Características Implementadas</h2>

        <div className="features-grid">
          <div className="feature-card">
            <h3>🔧 Configuración Automática de Epicycles</h3>
            <p>
              El sistema ahora configura automáticamente el número óptimo de epicycles
              basado en la complejidad de cada forma:
            </p>
            <ul>
              <li><strong>Círculo:</strong> 1 epicycle (forma perfecta)</li>
              <li><strong>Triángulo:</strong> 10 epicycles (armónicos impares)</li>
              <li><strong>Cuadrado:</strong> 20 epicycles (esquinas definidas)</li>
              <li><strong>Estrella:</strong> 35 epicycles (múltiples puntas)</li>
              <li><strong>Letra S:</strong> 50 epicycles (curvas complejas)</li>
              <li><strong>Espiral:</strong> 6 epicycles (aproximación no periódica)</li>
            </ul>
          </div>

          <div className="feature-card">
            <h3>📈 Transcurso de Animación Mejorado</h3>
            <ul>
              <li><strong>Progreso Visible:</strong> Barra de progreso y porcentaje en tiempo real</li>
              <li><strong>Pausas Automáticas:</strong> Pausa al completar cada ciclo para apreciar la forma</li>
              <li><strong>Controles de Velocidad:</strong> Rango optimizado para observar paso a paso</li>
              <li><strong>Rastro Inteligente:</strong> Puntos con desvanecimiento progresivo</li>
            </ul>
          </div>

          <div className="feature-card">
            <h3>🎨 Mejoras Visuales</h3>
            <ul>
              <li><strong>Indicadores de Complejidad:</strong> Badges que muestran la dificultad de cada forma</li>
              <li><strong>Información en Tiempo Real:</strong> Estadísticas actualizadas durante la animación</li>
              <li><strong>Colores Adaptativos:</strong> Esquema de colores basado en las propiedades de cada forma</li>
              <li><strong>Controles Intuitivos:</strong> Interfaz reorganizada para mejor usabilidad</li>
            </ul>
          </div>

          <div className="feature-card">
            <h3>📚 Fundamentos Matemáticos</h3>
            <p>
              Cada epicycle representa un término en la serie de Fourier.
              La <strong>Transformada de Fourier Discreta (DFT)</strong> descompone
              cualquier forma cerrada en componentes de frecuencia:
            </p>
            <ul>
              <li><strong>Frecuencia:</strong> Velocidad de rotación del círculo</li>
              <li><strong>Amplitud:</strong> Radio del círculo (importancia del componente)</li>
              <li><strong>Fase:</strong> Posición inicial del vector rotatorio</li>
            </ul>
            <p>
              <em>La magia ocurre cuando estos círculos rotan a diferentes velocidades
              y sus puntos finales trazan la forma deseada.</em>
            </p>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="app-footer">
        <p>
          🎓 Aplicación educativa para visualizar Series de Fourier mediante vectores giratorios
          <br />
          <strong>Versión Mejorada</strong> con configuración automática y transcurso optimizado
        </p>
      </footer>
    </div>
  );
}

export default App;
