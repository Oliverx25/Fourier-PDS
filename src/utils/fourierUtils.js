// Utilidades matemáticas para la Serie de Fourier y generación de figuras

/**
 * Genera puntos complejos (x + iy) para diferentes figuras geométricas.
 * @param {string} tipoFigura - 'circulo', 'cuadrado', 'triangulo', 'estrella', 'espiral', 'poligono'
 * @param {number} numPuntos - Cantidad de puntos a generar
 * @param {number} [lados=5] - Solo para polígono: número de lados
 * @returns {Array<{x: number, y: number}>}
 */
export function generarPuntosFigura(tipoFigura, numPuntos, lados = 5) {
  const puntos = [];
  const TAU = Math.PI * 2;
  switch (tipoFigura) {
    case 'circulo':
      for (let i = 0; i < numPuntos; i++) {
        const t = i / numPuntos;
        puntos.push({
          x: Math.cos(TAU * t),
          y: Math.sin(TAU * t),
        });
      }
      break;
    case 'cuadrado':
      for (let i = 0; i < numPuntos; i++) {
        const t = i / numPuntos;
        const lado = Math.floor(4 * t);
        let x, y;
        if (lado === 0) { x = 1 - 4 * t; y = 1; }
        else if (lado === 1) { x = -1; y = 3 - 4 * t; }
        else if (lado === 2) { x = -1 + 4 * t; y = -1; }
        else { x = 1; y = -1 + 4 * t; }
        puntos.push({ x, y });
      }
      break;
    case 'triangulo':
      for (let i = 0; i < numPuntos; i++) {
        const t = i / numPuntos;
        const lado = Math.floor(3 * t);
        let x, y;
        if (lado === 0) { x = 1 - 3 * t; y = Math.sqrt(3) * (3 * t) / 3; }
        else if (lado === 1) { x = -1 + 3 * t * 2; y = Math.sqrt(3) * (1 - (3 * t - 1) / 3); }
        else { x = 1 - 3 * t; y = -Math.sqrt(3) * (3 * t - 2) / 3; }
        puntos.push({ x, y });
      }
      break;
    case 'estrella':
      const spikes = 5;
      const radioExterno = 1, radioInterno = 0.5;
      for (let i = 0; i < numPuntos; i++) {
        const t = i / numPuntos;
        const ang = TAU * t * spikes;
        const r = (i % 2 === 0) ? radioExterno : radioInterno;
        puntos.push({
          x: Math.cos(ang) * r,
          y: Math.sin(ang) * r,
        });
      }
      break;
    case 'espiral':
      for (let i = 0; i < numPuntos; i++) {
        const t = i / numPuntos;
        const ang = TAU * 3 * t;
        const r = t;
        puntos.push({
          x: Math.cos(ang) * r,
          y: Math.sin(ang) * r,
        });
      }
      break;
    case 'poligono':
      for (let i = 0; i < numPuntos; i++) {
        const t = i / numPuntos;
        const ang = TAU * t;
        const r = 1;
        const lado = Math.floor(lados * t);
        const ang0 = (TAU / lados) * lado;
        const ang1 = (TAU / lados) * (lado + 1);
        const localT = (t * lados) % 1;
        const x = (1 - localT) * Math.cos(ang0) + localT * Math.cos(ang1);
        const y = (1 - localT) * Math.sin(ang0) + localT * Math.sin(ang1);
        puntos.push({ x, y });
      }
      break;
    default:
      return [];
  }
  return puntos;
}

/**
 * Realiza la Transformada Discreta de Fourier (DFT) sobre una lista de puntos complejos.
 * @param {Array<{x: number, y: number}>} puntos
 * @returns {Array<{re: number, im: number, freq: number, amp: number, phase: number}>}
 */
export function DFT(puntos) {
  const N = puntos.length;
  const X = [];
  for (let k = 0; k < N; k++) {
    let re = 0, im = 0;
    for (let n = 0; n < N; n++) {
      const phi = (-2 * Math.PI * k * n) / N;
      re += puntos[n].x * Math.cos(phi) - puntos[n].y * Math.sin(phi);
      im += puntos[n].x * Math.sin(phi) + puntos[n].y * Math.cos(phi);
    }
    re /= N;
    im /= N;
    const amp = Math.sqrt(re * re + im * im);
    const phase = Math.atan2(im, re);
    X.push({ re, im, freq: k, amp, phase });
  }
  // Ordenar por amplitud descendente
  X.sort((a, b) => b.amp - a.amp);
  return X;
}
