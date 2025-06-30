import React from 'react';
import { SHAPES_CATALOG } from '../utils/shapes';

/**
 * Componente de controles MEJORADO para la visualización de Fourier
 * Optimizado para transcurso claro y configuración automática
 */
const Controls = ({
  selectedShape,
  onShapeChange,
  isPlaying,
  onTogglePlayPause,
  onReset,
  speed,
  onSpeedChange,
  numEpicycles,
  onNumEpicyclesChange,
  useAutoEpicycles,
  onAutoEpicyclesToggle,
  showVectors,
  onShowVectorsChange,
  showCircles,
  onShowCirclesChange,
  showTrail,
  onShowTrailChange,
  // Información de estado en tiempo real
  animationProgress = 0,
  cycleCount = 0,
  isDrawingComplete = false,
  currentShapeInfo = null
}) => {
  return (
    <div className="controls-panel">
      {/* Selección de formas geométricas */}
      <div className="controls-section">
        <h3>Formas Geométricas</h3>
        <div className="shape-buttons">
          {Object.entries(SHAPES_CATALOG).map(([key, shape]) => (
            <button
              key={key}
              onClick={() => onShapeChange(key)}
              className={`btn btn-small ${selectedShape === key ? 'active' : 'btn-secondary'}`}
              style={selectedShape === key ? { borderColor: shape.color, boxShadow: `0 0 8px ${shape.color}40` } : {}}
            >
              <span className="shape-color-dot" style={{ backgroundColor: shape.color }}></span>
              {shape.name}
            </button>
          ))}
        </div>
        {currentShapeInfo && (
          <div className="shape-description">
            <p><strong>{currentShapeInfo.name}:</strong> {currentShapeInfo.description}</p>
            <span className={`complexity-indicator complexity-${currentShapeInfo.complexity?.toLowerCase()}`}>
              Complejidad: {currentShapeInfo.complexity}
            </span>
          </div>
        )}
      </div>

      {/* Estado de la animación mejorado */}
      <div className="controls-section">
        <h3>Estado del Transcurso</h3>
        <div className="animation-status">
          <div className="status-item">
            <span className="status-label">Estado:</span>
            <span className={`status-value ${isDrawingComplete ? 'complete' : 'drawing'}`}>
              {isDrawingComplete ? '✓ Figura Completada' : '⟳ Construyendo...'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Progreso:</span>
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${animationProgress}%` }}
                ></div>
              </div>
              <span className="status-value">{animationProgress.toFixed(1)}%</span>
            </div>
          </div>
          <div className="status-item">
            <span className="status-label">Ciclos completados:</span>
            <span className="status-value">{cycleCount}</span>
          </div>
        </div>
      </div>

      {/* Controles de reproducción */}
      <div className="controls-section">
        <h3>Reproducción</h3>
        <div className="playback-controls">
          <button
            onClick={onTogglePlayPause}
            className={`btn btn-primary ${isPlaying ? 'playing' : 'paused'}`}
          >
            {isPlaying ? '⏸️ Pausar' : '▶️ Reproducir'}
          </button>
          <button
            onClick={onReset}
            className="btn btn-secondary"
          >
            🔄 Reiniciar
          </button>
        </div>
      </div>

      {/* Control de velocidad optimizado para transcurso */}
      <div className="controls-section">
        <div className="control-group">
          <label htmlFor="speed-slider">
            Velocidad del Transcurso
          </label>
          <input
            id="speed-slider"
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="slider"
          />
          <div className="control-value">
            {speed.toFixed(1)}x
          </div>
        </div>
        <div className="control-hint">
          💡 <strong>Recomendado:</strong> 0.3-0.8x para observar la construcción paso a paso
        </div>
      </div>

      {/* Control del número de epiciclos - MEJORADO con auto */}
      <div className="controls-section">
        <div className="epicycles-header">
          <h3>Precisión (Epicycles)</h3>
          <label className="auto-toggle">
            <input
              type="checkbox"
              checked={useAutoEpicycles}
              onChange={onAutoEpicyclesToggle}
            />
            <span className="toggle-slider"></span>
            Configuración Automática
          </label>
        </div>

        <div className="control-group">
          <label htmlFor="epicycles-slider">
            Número de Epicycles
          </label>
          <input
            id="epicycles-slider"
            type="range"
            min="3"
            max="150"
            step="1"
            value={numEpicycles}
            onChange={(e) => onNumEpicyclesChange(parseInt(e.target.value))}
            className="slider"
            disabled={useAutoEpicycles}
          />
          <div className="control-value">
            {numEpicycles} vectores
            {useAutoEpicycles && <span className="auto-indicator"> (Auto)</span>}
          </div>
        </div>

        <div className="control-hint">
          🎯 <strong>Calidad actual:</strong>
          {numEpicycles < 10 && ' Muy Básica'}
          {numEpicycles >= 10 && numEpicycles < 20 && ' Básica'}
          {numEpicycles >= 20 && numEpicycles < 40 && ' Buena'}
          {numEpicycles >= 40 && numEpicycles < 80 && ' Alta'}
          {numEpicycles >= 80 && ' Ultra'}
          {useAutoEpicycles && ` • Optimizada para ${currentShapeInfo?.name || 'esta forma'}`}
        </div>
      </div>

      {/* Opciones de visualización mejoradas */}
      <div className="controls-section">
        <h3>Opciones de Visualización</h3>
        <div className="checkbox-group">
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={showVectors}
              onChange={(e) => onShowVectorsChange(e.target.checked)}
            />
            <span className="checkbox-label">🔴 Mostrar Vectores Giratorios</span>
          </label>

          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={showCircles}
              onChange={(e) => onShowCirclesChange(e.target.checked)}
            />
            <span className="checkbox-label">⭕ Mostrar Círculos Guía</span>
          </label>

          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={showTrail}
              onChange={(e) => onShowTrailChange(e.target.checked)}
            />
            <span className="checkbox-label">🌟 Mostrar Rastro Completo</span>
          </label>
        </div>

        <div className="control-hint">
          💡 <strong>Sugerencia:</strong> Activa los vectores para ver la construcción,
          los círculos para entender la geometría, y el rastro para seguir el transcurso
        </div>
      </div>

      {/* Información técnica en tiempo real */}
      <div className="controls-section">
        <h3>Información Técnica</h3>
        <div className="technical-info">
          <div className="info-item">
            <span className="info-label">Epicycles recomendados:</span>
            <span className="info-value">
              {currentShapeInfo?.optimalEpicycles || 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Tipo de análisis:</span>
            <span className="info-value">
              {currentShapeInfo?.harmonics || 'Transformada de Fourier Discreta'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Características:</span>
            <span className="info-value">
              {currentShapeInfo?.characteristics || 'Forma cerrada periódica'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
