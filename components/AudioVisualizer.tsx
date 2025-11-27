import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ stream, isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (!stream || !canvasRef.current || !isRecording) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioCtx = audioContextRef.current;

    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    analyserRef.current = audioCtx.createAnalyser();
    analyserRef.current.fftSize = 256;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    sourceRef.current = audioCtx.createMediaStreamSource(stream);
    sourceRef.current.connect(analyserRef.current);

    const draw = () => {
      if (!isRecording) return;
      
      const width = canvas.width;
      const height = canvas.height;

      animationRef.current = requestAnimationFrame(draw);
      if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
      }

      // Clear canvas
      ctx.fillStyle = '#f9fafb'; // Light gray background
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Frequency Bars (Spectrum)
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2.5; // Scale down slightly

        // Gradient color based on height
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#e0e7ff'); // Light indigo
        gradient.addColorStop(1, '#818cf8'); // Indigo-400

        ctx.fillStyle = gradient;
        
        // Draw rounded bars
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, height - 10 - barHeight, barWidth, barHeight, 2); // Lift up by 10px for volume bar
        } else {
            ctx.rect(x, height - 10 - barHeight, barWidth, barHeight);
        }
        ctx.fill();

        x += barWidth + 1;
      }

      // 2. Calculate Average Volume (RMS)
      let sum = 0;
      for(let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const volumePercent = Math.min(average / 128, 1); // Normalize roughly 0-1

      // 3. Draw Volume Intensity Bar (Horizontal at bottom)
      const volumeBarHeight = 6;
      const volumeBarWidth = width * volumePercent;
      
      // Background track
      ctx.fillStyle = '#e5e7eb';
      if (ctx.roundRect) {
        ctx.roundRect(0, height - volumeBarHeight, width, volumeBarHeight, 3);
      } else {
        ctx.rect(0, height - volumeBarHeight, width, volumeBarHeight);
      }
      ctx.fill();

      // Active volume fill
      // Change color if clipping (too loud)
      ctx.fillStyle = volumePercent > 0.8 ? '#ef4444' : '#10b981'; // Red if loud, Green normal
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(0, height - volumeBarHeight, volumeBarWidth, volumeBarHeight, 3);
      } else {
        ctx.rect(0, height - volumeBarHeight, volumeBarWidth, volumeBarHeight);
      }
      ctx.fill();
    };

    draw();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
    };
  }, [stream, isRecording]);

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={120} 
      className="w-full h-32 rounded-xl border border-gray-100 bg-gray-50 shadow-inner"
    />
  );
};

export default AudioVisualizer;