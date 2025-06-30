/**
 * Definiciones de figuras geométricas para visualización con Series de Fourier
 * Cada figura está representada por un conjunto de puntos que definen su contorno
 */

/**
 * Genera puntos para un círculo
 * Ideal para mostrar una frecuencia dominante constante
 */
export function generateCircle(numPoints = 800, radius = 1) {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (2 * Math.PI * i) / numPoints;
    points.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    });
  }
  return points;
}

/**
 * Genera puntos para un cuadrado
 * Perfecto para mostrar armónicos impares en la serie de Fourier
 */
export function generateSquare(numPoints = 1000, size = 1) {
  const points = [];
  const pointsPerSide = Math.floor(numPoints / 4);

  // Lado superior (izquierda a derecha)
  for (let i = 0; i < pointsPerSide; i++) {
    const t = i / pointsPerSide;
    points.push({
      x: -size + 2 * size * t,
      y: size
    });
  }

  // Lado derecho (arriba a abajo)
  for (let i = 0; i < pointsPerSide; i++) {
    const t = i / pointsPerSide;
    points.push({
      x: size,
      y: size - 2 * size * t
    });
  }

  // Lado inferior (derecha a izquierda)
  for (let i = 0; i < pointsPerSide; i++) {
    const t = i / pointsPerSide;
    points.push({
      x: size - 2 * size * t,
      y: -size
    });
  }

  // Lado izquierdo (abajo a arriba)
  for (let i = 0; i < pointsPerSide; i++) {
    const t = i / pointsPerSide;
    points.push({
      x: -size,
      y: -size + 2 * size * t
    });
  }

  return points;
}

/**
 * Genera puntos para un triángulo equilátero
 * Muestra cómo disminuyen las amplitudes rápidamente
 */
export function generateTriangle(numPoints = 900, size = 1) {
  const points = [];
  const vertices = [
    { x: 0, y: size },                    // Vértice superior
    { x: -size * Math.cos(Math.PI/6), y: -size * Math.sin(Math.PI/6) }, // Vértice inferior izquierdo
    { x: size * Math.cos(Math.PI/6), y: -size * Math.sin(Math.PI/6) }   // Vértice inferior derecho
  ];

  const pointsPerSide = Math.floor(numPoints / 3);

  for (let side = 0; side < 3; side++) {
    const startVertex = vertices[side];
    const endVertex = vertices[(side + 1) % 3];

    for (let i = 0; i < pointsPerSide; i++) {
      const t = i / pointsPerSide;
      points.push({
        x: startVertex.x + t * (endVertex.x - startVertex.x),
        y: startVertex.y + t * (endVertex.y - startVertex.y)
      });
    }
  }

  return points;
}

/**
 * Genera puntos para una estrella de 5 puntas
 * Figura compleja, buena para notar muchas frecuencias
 */
export function generateStar(numPoints = 1200, outerRadius = 1, innerRadius = 0.4) {
  const points = [];
  const spikes = 5;

  for (let i = 0; i < numPoints; i++) {
    const angle = (2 * Math.PI * i) / numPoints;
    const spikeAngle = (2 * Math.PI) / (spikes * 2);
    const currentSpike = Math.floor(angle / spikeAngle);
    const angleInSpike = angle % spikeAngle;

    let radius;
    if (currentSpike % 2 === 0) {
      // Transición de punta exterior a interior
      radius = outerRadius - (outerRadius - innerRadius) * (angleInSpike / spikeAngle);
    } else {
      // Transición de interior a punta exterior
      radius = innerRadius + (outerRadius - innerRadius) * (angleInSpike / spikeAngle);
    }

    points.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    });
  }

  return points;
}

/**
 * Genera puntos para la letra "S"
 * Para mostrar cómo incluso el texto puede descomponerse en series de Fourier
 */
export function generateLetterS(numPoints = 1000, size = 1) {
  const points = [];

  // Parametrización de la letra S usando curvas Bézier simplificadas
  for (let i = 0; i < numPoints; i++) {
    const t = i / numPoints;

    let x, y;

    if (t < 0.25) {
      // Curva superior derecha
      const localT = t / 0.25;
      x = size * (0.5 - 0.5 * Math.cos(localT * Math.PI));
      y = size * (0.5 + 0.3 * Math.sin(localT * Math.PI));
    } else if (t < 0.5) {
      // Parte central
      const localT = (t - 0.25) / 0.25;
      x = size * (0.5 - localT * 0.5);
      y = size * (0.2 - localT * 0.4);
    } else if (t < 0.75) {
      // Curva central
      const localT = (t - 0.5) / 0.25;
      x = size * (0 + 0.5 * Math.sin(localT * Math.PI));
      y = size * (-0.2 - 0.3 * Math.cos(localT * Math.PI));
    } else {
      // Curva inferior izquierda
      const localT = (t - 0.75) / 0.25;
      x = size * (0.5 * Math.sin(localT * Math.PI));
      y = size * (-0.5 + 0.3 * Math.sin(localT * Math.PI));
    }

    points.push({ x, y });
  }

  return points;
}

/**
 * Genera una espiral logarítmica
 * Excelente para mostrar múltiples frecuencias en acción
 */
export function generateSpiral(numPoints = 1200, turns = 2, maxRadius = 1) {
  const points = [];

  for (let i = 0; i < numPoints; i++) {
    const t = i / numPoints;
    const angle = t * turns * 2 * Math.PI;
    const radius = maxRadius * t;

    points.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    });
  }

  return points;
}

/**
 * Catálogo de figuras disponibles con sus metadatos
 * ACTUALIZADO: Configuraciones técnicas precisas basadas en análisis matemático
 */
export const SHAPES_CATALOG = {
  circle: {
    name: 'Círculo',
    description: 'Frecuencia dominante constante - perfectamente suave',
    generator: generateCircle,
    defaultParams: [800, 1],
    color: '#3b82f6', // azul
    optimalEpicycles: 1, // ACTUALIZADO: Solo necesita 1 epicycle para ser perfecto
    minEpicycles: 1,
    maxEpicycles: 5,
    complexity: 'simple',
    harmonics: 'fundamental',
    characteristics: ['simétrica', 'suave', 'frecuencia constante']
  },
  square: {
    name: 'Cuadrado',
    description: 'Armónicos impares - saltos bruscos requieren más términos',
    generator: generateSquare,
    defaultParams: [1000, 1],
    color: '#ef4444', // rojo
    optimalEpicycles: 20, // ACTUALIZADO: Ideal 20+ para suavizar bordes
    minEpicycles: 15,
    maxEpicycles: 35,
    complexity: 'media',
    harmonics: 'impares con énfasis en suavizado',
    characteristics: ['esquinas definidas', 'saltos bruscos', 'requiere suavizado']
  },
  triangle: {
    name: 'Triángulo',
    description: 'Armónicos impares - mejora rápida con pocos términos',
    generator: generateTriangle,
    defaultParams: [900, 1],
    color: '#10b981', // verde
    optimalEpicycles: 10, // ACTUALIZADO: Al menos 10 como especificado
    minEpicycles: 5,
    maxEpicycles: 20,
    complexity: 'simple',
    harmonics: 'impares (1, 3, 5, ...)',
    characteristics: ['angular', 'mejora rápida', 'armónicos impares']
  },
  star: {
    name: 'Estrella',
    description: 'Múltiples armónicos - discontinuidades en puntas',
    generator: generateStar,
    defaultParams: [1200, 1, 0.4],
    color: '#f59e0b', // amarillo
    optimalEpicycles: 35, // ACTUALIZADO: 30-40 como especificado
    minEpicycles: 25,
    maxEpicycles: 50,
    complexity: 'alta',
    harmonics: 'múltiples con discontinuidades',
    characteristics: ['puntas detalladas', 'discontinuidades', 'múltiples frecuencias']
  },
  letterS: {
    name: 'Letra S',
    description: 'Curvas complejas - curvatura variable requiere 50+ términos',
    generator: generateLetterS,
    defaultParams: [1000, 1],
    color: '#8b5cf6', // púrpura
    optimalEpicycles: 50, // ACTUALIZADO: 50+ para evitar pérdida de forma
    minEpicycles: 40,
    maxEpicycles: 80,
    complexity: 'alta',
    harmonics: 'curvas suaves y curvatura variable',
    characteristics: ['curvas complejas', 'curvatura variable', 'alta fidelidad requerida']
  },
  spiral: {
    name: 'Espiral',
    description: 'No estrictamente periódica - 5-8 epicycles funcionan bien',
    generator: generateSpiral,
    defaultParams: [1200, 2, 1],
    color: '#06b6d4', // cyan
    optimalEpicycles: 6, // ACTUALIZADO: 5-8 como especificado
    minEpicycles: 5,
    maxEpicycles: 10,
    complexity: 'simple',
    harmonics: 'aproximación de forma no periódica',
    characteristics: ['no periódica', 'trazo continuo', 'eficiente']
  }
};

/**
 * Función helper para obtener los puntos de una figura por su clave
 */
export function getShapePoints(shapeKey) {
  const shape = SHAPES_CATALOG[shapeKey];
  if (!shape) {
    throw new Error(`Figura '${shapeKey}' no encontrada`);
  }

  return shape.generator(...shape.defaultParams);
}

/**
 * Función helper para obtener el número óptimo de epicycles para una forma
 * MEJORADA: Incluye rangos mínimos y máximos
 */
export function getOptimalEpicycles(shapeKey) {
  const shape = SHAPES_CATALOG[shapeKey];
  return shape?.optimalEpicycles || 30; // Valor por defecto
}

/**
 * Función helper para obtener el rango de epicycles recomendado
 */
export function getEpicyclesRange(shapeKey) {
  const shape = SHAPES_CATALOG[shapeKey];
  return {
    min: shape?.minEpicycles || 5,
    optimal: shape?.optimalEpicycles || 30,
    max: shape?.maxEpicycles || 100
  };
}

/**
 * Función helper para obtener información básica de la forma
 * Compatible con el código en App.jsx
 */
export function getShapeInfo(shapeKey) {
  const shape = SHAPES_CATALOG[shapeKey];
  if (!shape) return null;

  return {
    name: shape.name,
    description: shape.description,
    complexity: shape.complexity,
    color: shape.color
  };
}

/**
 * Función helper para obtener información técnica detallada
 */
export function getTechnicalInfo(shapeKey) {
  const shape = SHAPES_CATALOG[shapeKey];
  if (!shape) return null;

  return {
    harmonics: shape.harmonics,
    characteristics: shape.characteristics,
    complexity: shape.complexity,
    epicyclesRange: getEpicyclesRange(shapeKey)
  };
}
