'use client';

import React, { useState } from 'react';
import { Affirmation } from '@/types';
import { useAppStore } from '@/store';
import {
  Pin,
  Flame,
  Trash2,
  Edit3,
  Equal,
  MoreHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IOS_TAP_SPRING, IOS_LAYOUT_SPRING } from '@/lib/iosSprings';

interface ManifestationCardProps {
  affirmation: Affirmation;
  isPinnedMode?: boolean;
  isDragging?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onDragHandlePointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onEdit?: (aff: Affirmation) => void;
  onDeleteRequest?: (aff: Affirmation) => void;
}

export const ManifestationCard: React.FC<ManifestationCardProps> = ({
  affirmation,
  isPinnedMode = false,
  isDragging = false,
  onDragHandlePointerDown,
  onEdit,
  onDeleteRequest,
}) => {
  const {
    incrementAffirmationRepeat,
    togglePinAffirmation,
    deleteAffirmation,
    setPendingDeleteAffirmation,
    openAffirmationEditor,
  } = useAppStore();

  const [showMenu, setShowMenu] = useState(false);
  const [pulseCharge, setPulseCharge] = useState(false);
  const [floatingParticles, setFloatingParticles] = useState<{ id: number }[]>([]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    // Apertura inmediata del Drawer con el menú cerrado
    if (onEdit) {
      onEdit(affirmation);
    } else {
      openAffirmationEditor(affirmation);
    }
  };

  const handleRepeat = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPulseCharge(true);
    setTimeout(() => setPulseCharge(false), 450);

    const newId = Date.now() + Math.random();
    setFloatingParticles((prev) => [...prev.slice(-2), { id: newId }]);
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== newId));
    }, 650);

    incrementAffirmationRepeat(affirmation.id);
  };

  const handleMenuRepeat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    handleRepeat();
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    togglePinAffirmation(affirmation.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDeleteRequest) {
      onDeleteRequest(affirmation);
    } else {
      setPendingDeleteAffirmation(affirmation);
    }
  };

  return (
    <motion.div
      layout="position"
      transition={IOS_LAYOUT_SPRING}
      whileTap={{ scale: 0.992 }}
      onClick={() => handleRepeat()}
      data-testid={`manifestation-card-${affirmation.id}`}
      className={`group relative w-full p-3.5 sm:p-5 rounded-xl sm:rounded-3xl cursor-pointer select-none ${
        showMenu ? 'z-30' : 'z-0'
      } ${
        isDragging
          ? 'glass-card-interactive shadow-lens ring-2 ring-manifest-brass scale-[1.02]'
          : 'glass-card-interactive shadow-glass hover:shadow-glass-hover'
      }`}
    >
      {/* Corner Tarot Accents */}
      <span aria-hidden="true" className="absolute top-2 left-2.5 text-[9px] sm:text-[10px] text-manifest-brass/35 select-none pointer-events-none group-hover:text-manifest-brass transition-colors">✦</span>
      <span aria-hidden="true" className="absolute top-2 right-2.5 text-[9px] sm:text-[10px] text-manifest-brass/35 select-none pointer-events-none group-hover:text-manifest-brass transition-colors">✦</span>

      {/* Energy pulse on tap */}
      <AnimatePresence>
        {pulseCharge && (
          <motion.div
            initial={{ opacity: 0.5, scale: 0.95 }}
            animate={{ opacity: 0, scale: 1.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-0 bg-gradient-to-r from-manifest-auraPurple/20 via-manifest-brass/25 to-manifest-auraPurple/20 pointer-events-none rounded-2xl sm:rounded-3xl"
          />
        )}
      </AnimatePresence>

      {/* Card Header Bar */}
      <div className={`flex items-center justify-between gap-1.5 mb-1 sm:mb-2 relative ${showMenu ? 'z-30' : 'z-10'}`}>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isPinnedMode && (
            <button
              type="button"
              data-testid={`drag-handle-${affirmation.id}`}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (onDragHandlePointerDown) onDragHandlePointerDown(e);
              }}
              title="Arrastrar para reordenar"
              className="touch-none cursor-grab active:cursor-grabbing p-0.5 sm:p-1 -ml-1 rounded-lg text-manifest-inkMuted/60 hover:text-manifest-ink transition-colors flex items-center justify-center shrink-0 focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
            >
              <Equal className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2]" />
            </button>
          )}

          {affirmation.pinned && (
            <span className="text-[10px] text-manifest-brass" title="Fijado en el altar">
              <Pin className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-manifest-brass stroke-none" />
            </span>
          )}
        </div>

        {/* Right Actions: Tactile Flame Pill & Discrete Menu */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Flame Counter Button with Number Pop-in & Floating +1 */}
          <div className="relative">
            <motion.button
              type="button"
              whileTap={IOS_TAP_SPRING}
              onClick={handleRepeat}
              data-testid={`affirmation-repeat-btn-${affirmation.id}`}
              title="Tocar para elevar la vibración del decreto"
              className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-manifest-glassBorder bg-manifest-glassControl hover:bg-manifest-glassControlHover text-manifest-ink shadow-xs cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
            >
              <motion.div
                animate={{
                  scale: pulseCharge ? [1, 1.25, 1] : 1,
                  rotate: pulseCharge ? [-6, 6, 0] : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                <Flame
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors ${
                    affirmation.repeatCount > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-500'
                  }`}
                />
              </motion.div>

              {/* Number Pop-in */}
              <div className="relative overflow-hidden h-4 flex items-center justify-center min-w-[12px]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={affirmation.repeatCount || 0}
                    initial={{ y: 8, opacity: 0, filter: 'blur(2px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: -8, opacity: 0, filter: 'blur(2px)' }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    className="text-[11px] sm:text-xs font-bold font-sans tabular-nums text-manifest-ink block"
                  >
                    {affirmation.repeatCount || 0}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.button>

            {/* Floating +1 ascending particle */}
            <AnimatePresence>
              {floatingParticles.map((particle) => (
                <motion.span
                  key={particle.id}
                  initial={{ opacity: 1, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -22, scale: 1.15 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -top-1 right-2 pointer-events-none text-[11px] font-extrabold text-amber-600 drop-shadow-xs select-none z-20"
                >
                  +1
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Quick Action Toggle Button (•••) - Origin-Aware Menu Dropdown */}
          <div className="relative">
            <motion.button
              type="button"
              data-testid={`affirmation-menu-btn-${affirmation.id}`}
              whileTap={{ scale: 0.93 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-manifest-inkMuted hover:text-manifest-ink bg-white/80 hover:bg-white border border-purple-200/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)] backdrop-blur-md transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
              title="Opciones del decreto"
            >
              <motion.div
                animate={{ rotate: showMenu ? 90 : 0, scale: showMenu ? 1.08 : 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              >
                <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
              </motion.div>
            </motion.button>

            {/* Dropdown Menu - Origin Aware Expansion */}
            <AnimatePresence>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  <motion.div
                    data-testid={`affirmation-dropdown-${affirmation.id}`}
                    initial={{ opacity: 0, y: -6, scale: 0.92, transformOrigin: 'top right' }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    className="absolute right-0 top-8 sm:top-9 z-50 min-w-[190px] p-1.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_14px_36px_rgba(30,20,50,0.18),0_4px_12px_rgba(0,0,0,0.06)] space-y-0.5 before:content-[''] before:absolute before:-top-1.5 before:right-2.5 before:w-3 before:h-3 before:bg-white/95 before:border-t before:border-l before:border-slate-200/90 before:rotate-45"
                  >
                    <button
                      type="button"
                      data-testid={`edit-affirmation-action-${affirmation.id}`}
                      onClick={handleEdit}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-800 hover:bg-slate-100 active:bg-slate-200/70 transition-all text-left cursor-pointer group"
                    >
                      <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Edit3 className="w-3.5 h-3.5" />
                      </span>
                      <span>Editar afirmación</span>
                    </button>

                    <button
                      type="button"
                      data-testid={`pin-affirmation-action-${affirmation.id}`}
                      onClick={handlePin}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-800 hover:bg-slate-100 active:bg-slate-200/70 transition-all text-left cursor-pointer group"
                    >
                      <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Pin className="w-3.5 h-3.5" />
                      </span>
                      <span>{affirmation.pinned ? 'Desfijar del altar' : 'Fijar en el altar'}</span>
                    </button>

                    <button
                      type="button"
                      data-testid={`repeat-affirmation-action-${affirmation.id}`}
                      onClick={handleMenuRepeat}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-800 hover:bg-slate-100 active:bg-slate-200/70 transition-all text-left cursor-pointer group"
                    >
                      <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Flame className="w-3.5 h-3.5" />
                      </span>
                      <span>Sumar repetición</span>
                    </button>

                    <div className="h-px bg-slate-100 my-1 mx-1.5" />

                    <button
                      type="button"
                      data-testid={`delete-affirmation-action-${affirmation.id}`}
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 active:bg-rose-100/60 transition-all text-left cursor-pointer group"
                    >
                      <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                      <span>Eliminar</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sacred Affirmation Text: Highly Legible Lora Regular */}
      <div className="relative z-0 py-0.5 sm:py-1">
        <p className="font-serif text-[13.5px] sm:text-[17px] text-manifest-ink leading-relaxed font-normal tracking-normal selection:bg-manifest-auraPurple/30">
          “{affirmation.text}”
        </p>
      </div>


    </motion.div>
  );
};
