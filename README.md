# React + Vite

## Resumen del Algoritmo de Fourier para Polígonos

Este proyecto visualiza cómo se puede reconstruir cualquier polígono (o figura cerrada) usando la descomposición en Serie de Fourier y vectores giratorios (epiciclos).

**Descripción del algoritmo:**
1. **Representación de la figura:**
   - Se parte de una figura poligonal representada por una lista de puntos distribuidos uniformemente a lo largo de su contorno.
   - Cada punto se interpreta como un número complejo (x + iy), lo que permite trabajar con la figura en el plano complejo.
2. **Transformada de Fourier Discreta (DFT):**
   - Se aplica la DFT a la lista de puntos para obtener una serie de coeficientes complejos.
   - Cada coeficiente representa un vector giratorio (epiciclo) con una frecuencia, amplitud y fase específicas.
3. **Construcción con epiciclos:**
   - Los epiciclos se encadenan: el primero parte del origen, el siguiente gira desde la punta del anterior, y así sucesivamente.
   - Cada vector gira a una velocidad proporcional a su frecuencia y su tamaño depende de la amplitud calculada.
4. **Trazado progresivo:**
   - A medida que los vectores giran, la punta del último vector va trazando la figura original.
   - El proceso muestra cómo la suma de estos movimientos circulares reconstruye la forma del polígono de manera suave y precisa.

Este método permite visualizar de forma intuitiva cómo la Serie de Fourier puede descomponer y reconstruir cualquier figura cerrada usando únicamente sumas de movimientos circulares.

---

## Ejemplos de implementación y fragmentos de código

A continuación se muestran fragmentos clave del código para entender cómo se implementa el proceso descrito arriba:

### 1. Generación de puntos de la figura

```js
// src/utils/fourierUtils.js
export function generarPuntosFigura(tipoFigura, numPuntos, lados = 5) {
  const puntos = [];
  const TAU = Math.PI * 2;
  switch (tipoFigura) {
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
    // ...otros casos omitidos para brevedad
  }
  return puntos;
}
```

### 2. Cálculo de la Transformada Discreta de Fourier (DFT)

```js
// src/utils/fourierUtils.js
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
```

### 3. Uso de los coeficientes para animar y reconstruir la figura

```js
// src/components/Canvas.jsx (fragmento)
let x = 0, y = 0;
let prevX = 0, prevY = 0;
const t = tRef.current;
fourierRef.current.forEach((coef, i) => {
  prevX = x;
  prevY = y;
  const freq = coef.freq;
  const amp = coef.amp * ESCALA;
  const phase = coef.phase;
  // Movimiento circular
  x += amp * Math.cos(freq * t * 2 * Math.PI + phase);
  y += amp * Math.sin(freq * t * 2 * Math.PI + phase);
  // Dibuja el círculo auxiliar (epiciclo)
  ctx.beginPath();
  ctx.arc(prevX, prevY, amp, 0, 2 * Math.PI);
  ctx.stroke();
  // Dibuja el vector
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(x, y);
  ctx.stroke();
});
```

### 4. Integración en la interfaz

```js
// src/components/FourierVisualizer.jsx (fragmento)
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
/>
<Canvas
  tipoFigura={tipoFigura}
  lados={lados}
  velocidad={velocidad}
  numFrecuencias={numFrecuencias}
  pausado={pausado}
/>
```

Estos fragmentos muestran cómo se implementa el flujo completo: desde la generación de los puntos del polígono, el cálculo de los coeficientes de Fourier, hasta la animación visual de la reconstrucción usando epiciclos.

