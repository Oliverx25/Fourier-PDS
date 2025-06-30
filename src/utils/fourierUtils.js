/**
 * Utilidades matemáticas para Series de Fourier
 * Implementa la Transformada de Fourier Discreta (DFT) y funciones auxiliares
 * para la visualización de figuras mediante vectores giratorios (epicycles)
 */

/**
 * Representa un número complejo para las operaciones de Fourier
 */
export class ComplexNumber {
  constructor(real = 0, imag = 0) {
    this.real = real;
    this.imag = imag;
  }

  // Suma de números complejos
  add(other) {
    return new ComplexNumber(
      this.real + other.real,
      this.imag + other.imag
    );
  }

  // Multiplicación de números complejos
  multiply(other) {
    return new ComplexNumber(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real
    );
  }

  // Magnitud (amplitud) del número complejo
  magnitude() {
    return Math.sqrt(this.real * this.real + this.imag * this.imag);
  }

  // Fase (ángulo) del número complejo
  phase() {
    return Math.atan2(this.imag, this.real);
  }

  // División por un escalar
  divide(scalar) {
    return new ComplexNumber(this.real / scalar, this.imag / scalar);
  }
}

/**
 * ALGORITMO PRINCIPAL: Transformada de Fourier Discreta (DFT)
 * VERSIÓN MEJORADA para máxima precisión
 */
export function computeDFT(points) {
  const N = points.length;
  const coefficients = [];

  console.log(`🔄 Iniciando DFT de alta precisión para ${N} puntos...`);

  // PASO 1: Calcular coeficientes de Fourier con normalización correcta
  for (let k = 0; k < N; k++) {
    let sum = new ComplexNumber(0, 0);

    for (let n = 0; n < N; n++) {
      // Convertir punto (x,y) a número complejo
      const pointComplex = new ComplexNumber(points[n].x, points[n].y);

      // Calcular exponencial compleja: e^(-2πikn/N)
      const angle = (-2 * Math.PI * k * n) / N;
      const exponential = new ComplexNumber(Math.cos(angle), Math.sin(angle));

      // Acumular suma
      sum = sum.add(pointComplex.multiply(exponential));
    }

    // Normalizar correctamente por N para obtener coeficientes apropiados
    const normalizedSum = sum.divide(N);
    const amplitude = normalizedSum.magnitude();

    // Filtro más estricto para eliminar ruido pero mantener detalles importantes
    if (amplitude > 1e-6) {
      coefficients.push({
        frequency: k,
        amplitude: amplitude,
        phase: normalizedSum.phase(),
        complex: normalizedSum
      });
    }
  }

  // Ordenar por amplitud descendente para priorizar componentes importantes
  const sortedCoefficients = coefficients.sort((a, b) => b.amplitude - a.amplitude);

  console.log(`✅ DFT completada: ${sortedCoefficients.length} coeficientes significativos`);
  console.log(`📊 Amplitudes: máx=${sortedCoefficients[0]?.amplitude.toFixed(4)}, mín=${sortedCoefficients[sortedCoefficients.length-1]?.amplitude.toFixed(6)}`);

  return sortedCoefficients;
}

/**
 * CÁLCULO DE EPICYCLES MEJORADO
 * Escala automática optimizada y posicionamiento preciso
 */
export function calculateEpicycles(coefficients, time, numEpicycles) {
  if (!coefficients.length) return { epicycles: [], finalPoint: { x: 0, y: 0 } };

  const epicycles = [];
  let currentPos = { x: 0, y: 0 };

  // ESCALA AUTOMÁTICA MEJORADA
  const maxAmplitude = coefficients[0]?.amplitude || 1;
  // Escala más grande para figuras más visibles y definidas
  const targetSize = 300; // Aumentado de 200 a 300
  const scaleFactor = targetSize / maxAmplitude;

  console.log(`🎯 Escala optimizada: ${scaleFactor.toFixed(2)} (amplitud máx: ${maxAmplitude.toFixed(4)})`);

  // Generar epicycles con precisión mejorada
  const numToUse = Math.min(numEpicycles, coefficients.length);

  for (let i = 0; i < numToUse; i++) {
    const coeff = coefficients[i];

    // Calcular ángulo de rotación con precisión
    const angle = coeff.frequency * time + coeff.phase;

    // Calcular radio escalado
    const radius = coeff.amplitude * scaleFactor;

    // Calcular posición del extremo del vector con precisión
    const vectorEnd = {
      x: currentPos.x + radius * Math.cos(angle),
      y: currentPos.y + radius * Math.sin(angle)
    };

    epicycles.push({
      center: { ...currentPos },
      end: vectorEnd,
      radius: radius,
      frequency: coeff.frequency,
      phase: angle,
      amplitude: coeff.amplitude,
      normalizedAmplitude: coeff.amplitude / maxAmplitude // Para renderizado
    });

    currentPos = vectorEnd;
  }

  return {
    epicycles,
    finalPoint: currentPos
  };
}

/**
 * Función MEJORADA para centrar y escalar puntos de entrada
 */
export function preprocessPoints(points) {
  if (!points.length) return points;

  // PASO 1: Encontrar centro de masa con precisión
  const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

  // PASO 2: Centrar puntos
  const centeredPoints = points.map(p => ({
    x: p.x - centerX,
    y: p.y - centerY
  }));

  // PASO 3: Encontrar escala apropiada
  const distances = centeredPoints.map(p => Math.sqrt(p.x * p.x + p.y * p.y));
  const maxDistance = Math.max(...distances);
  const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

  // Usar distancia promedio para mejor normalización
  const targetRadius = 1.0;
  const scale = targetRadius / Math.max(maxDistance, avgDistance * 1.5);

  // PASO 4: Normalizar con escala optimizada
  const normalizedPoints = centeredPoints.map(p => ({
    x: p.x * scale,
    y: p.y * scale
  }));

  console.log(`📐 Preprocesamiento: centro=(${centerX.toFixed(2)}, ${centerY.toFixed(2)}), escala=${scale.toFixed(4)}`);
  console.log(`📊 Distancias: máx=${maxDistance.toFixed(2)}, promedio=${avgDistance.toFixed(2)}`);

  return normalizedPoints;
}

/**
 * Función auxiliar para obtener estadísticas detalladas de los coeficientes
 */
export function getCoefficientsStats(coefficients) {
  if (!coefficients.length) return null;

  const amplitudes = coefficients.map(c => c.amplitude);
  const totalEnergy = amplitudes.reduce((sum, a) => sum + a * a, 0);

  return {
    total: coefficients.length,
    maxAmplitude: coefficients[0].amplitude,
    minAmplitude: coefficients[coefficients.length - 1].amplitude,
    avgAmplitude: amplitudes.reduce((sum, a) => sum + a, 0) / amplitudes.length,
    totalEnergy: totalEnergy,
    dominantFrequency: coefficients[0].frequency,
    energyDistribution: coefficients.slice(0, 10).map(c => ({
      frequency: c.frequency,
      amplitude: c.amplitude,
      energyPercent: (c.amplitude * c.amplitude / totalEnergy * 100).toFixed(1)
    }))
  };
}

/**
 * Función para optimizar el número de puntos basado en la complejidad de la figura
 */
export function optimizePointCount(points, targetComplexity = 'high') {
  const complexityLevels = {
    low: 0.5,
    medium: 0.75,
    high: 1.0,
    ultra: 1.5
  };

  const factor = complexityLevels[targetComplexity] || 1.0;
  const targetCount = Math.ceil(points.length * factor);

  if (targetCount <= points.length) {
    // Submuestreo inteligente
    const step = points.length / targetCount;
    const optimized = [];

    for (let i = 0; i < points.length; i += step) {
      optimized.push(points[Math.floor(i)]);
    }

    return optimized;
  } else {
    // Interpolación para más puntos
    const interpolated = [];

    for (let i = 0; i < points.length; i++) {
      interpolated.push(points[i]);

      // Agregar punto interpolado entre este y el siguiente
      if (i < points.length - 1) {
        const current = points[i];
        const next = points[i + 1];
        const mid = {
          x: (current.x + next.x) / 2,
          y: (current.y + next.y) / 2
        };
        interpolated.push(mid);
      }
    }

    return interpolated.slice(0, targetCount);
  }
}

/**
 * Convierte puntos de coordenadas de pantalla a números complejos normalizados
 * Útil para procesar figuras dibujadas por el usuario
 */
export function normalizePoints(points, centerX, centerY, scale = 100) {
  return points.map(point => ({
    x: (point.x - centerX) / scale,
    y: (point.y - centerY) / scale
  }));
}

/**
 * Escala puntos para ajustarlos al canvas de visualización
 */
export function scalePointsForCanvas(points, canvasWidth, canvasHeight, scaleFactor = 80) {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  return points.map(point => ({
    x: centerX + point.x * scaleFactor,
    y: centerY + point.y * scaleFactor
  }));
}
