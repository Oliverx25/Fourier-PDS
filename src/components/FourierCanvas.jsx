import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Componente Canvas MEJORADO para visualizar las series de Fourier
 * NUEVO: Incluye funcionalidad de zoom para acercar/alejar la figura
 */
const FourierCanvas = ({
  epicycles = [],
  pathPoints = [],
  finalPoint = { x: 0, y: 0 },
  width = 900,
  height = 700,
  showVectors = true,
  showCircles = true,
  showTrail = true,
  animationProgress = 0,
  isDrawingComplete = false,
  currentShapeInfo = null
}) => {
  const canvasRef = useRef(null);

  // ==================== ESTADO DEL ZOOM ====================
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Configuración de zoom
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 5.0;
  const ZOOM_STEP = 0.1;

  // ==================== FUNCIONES DE ZOOM Y PAN ====================

  const handleZoom = useCallback((delta, mousePos = null) => {
    setZoomLevel(prevZoom => {
      const zoomFactor = delta > 0 ? (1 + ZOOM_STEP) : (1 - ZOOM_STEP);
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom * zoomFactor));

      // Si se proporciona posición del mouse, hacer zoom hacia ese punto
      if (mousePos && newZoom !== prevZoom) {
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const canvasX = mousePos.x - rect.left - width / 2;
          const canvasY = mousePos.y - rect.top - height / 2;

          setPanOffset(prevOffset => ({
            x: prevOffset.x - (canvasX * (newZoom - prevZoom)) / newZoom,
            y: prevOffset.y - (canvasY * (newZoom - prevZoom)) / newZoom
          }));
        }
      }

      return newZoom;
    });
  }, [width, height]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const mousePos = { x: e.clientX, y: e.clientY };
    handleZoom(-e.deltaY, mousePos);
  }, [handleZoom]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setPanOffset(prev => ({
      x: prev.x + deltaX / zoomLevel,
      y: prev.y + deltaY / zoomLevel
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMousePos, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetView = useCallback(() => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => {
    handleZoom(1);
  }, [handleZoom]);

  const zoomOut = useCallback(() => {
    handleZoom(-1);
  }, [handleZoom]);

  // ==================== EVENT LISTENERS ====================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Agregar event listeners
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Prevenir menú contextual
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('contextmenu', (e) => e.preventDefault());
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

  // ==================== RENDERIZADO CON ZOOM ====================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Configuración de alta calidad para renderizado
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const centerX = width / 2;
    const centerY = height / 2;

    // Limpiar canvas con fondo negro profundo
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Configurar transformación para centrar el origen CON ZOOM Y PAN
    ctx.save();
    ctx.translate(centerX + panOffset.x, centerY + panOffset.y);
    ctx.scale(zoomLevel, -zoomLevel); // Aplicar zoom e invertir Y

    // ==================== RENDERIZAR TRANSCURSO DEL TRAZADO ====================
    if (pathPoints.length > 1) {
      if (showTrail) {
        // TRANSCURSO COMPLETO: Mostrar todo el rastro con degradado
        const trailLength = pathPoints.length;
        const fadeStartIndex = Math.max(0, trailLength - 500);

        for (let i = 1; i < pathPoints.length; i++) {
          let opacity = 1.0;

          if (i < fadeStartIndex) {
            opacity = 0.2 + (i / fadeStartIndex) * 0.3;
          } else {
            const recentProgress = (i - fadeStartIndex) / (trailLength - fadeStartIndex);
            opacity = 0.5 + recentProgress * 0.5;
          }

          const shapeColor = currentShapeInfo?.color || '#00ff88';
          ctx.strokeStyle = `${shapeColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;

          // Grosor ajustado por zoom
          const isRecent = i > trailLength - 100;
          ctx.lineWidth = (isRecent ? 4 : 2) / zoomLevel;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          if (isRecent) {
            ctx.shadowColor = shapeColor;
            ctx.shadowBlur = 6 / zoomLevel;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.beginPath();
          ctx.moveTo(pathPoints[i-1].x, pathPoints[i-1].y);
          ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
          ctx.stroke();
        }
      } else {
        // TRANSCURSO LIMITADO
        const recentPointsCount = Math.min(200, pathPoints.length);
        const startIndex = pathPoints.length - recentPointsCount;

        for (let i = startIndex + 1; i < pathPoints.length; i++) {
          const progress = (i - startIndex) / recentPointsCount;
          const opacity = 0.3 + progress * 0.7;

          const shapeColor = currentShapeInfo?.color || '#00ff88';
          ctx.strokeStyle = `${shapeColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 3 / zoomLevel;
          ctx.lineCap = 'round';

          ctx.beginPath();
          ctx.moveTo(pathPoints[i-1].x, pathPoints[i-1].y);
          ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
          ctx.stroke();
        }
      }

      ctx.shadowBlur = 0;
    }

    // ==================== RENDERIZAR CÍRCULOS GUÍA CON ZOOM ====================
    if (showCircles && epicycles.length > 0) {
      let currentPos = { x: 0, y: 0 };

      epicycles.forEach((epicycle, index) => {
        if (epicycle.radius > 2 / zoomLevel) { // Ajustar umbral por zoom
          const importance = epicycle.normalizedAmplitude || (epicycle.radius / (epicycles[0]?.radius || 1));
          const alpha = Math.max(0.03, Math.min(0.25, importance * 0.3));

          ctx.strokeStyle = `rgba(160, 160, 160, ${alpha})`;
          ctx.lineWidth = 1 / zoomLevel;
          ctx.setLineDash([3 / zoomLevel, 6 / zoomLevel]);

          ctx.beginPath();
          ctx.arc(currentPos.x, currentPos.y, epicycle.radius, 0, 2 * Math.PI);
          ctx.stroke();

          ctx.setLineDash([]);
        }
        currentPos = epicycle.end;
      });
    }

    // ==================== RENDERIZAR VECTORES CON ZOOM ====================
    if (showVectors && epicycles.length > 0) {
      let currentPos = { x: 0, y: 0 };

      epicycles.forEach((epicycle, index) => {
        if (!epicycle.end) return;

        const importance = epicycle.normalizedAmplitude || (epicycle.radius / (epicycles[0]?.radius || 1));
        let color, lineWidth, pointSize;

        // Ajustar tamaños por zoom
        if (index === 0) {
          color = '#ff4444';
          lineWidth = 6 / zoomLevel;
          pointSize = 10 / zoomLevel;
        } else if (importance > 0.4) {
          color = '#ff7700';
          lineWidth = 5 / zoomLevel;
          pointSize = 8 / zoomLevel;
        } else if (importance > 0.2) {
          color = '#ffbb00';
          lineWidth = 4 / zoomLevel;
          pointSize = 6 / zoomLevel;
        } else if (importance > 0.1) {
          color = '#4477ff';
          lineWidth = 3 / zoomLevel;
          pointSize = 5 / zoomLevel;
        } else if (importance > 0.05) {
          color = '#00bbff';
          lineWidth = 2 / zoomLevel;
          pointSize = 4 / zoomLevel;
        } else {
          color = '#888888';
          lineWidth = 1 / zoomLevel;
          pointSize = 3 / zoomLevel;
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';

        if (importance > 0.1) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 5 / zoomLevel;
        }

        ctx.beginPath();
        ctx.moveTo(currentPos.x, currentPos.y);
        ctx.lineTo(epicycle.end.x, epicycle.end.y);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Puntos ajustados por zoom
        if (importance > 0.08) {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(currentPos.x, currentPos.y, Math.max(2 / zoomLevel, pointSize * 0.5), 0, 2 * Math.PI);
          ctx.fill();
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(epicycle.end.x, epicycle.end.y, pointSize, 0, 2 * Math.PI);
        ctx.fill();

        if (importance > 0.15) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5 / zoomLevel;
          ctx.stroke();
        }

        currentPos = epicycle.end;
      });
    }

    // ==================== PUNTO FINAL CON ZOOM ====================
    if (finalPoint && (finalPoint.x !== 0 || finalPoint.y !== 0)) {
      const pulseIntensity = 1 + 0.2 * Math.sin(Date.now() * 0.008);
      const pointSize = (12 * pulseIntensity) / zoomLevel;
      const shapeColor = currentShapeInfo?.color || '#00ff88';

      // Halo exterior
      ctx.fillStyle = `${shapeColor}40`;
      ctx.beginPath();
      ctx.arc(finalPoint.x, finalPoint.y, pointSize * 1.8, 0, 2 * Math.PI);
      ctx.fill();

      // Punto principal
      ctx.fillStyle = shapeColor;
      ctx.shadowColor = shapeColor;
      ctx.shadowBlur = 12 / zoomLevel;
      ctx.beginPath();
      ctx.arc(finalPoint.x, finalPoint.y, pointSize, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 / zoomLevel;
      ctx.shadowBlur = 0;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(finalPoint.x, finalPoint.y, pointSize * 0.25, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.restore();

    // ==================== INFORMACIÓN EN PANTALLA CON ZOOM ====================
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px "Fira Code", monospace';
    ctx.textAlign = 'left';

    const stats = [
      `Forma: ${currentShapeInfo?.name || 'Desconocida'}`,
      `Vectores activos: ${epicycles.length}`,
      `Puntos del transcurso: ${pathPoints.length.toLocaleString()}`,
      `Progreso: ${animationProgress.toFixed(1)}%`,
      `Zoom: ${(zoomLevel * 100).toFixed(0)}%` // NUEVO: Mostrar nivel de zoom
    ];

    stats.forEach((stat, index) => {
      ctx.fillText(stat, 15, 30 + index * 25);
    });

    // Indicador de complejidad
    if (currentShapeInfo) {
      ctx.font = '14px "Fira Code", monospace';
      ctx.fillStyle = currentShapeInfo.color;
      ctx.fillText(`Complejidad: ${currentShapeInfo.complexity}`, 15, 160);
    }

    // Indicador de estado
    const statusY = height - 60;
    ctx.font = '15px "Fira Code", monospace';

    if (isDrawingComplete) {
      ctx.fillStyle = currentShapeInfo?.color || '#00ff88';
      ctx.fillText('✓ Transcurso completado', 15, statusY);
    } else {
      ctx.fillStyle = '#ffaa00';
      ctx.fillText('⟳ Construyendo paso a paso...', 15, statusY);
    }

    // Información del rastro
    ctx.font = '13px "Fira Code", monospace';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`Rastro: ${showTrail ? 'Completo' : 'Limitado'}`, 15, statusY + 20);

    // Leyenda de colores mejorada
    if (showVectors && epicycles.length > 0) {
      const legend = [
        { color: '#ff4444', text: 'Vector principal', size: '●●●●' },
        { color: '#ff7700', text: 'Muy importantes', size: '●●●○' },
        { color: '#ffbb00', text: 'Importantes', size: '●●○○' },
        { color: '#4477ff', text: 'Medianos', size: '●○○○' },
        { color: currentShapeInfo?.color || '#00ff88', text: 'Transcurso', size: '━━━━' }
      ];

      ctx.font = '12px "Fira Code", monospace';

      legend.forEach((item, index) => {
        const x = width - 190;
        const y = 30 + index * 20;

        // Indicador visual del tamaño
        ctx.fillStyle = item.color;
        ctx.fillText(item.size, x, y);

        // Texto descriptivo
        ctx.fillStyle = '#ffffff';
        ctx.fillText(item.text, x + 40, y);
      });

      // Marco para la leyenda
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width - 200, 10, 190, legend.length * 20 + 10);
    }

    // Barra de progreso del transcurso
    if (!isDrawingComplete) {
      const progressBarWidth = 250;
      const progressBarHeight = 10;
      const progressX = (width - progressBarWidth) / 2;
      const progressY = height - 25;

      // Fondo de la barra
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(progressX, progressY, progressBarWidth, progressBarHeight);

      // Progreso actual con color de la forma
      const shapeColor = currentShapeInfo?.color || '#00ff88';
      ctx.fillStyle = shapeColor;
      ctx.fillRect(progressX, progressY, (progressBarWidth * animationProgress) / 100, progressBarHeight);

      // Borde
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(progressX, progressY, progressBarWidth, progressBarHeight);

      // Texto del progreso
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Transcurso de construcción', width / 2, progressY - 8);
      ctx.textAlign = 'left';
    }

  }, [epicycles, pathPoints, finalPoint, width, height, showVectors, showCircles, showTrail,
      animationProgress, isDrawingComplete, currentShapeInfo, zoomLevel, panOffset]);

  return (
    <div className="canvas-container">
      {/* Controles de Zoom */}
      <div className="zoom-controls">
        <button
          className="zoom-btn zoom-in"
          onClick={zoomIn}
          title="Acercar (Zoom In)"
        >
          🔍+
        </button>
        <span className="zoom-level">{(zoomLevel * 100).toFixed(0)}%</span>
        <button
          className="zoom-btn zoom-out"
          onClick={zoomOut}
          title="Alejar (Zoom Out)"
        >
          🔍−
        </button>
        <button
          className="zoom-btn zoom-reset"
          onClick={resetView}
          title="Restablecer Vista"
        >
          🎯
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          border: `3px solid ${currentShapeInfo?.color || '#333333'}`,
          borderRadius: '12px',
          backgroundColor: '#000000',
          boxShadow: `0 8px 32px ${currentShapeInfo?.color || '#000000'}20`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      />

      {/* Instrucciones de uso */}
      <div className="canvas-instructions">
        <p>🖱️ <strong>Rueda del mouse:</strong> Zoom | <strong>Arrastrar:</strong> Mover vista</p>
      </div>
    </div>
  );
};

export default FourierCanvas;
