import React, { useRef, useEffect } from 'react';
import { generarPuntosFigura, DFT } from '../utils/fourierUtils';

// Parámetros de renderizado
const NUM_PUNTOS = 400; // Resolución de la figura
const ESCALA = 120; // Escala para que la figura se vea bien en el canvas

const colores = ['#ffe066', '#f25f5c', '#247ba0', '#70c1b3', '#b2dbbf', '#ffb4a2', '#b5838d', '#6d6875'];
const colorEpiciclo = '#bbb'; // Gris tenue para los círculos auxiliares

function dibujarCuadricula(ctx, ancho, alto, paso = 60) {
  ctx.save();
  ctx.strokeStyle = '#fff1';
  ctx.lineWidth = 0.5;
  for (let x = paso; x < ancho / 2; x += paso) {
    ctx.beginPath();
    ctx.moveTo(x, -alto / 2);
    ctx.lineTo(x, alto / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-x, -alto / 2);
    ctx.lineTo(-x, alto / 2);
    ctx.stroke();
  }
  for (let y = paso; y < alto / 2; y += paso) {
    ctx.beginPath();
    ctx.moveTo(-ancho / 2, y);
    ctx.lineTo(ancho / 2, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-ancho / 2, -y);
    ctx.lineTo(ancho / 2, -y);
    ctx.stroke();
  }
  ctx.restore();
}

const Canvas = ({ tipoFigura, lados, velocidad, numFrecuencias, pausado }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const pathRef = useRef([]); // Guarda el trazo de la figura
  const tRef = useRef(0); // Progreso de la animación
  const fourierRef = useRef([]); // Coeficientes de Fourier
  const puntosRef = useRef([]); // Puntos originales

  // Recalcular puntos y DFT cuando cambian los parámetros
  useEffect(() => {
    const puntos = generarPuntosFigura(tipoFigura, NUM_PUNTOS, lados);
    puntosRef.current = puntos;
    const fourier = DFT(puntos).slice(0, numFrecuencias);
    fourierRef.current = fourier;
    pathRef.current = [];
    tRef.current = 0;
  }, [tipoFigura, lados, numFrecuencias]);

  // Animación principal
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const ancho = canvas.width;
    const alto = canvas.height;

    function drawFrame() {
      // Limpiar
      ctx.clearRect(0, 0, ancho, alto);
      ctx.save();
      ctx.translate(ancho / 2, alto / 2);
      // Cuadrícula y ejes
      dibujarCuadricula(ctx, ancho, alto);
      // Ejes más marcados
      ctx.save();
      ctx.strokeStyle = '#fff8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 6;
      // Eje X
      ctx.beginPath();
      ctx.moveTo(-ancho / 2, 0);
      ctx.lineTo(ancho / 2, 0);
      ctx.stroke();
      // Eje Y
      ctx.beginPath();
      ctx.moveTo(0, -alto / 2);
      ctx.lineTo(0, alto / 2);
      ctx.stroke();
      ctx.restore();

      // Vectores giratorios (epiciclos)
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
        // Dibuja el círculo auxiliar (epiciclo) en gris tenue
        ctx.save();
        ctx.strokeStyle = colorEpiciclo;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = colorEpiciclo + '6';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(prevX, prevY, amp, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
        // Dibuja el vector
        ctx.save();
        ctx.strokeStyle = colores[i % colores.length];
        ctx.lineWidth = 2.2;
        ctx.shadowColor = colores[i % colores.length] + '8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
      });

      // Dibuja la punta y el trazo
      pathRef.current.push({ x, y });
      // Trazo de la figura
      ctx.save();
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 4.5;
      ctx.shadowColor = '#ffe066';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      for (let i = 0; i < pathRef.current.length; i++) {
        const p = pathRef.current[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.restore();
      // Punto actual
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#ffe066';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();

      // Mostrar t y f(t)
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
      ctx.font = '20px serif';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 6;
      ctx.fillText(`t = ${(t).toFixed(2)}`, 40, alto - 60);
      ctx.fillText(`f(t) = ${x.toFixed(2)} ${y >= 0 ? '+' : '-'} ${Math.abs(y).toFixed(2)}i`, 40, alto - 30);
      ctx.restore();

      ctx.restore();

      // Avanzar t
      if (!pausado) {
        tRef.current += (velocidad / NUM_PUNTOS);
        if (tRef.current >= 1) {
          tRef.current = 1;
        } else {
          requestRef.current = requestAnimationFrame(drawFrame);
        }
      }
    }

    // Iniciar animación
    if (!pausado) {
      requestRef.current = requestAnimationFrame(drawFrame);
    } else {
      // Si está pausado, renderiza el frame actual
      drawFrame();
    }
    // Cleanup
    return () => cancelAnimationFrame(requestRef.current);
  }, [velocidad, pausado, tipoFigura, lados, numFrecuencias]);

  // Reiniciar animación si se reinicia
  useEffect(() => {
    if (!pausado) {
      tRef.current = 0;
      pathRef.current = [];
    }
  }, [pausado, tipoFigura, lados, numFrecuencias]);

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
      <canvas
        ref={canvasRef}
        width={700}
        height={600}
        style={{ background: '#111', border: '1px solid #222', borderRadius: 12, boxShadow: '0 4px 32px #000a' }}
      />
    </div>
  );
};

export default Canvas;
