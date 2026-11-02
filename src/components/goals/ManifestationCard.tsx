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
import { IOS_TAP_SPRING } from '@/lib/iosSprings';

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
    openAffirmationEditor,
  } = useAppStore();

  const [showMenu, setShowMenu] = useState(false);
  const [pulseCharge, setPulseCharge] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
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
    incrementAffirmationRepeat(affirmation.id);
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
      deleteAffirmation(affirmation.id);
    }
  };

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.992 }}
      onClick={() => handleRepeat()}
      data-testid={`manifestation-card-${affirmation.id}`}
      className={`group relative w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl cursor-pointer select-none transition-all duration-200 overflow-hidden ${
        isDragging
          ? 'glass-card-interactive shadow-lens ring-2 ring-manifest-brass scale-[1.02]'
          : 'glass-card-interactive shadow-glass hover:shadow-glass-hover'
      }`}
    >
      {/* Corner Tarot Accents */}
      <span aria-hidden="true" className="absolute top-2.5 left-3 text-[10px] text-manifest-brass/35 select-none pointer-events-none group-hover:text-manifest-brass transition-colors">✦</span>
      <span aria-hidden="true" className="absolute top-2.5 right-3 text-[10px] text-manifest-brass/35 select-none pointer-events-none group-hover:text-manifest-brass transition-colors">✦</span>

      {/* Energy pulse on tap */}
      <AnimatePresence>
        {pulseCharge && (
          <motion.div
            initial={{ opacity: 0.5, scale: 0.95 }}
            animate={{ opacity: 0, scale: 1.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-0 bg-gradient-to-r from-manifest-auraPurple/20 via-manifest-brass/25 to-manifest-auraPurple/20 pointer-events-none rounded-3xl"
          />
        )}
      </AnimatePresence>

      {/* Card Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
        <div className="flex items-center gap-2">
          {isPinnedMode && (
            <button
              type="button"
              data-testid={`drag-handle-${affirmation.id}`}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (onDragHandlePointerDown) onDragHandlePointerDown(e);
              }}
              title="Arrastrar para reordenar"
              className="touch-none cursor-grab active:cursor-grabbing p-1 -ml-1 rounded-lg text-manifest-inkMuted/60 hover:text-manifest-ink transition-colors flex items-center justify-center shrink-0 focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
            >
              <Equal className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          )}

          {affirmation.userId === 'shared' ? (
            <span className="vintage-label-tape-dark text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
              <span className="text-manifest-brass">✦</span>
              <span>JUNTOS</span>
            </span>
          ) : (
            <span className="vintage-label-tape-dark text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
              <span className="text-manifest-brass">{affirmation.userId === 'facu' ? '☾' : '✧'}</span>
              <span>{(affirmation.author || (affirmation.userId === 'facu' ? 'Facu' : 'Maia')).toUpperCase()}</span>
            </span>
          )}

          {affirmation.pinned && (
            <span className="text-[10px] text-manifest-brass" title="Fijado en el altar">
              <Pin className="w-3 h-3 fill-manifest-brass stroke-none" />
            </span>
          )}
        </div>

        {/* Right Actions: Tactile Flame Pill & Discrete Menu */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Flame Counter Button */}
          <motion.button
            type="button"
            whileTap={IOS_TAP_SPRING}
            onClick={handleRepeat}
            data-testid={`affirmation-repeat-btn-${affirmation.id}`}
            title="Tocar para elevar la vibración del decreto"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-manifest-glassBorder bg-manifest-glassControl hover:bg-manifest-glassControlHover text-manifest-ink shadow-xs cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
          >
            <Flame
              className={`w-3.5 h-3.5 transition-colors ${
                affirmation.repeatCount > 0 ? 'text-amber-400 fill-amber-400' : 'text-manifest-inkMuted'
              }`}
            />
            <span className="text-xs font-bold font-sans tabular-nums text-manifest-ink">
              {affirmation.repeatCount || 0}
            </span>
          </motion.button>

          {/* Quick Action Toggle Button (•••) */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-manifest-inkMuted hover:text-manifest-ink hover:bg-manifest-glassControlHover transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
              title="Opciones del decreto"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 4 }}
                  className="absolute right-0 top-8 z-30 min-w-[140px] p-1.5 rounded-2xl glass-card border border-manifest-glassBorder shadow-lens space-y-0.5"
                >
                  <button
                    type="button"
                    onClick={handlePin}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-manifest-ink hover:bg-manifest-glassControlHover transition-colors text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
                  >
                    <Pin className="w-3.5 h-3.5 text-manifest-brass" />
                    <span>{affirmation.pinned ? 'Desfijar' : 'Fijar en Altar'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEdit}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-manifest-ink hover:bg-manifest-glassControlHover transition-colors text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-manifest-auraPurple focus-visible:outline-none"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-manifest-auraPurple" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-100/80 transition-colors text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Eliminar</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sacred Affirmation Text: Highly Legible Lora Regular */}
      <div className="relative z-10 py-1">
        <p className="font-serif text-[16px] sm:text-[18px] text-manifest-ink leading-relaxed font-normal tracking-normal selection:bg-manifest-auraPurple/30">
          “{affirmation.text}”
        </p>
      </div>

      {/* Subtle Hint on Footer */}
      <div className="pt-1.5 flex items-center justify-between text-[11px] text-manifest-inkMuted font-sans">
        <span className="font-medium">Toca en cualquier parte para sumar repetición</span>
        <span className="text-manifest-brass/50 group-hover:text-manifest-brass transition-colors">✦</span>
      </div>
    </motion.div>
  );
};
