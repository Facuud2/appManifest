'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Gift, Star, Award, RotateCw, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';

interface Segment {
  label: string;
  sub: string;
  color: string;
  textColor: string;
  fragments: number;
}

const SEGMENTS: Segment[] = [
  { label: '+20 Éter', sub: 'Fragmentos de Éter', color: '#4A2E5B', textColor: '#F4F0E8', fragments: 20 },
  { label: 'Sincronía', sub: 'Alineación Oculta', color: '#272033', textColor: '#F4F0E8', fragments: 15 },
  { label: '+35 Éter', sub: 'Luz Estelar', color: '#684524', textColor: '#F4F0E8', fragments: 35 },
  { label: 'Decreto Dorado', sub: 'Poder Manifestador', color: '#7A5B2E', textColor: '#F4F0E8', fragments: 25 },
  { label: '+50 Éter', sub: 'Gracia Divina', color: '#2B4235', textColor: '#F4F0E8', fragments: 50 },
  { label: 'Paz Serena', sub: 'Mente Clara', color: '#283644', textColor: '#F4F0E8', fragments: 10 },
  { label: 'Destello', sub: 'Iluminación', color: '#572E44', textColor: '#F4F0E8', fragments: 30 },
  { label: '+100 Éter', sub: 'Jackpot Cósmico', color: '#5C316B', textColor: '#F4F0E8', fragments: 100 },
];

export const CosmicOracleWheel: React.FC = () => {
  const { isOracleOpen, closeOracle, etherFragments, addEtherFragments, showToast } = useAppStore();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonSegment, setWonSegment] = useState<Segment | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOracleOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeOracle();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOracleOpen, closeOracle]);

  // Draw the 60fps Oracle Roulette on Canvas
  useEffect(() => {
    if (!isOracleOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 10;
    const numSegments = SEGMENTS.length;
    const arc = (2 * Math.PI) / numSegments;

    ctx.clearRect(0, 0, width, height);

    // Draw Outer Iridescent Ring
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#5C316B');
    grad.addColorStop(0.33, '#7A5B2E');
    grad.addColorStop(0.66, '#2B4235');
    grad.addColorStop(1, '#4A2E5B');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw Segments
    SEGMENTS.forEach((seg, i) => {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = seg.color;
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      // Border between segments
      ctx.strokeStyle = 'rgba(216, 190, 240, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text inside segment
      ctx.save();
      ctx.fillStyle = seg.textColor;
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.font = '600 11px system-ui, sans-serif';
      ctx.fillText(seg.label, radius - 20, 4);
      ctx.restore();
    });

    // Center Mystic Hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#1A1524';
    ctx.shadowColor = 'rgba(183, 134, 209, 0.5)';
    ctx.shadowBlur = 12;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 16, 0, 2 * Math.PI);
    ctx.fillStyle = '#7A5B2E';
    ctx.fill();
  }, [isOracleOpen]);

  if (!isOracleOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonSegment(null);

    // Calculate random winning segment (0 to 7)
    const winningIndex = Math.floor(Math.random() * SEGMENTS.length);
    const numSegments = SEGMENTS.length;
    const degreesPerSegment = 360 / numSegments;

    // Extra spins (5 to 8 full rotations = 1800 to 2880 deg)
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 3));
    // The pointer is at the top (270 deg / -90 deg). We align winningIndex to it:
    const targetDegree = extraSpins + (360 - (winningIndex * degreesPerSegment + degreesPerSegment / 2) - 90);

    const newRotation = rotation + targetDegree;
    setRotation(newRotation);

    // Reveal after deceleration finishes (3.6s)
    setTimeout(() => {
      const prize = SEGMENTS[winningIndex];
      setWonSegment(prize);
      setIsSpinning(false);
      addEtherFragments(prize.fragments);
      showToast(`¡Has obtenido ${prize.label}! (${prize.sub})`, 'celebrate');
    }, 3800);
  };

  return (
    <AnimatePresence>
      <div
        onClick={closeOracle}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-md"
        data-testid="cosmic-oracle-modal"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="w-full max-w-sm rounded-3xl liquid-glass-surface bg-manifest-surfaceElevated p-6 border border-manifest-glassBorder shadow-lens text-center space-y-4 relative overflow-hidden"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between pb-2 border-b border-manifest-glassBorder">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-manifest-glassControl border border-manifest-glassBorder flex items-center justify-center shadow-xs">
                <Compass className="w-4 h-4 text-manifest-auraPurple" />
              </div>
              <div className="text-left">
                <h3 className="font-serif text-sm font-bold text-manifest-ink">
                  Oráculo de Sincronías
                </h3>
                <span className="text-[10px] text-manifest-inkMuted flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  {etherFragments} Fragmentos de Éter
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={closeOracle}
              data-testid="close-oracle-btn"
              className="p-1.5 rounded-full hover:bg-manifest-glassControlHover text-manifest-inkMuted hover:text-manifest-ink transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-manifest-inkMuted">
            Haz girar el oráculo para anclar recompensas cósmicas y potenciar tu frecuencia creadora.
          </p>

          {/* Wheel Container with Pointer */}
          <div className="relative w-64 h-64 mx-auto my-2 flex items-center justify-center">
            {/* Top Pointer Needle */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-md">
              <div className="w-5 h-7 bg-gradient-to-b from-manifest-ink to-manifest-auraPurple clip-polygon shadow-md" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
            </div>

            {/* Rotating Canvas Wheel with 60fps GPU Acceleration */}
            <div
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 3.8s cubic-bezier(0.15, 0.95, 0.2, 1)' : 'none',
              }}
              className="w-full h-full flex items-center justify-center select-none"
            >
              <canvas
                ref={canvasRef}
                width={256}
                height={256}
                className="w-full h-full rounded-full"
              />
            </div>
          </div>

          {/* Won Segment Announcement */}
          <AnimatePresence>
            {wonSegment && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-2xl bg-manifest-glassControl border border-manifest-glassBorder text-manifest-ink space-y-0.5 shadow-sm"
              >
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-manifest-auraPurple">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>¡{wonSegment.label}!</span>
                </div>
                <p className="text-[11px] text-manifest-inkMuted">
                  {wonSegment.sub} (+{wonSegment.fragments} Éter anclados)
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spin CTA Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning}
              data-testid="spin-oracle-btn"
              className="w-full py-3 px-5 rounded-2xl primary-gradient-btn text-xs font-bold shadow-glass hover:shadow-lg disabled:opacity-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-manifest-glassBorderFocus"
            >
              <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Consultando el cosmos...' : 'Girar el Oráculo'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
