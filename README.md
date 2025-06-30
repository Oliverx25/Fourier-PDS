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

## Consideraciones Técnicas y Parámetros

### **Cantidad de Puntos por Figura**

La resolución (número de puntos) es crucial para la calidad de la reconstrucción. Cada figura tiene consideraciones específicas:

#### **Círculo (800 puntos)**
- **Justificación**: El círculo es la forma más simple, requiere menos puntos para una representación precisa
- **Características**: Frecuencia dominante constante, suavidad perfecta
- **Epiciclos óptimos**: 1-5 (solo necesita el componente fundamental)

#### **Cuadrado (1000 puntos)**
- **Justificación**: Las esquinas agudas requieren más puntos para capturar las discontinuidades
- **Características**: Saltos bruscos en las esquinas, armónicos impares dominantes
- **Epiciclos óptimos**: 15-35 (necesita muchos términos para suavizar las esquinas)

#### **Triángulo (900 puntos)**
- **Justificación**: Intermedio entre círculo y cuadrado, 3 esquinas menos agudas
- **Características**: Armónicos impares, mejora rápida con pocos términos
- **Epiciclos óptimos**: 5-20 (mejora visible con 10+ términos)

#### **Espiral (1200 puntos)**
- **Justificación**: Forma no periódica compleja, requiere alta resolución para capturar la curvatura
- **Características**: Trazo continuo, no estrictamente periódica
- **Epiciclos óptimos**: 5-10 (eficiente para formas no periódicas)

#### **Polígonos Generales (400 puntos base)**
- **Justificación**: Número variable de lados, resolución adaptativa
- **Fórmula**: `numPuntos = Math.max(400, lados * 80)` para mantener densidad de puntos por lado
- **Epiciclos óptimos**: `Math.max(5, lados * 2)` para capturar las esquinas

### **Parámetros de Animación**

#### **Velocidad de Animación**
- **Valor óptimo**: 1.00 (velocidad real)
- **Rango**: 0.1 - 3.0
- **Consideración**: Velocidades diferentes a 1.00 pueden distorsionar la reconstrucción temporal

#### **Escala de Visualización**
- **Valor**: 120 píxeles por unidad
- **Justificación**: Balance entre visibilidad y precisión
- **Adaptación**: Se ajusta automáticamente según el tamaño del canvas

### **Algoritmo de Muestreo**

#### **Distribución Uniforme**
```js
// Para cada punto i de 0 a numPuntos-1
const t = i / numPuntos; // Parámetro normalizado [0, 1)
```

#### **Interpolación Lineal para Polígonos**
```js
// Para polígonos con lados variables
const lado = Math.floor(lados * t);
const ang0 = (2π / lados) * lado;
const ang1 = (2π / lados) * (lado + 1);
const localT = (t * lados) % 1;
// Interpolación lineal entre vértices
```

### **Optimizaciones de Rendimiento**

#### **Límite de Epiciclos**
- **Máximo**: 100 epiciclos para evitar sobrecarga computacional
- **Ordenamiento**: Por amplitud descendente para mostrar los más importantes primero
- **Culling**: Solo se renderizan los epiciclos activos

#### **Gestión de Memoria**
- **Puntos de rastro**: Limitados a 1000 puntos para evitar degradación de rendimiento
- **Limpieza automática**: Los puntos antiguos se eliminan cuando se excede el límite

### **Precisión Numérica**

#### **Transformada Discreta de Fourier**
- **Precisión**: 64-bit floating point
- **Normalización**: División por N para obtener coeficientes correctos
- **Ordenamiento**: Por amplitud para priorizar componentes importantes

#### **Cálculo de Fases**
- **Rango**: [-π, π] radianes
- **Conversión**: A grados para visualización (0° - 360°)
- **Precisión**: 3 decimales para amplitudes, 0 decimales para fases

---

## Análisis Matemático: Frecuencia, Amplitud y Fase por Figura

### **Cómo se Obtienen los Coeficientes de Fourier**

La Transformada Discreta de Fourier (DFT) calcula para cada frecuencia k:

```js
X[k] = (1/N) * Σ[n=0 to N-1] z[n] * e^(-i*2π*k*n/N)
```

Donde:
- **z[n] = x[n] + i*y[n]** es el punto complejo en la posición n
- **N** es el número total de puntos
- **k** es la frecuencia (0, 1, 2, ..., N-1)

De cada coeficiente complejo X[k] se extrae:
- **Amplitud**: `|X[k]| = √(Re² + Im²)`
- **Fase**: `φ[k] = atan2(Im, Re)`
- **Frecuencia**: `f[k] = k` (en ciclos por período)

### **Análisis por Tipo de Figura**

#### **1. Círculo - Frecuencia Dominante**

**Características de los puntos:**
```js
x(t) = cos(2πt)
y(t) = sin(2πt)
```

**Resultado de la DFT:**
- **Frecuencia 0**: Amplitud ≈ 0 (no hay componente constante)
- **Frecuencia 1**: Amplitud ≈ 1 (componente fundamental dominante)
- **Frecuencias > 1**: Amplitud ≈ 0 (armónicos despreciables)

**Explicación física:**
- El círculo es una función senoidal pura
- Solo necesita el primer armónico (frecuencia 1)
- La fase es 0° porque comienza en (1,0)
- **Por eso**: 1 epiciclo es suficiente para reconstruir perfectamente

#### **2. Cuadrado - Armónicos Impares**

**Características de los puntos:**
```js
// Función discontinua con saltos en t = 0, 0.25, 0.5, 0.75
x(t) = sign(cos(2πt))  // ±1
y(t) = sign(sin(2πt))  // ±1
```

**Resultado de la DFT:**
- **Frecuencia 0**: Amplitud ≈ 0 (centro en origen)
- **Frecuencia 1**: Amplitud ≈ 0.636 (4/π)
- **Frecuencia 3**: Amplitud ≈ 0.212 (4/3π)
- **Frecuencia 5**: Amplitud ≈ 0.127 (4/5π)
- **Frecuencia 7**: Amplitud ≈ 0.091 (4/7π)

**Patrón matemático:**
```
Amplitud[k] = 4/(kπ) para k impar
Amplitud[k] = 0 para k par
```

**Explicación física:**
- Las discontinuidades en las esquinas requieren infinitos armónicos
- Los armónicos impares (1, 3, 5, 7...) son los más importantes
- **Por eso**: Necesita 15-35 epiciclos para suavizar las esquinas

#### **3. Triángulo - Armónicos Impares con Decaimiento Rápido**

**Características de los puntos:**
```js
// Función lineal por tramos con 3 discontinuidades
// Cada lado es una interpolación lineal entre vértices
```

**Resultado de la DFT:**
- **Frecuencia 0**: Amplitud ≈ 0 (centro en origen)
- **Frecuencia 1**: Amplitud ≈ 0.551
- **Frecuencia 3**: Amplitud ≈ 0.061
- **Frecuencia 5**: Amplitud ≈ 0.022
- **Frecuencia 7**: Amplitud ≈ 0.011

**Patrón matemático:**
```
Amplitud[k] ∝ 1/k² para k impar
Decaimiento más rápido que el cuadrado
```

**Explicación física:**
- Menos discontinuidades (3 vs 4 esquinas)
- Decaimiento más rápido de armónicos
- **Por eso**: Mejora visible con solo 10+ epiciclos

#### **4. Espiral - Espectro Continuo**

**Características de los puntos:**
```js
x(t) = t * cos(6πt)  // Radio creciente
y(t) = t * sin(6πt)  // 3 vueltas completas
```

**Resultado de la DFT:**
- **Espectro distribuido**: Múltiples frecuencias con amplitudes similares
- **Sin frecuencia dominante**: No hay un armónico principal claro
- **Amplitudes decrecientes**: Suavemente distribuidas

**Explicación física:**
- Forma no periódica (radio creciente)
- Requiere aproximación con múltiples frecuencias
- **Por eso**: 5-10 epiciclos funcionan bien para aproximación

#### **5. Polígonos Regulares - Patrón Armónico**

**Características de los puntos:**
```js
// Para un polígono de n lados
// Frecuencias dominantes: 1, n, 2n, 3n, ...
```

**Resultado de la DFT:**
- **Frecuencia 1**: Componente fundamental
- **Frecuencia n**: Armónico principal (donde n = número de lados)
- **Frecuencias kn**: Armónicos múltiplos del número de lados

**Patrón matemático:**
```
Amplitud[k] es máxima cuando k es múltiplo del número de lados
```

**Explicación física:**
- Cada lado contribuye a frecuencias específicas
- Más lados = más armónicos necesarios
- **Por eso**: `Math.max(5, lados * 2)` epiciclos óptimos

### **Interpretación de Fases**

#### **Fase 0° (0 radianes)**
- El epiciclo comienza en la dirección positiva del eje X
- Para el epiciclo principal: determina el punto de inicio de la figura

#### **Fase 90° (π/2 radianes)**
- El epiciclo comienza en la dirección positiva del eje Y
- Afecta la orientación inicial de la figura

#### **Fase 180° (π radianes)**
- El epiciclo comienza en la dirección negativa del eje X
- Invierte la dirección del epiciclo

#### **Fases Intermedias**
- Determinan la posición exacta de inicio de cada epiciclo
- Afectan la sincronización entre epiciclos

### **Efecto de la Cantidad de Puntos**

#### **Pocos Puntos (< 200)**
- **Problema**: Aliasing (frecuencias falsas)
- **Síntoma**: Artefactos en la reconstrucción
- **Solución**: Aumentar resolución

#### **Puntos Óptimos (400-1200)**
- **Beneficio**: Captura precisa de la forma
- **Balance**: Rendimiento vs precisión
- **Resultado**: Reconstrucción fiel

#### **Demasiados Puntos (> 2000)**
- **Problema**: Sobremuestreo innecesario
- **Síntoma**: Lentitud sin mejora visible
- **Solución**: Reducir a valores óptimos

### **Relación entre Parámetros**

#### **Fórmula de Nyquist**
```
frecuencia_máxima_detectable = numPuntos / 2
```

#### **Resolución Temporal**
```
tiempo_entre_puntos = período / numPuntos
```

#### **Precisión de Fase**
```
precisión_fase = 360° / numPuntos
```

### **Optimización de Epiciclos**

#### **Criterio de Parada**
- **Amplitud relativa**: `amp[k] / amp[0] < 0.01` (1% del principal)
- **Contribución acumulada**: `Σ(amp[0] a amp[k]) / Σ(total) > 0.95` (95% de la forma)

#### **Ordenamiento por Importancia**
```js
// Los epiciclos se ordenan por amplitud descendente
epiciclos.sort((a, b) => b.amp - a.amp);
```

#### **Visualización Progresiva**
- Mostrar epiciclos uno por uno
- Demostrar cómo cada uno mejora la aproximación
- Ilustrar el principio de convergencia de Fourier

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

