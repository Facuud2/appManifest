'use client';

import React from 'react';
import { Affirmation } from '@/types';
import { useAppStore } from '@/store';
import {
  Pin,
  Flame,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, Reorder, useDragControls } from 'framer-motion';

interface ManifestationCardProps {
  affirmation: Affirmation;
  isPinnedMode?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onEdit?: (aff: Affirmation) => void;
  onDeleteRequest?: (aff: Affirmation) => void;
}

export const ManifestationCard: React.FC<ManifestationCardProps> = ({
  affirmation,
  isPinnedMode = false,
  containerRef,
  onEdit,
  onDeleteRequest,
}) => {
  const {
    incrementAffirmationRepeat,
    togglePinAffirmation,
    deleteAffirmation,
    openAffirmationEditor,
  } = useAppStore();

  const dragControls = useDragControls();
  const formattedDate = affirmation.createdAt
    ? format(new Date(affirmation.createdAt), "d 'de' MMMM", { locale: es })
    : '';

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(affirmation);
    } else {
      openAffirmationEditor(affirmation);
    }
  };

  const handleRepeat = (e: React.MouseEvent) => {
    e.stopPropagation();
    incrementAffirmationRepeat(affirmation.id);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePinAffirmation(affirmation.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteRequest) {
      onDeleteRequest(affirmation);
    } else {
      deleteAffirmation(affirmation.id);
    }
  };

  const cardContent = (
    <div
      onClick={handleRepeat}
      className="p-4 sm:p-4.5 rounded-3xl glass-card-interactive border border-white/95 shadow-sm space-y-2.5 transition-all select-none cursor-pointer hover:shadow-md"
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isPinnedMode && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                dragControls.start(e);
              }}
              title="Arrastrar para reordenar prioridad"
              className="touch-none cursor-grab active:cursor-grabbing p-1.5 -ml-1 rounded-xl hover:bg-white/90 text-manifest-inkMuted hover:text-manifest-ink transition-colors flex items-center justify-center shrink-0"
            >
              {/* iOS style two horizontal lines (=) handle */}
              <div className="flex flex-col gap-[3px] items-center justify-center w-4 py-0.5">
                <div className="w-3.5 h-[2px] bg-manifest-ink/70 rounded-full" />
                <div className="w-3.5 h-[2px] bg-manifest-ink/70 rounded-full" />
              </div>
            </button>
          )}

          {affirmation.userId === 'shared' ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-manifest-pink/60 to-manifest-celeste/60 text-manifest-ink border border-white">
              ✨ Juntos
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/80 text-manifest-inkMuted">
              {affirmation.author || (affirmation.userId === 'facu' ? 'Facu' : 'Maia')}
            </span>
          )}

          {formattedDate && (
            <span className="text-[10px] text-manifest-inkMuted flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Pin Button */}
          <button
            type="button"
            onClick={handlePin}
            title={affirmation.pinned ? 'Desfijar manifestación' : 'Fijar manifestación'}
            className={`p-1.5 rounded-full transition-all ${
              affirmation.pinned
                ? 'bg-manifest-lavender text-manifest-auraPurple shadow-sm ring-1 ring-manifest-auraPurple/30'
                : 'hover:bg-white/80 text-manifest-inkMuted hover:text-manifest-ink'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${affirmation.pinned ? 'fill-manifest-auraPurple rotate-45' : ''}`} />
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={handleEdit}
            title="Editar manifestación"
            className="p-1.5 rounded-full hover:bg-white/80 text-manifest-inkMuted hover:text-manifest-ink transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Repeat Counter Button */}
          <button
            type="button"
            onClick={handleRepeat}
            title="Repeticiones"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-white/90 hover:bg-white text-manifest-ink border border-white shadow-sm transition-all"
          >
            <Flame
              className={`w-3.5 h-3.5 transition-colors ${
                affirmation.repeatCount > 0 ? 'text-amber-500 fill-amber-400' : 'text-manifest-inkMuted'
              }`}
            />
            <span className="text-xs font-bold font-mono text-manifest-ink">
              {affirmation.repeatCount || 0}
            </span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            title="Eliminar manifestación"
            className="p-1.5 rounded-full hover:bg-white/80 text-manifest-inkMuted hover:text-rose-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Affirmation Text */}
      <p className="text-sm sm:text-base font-semibold text-manifest-ink leading-relaxed">
        {affirmation.text}
      </p>
    </div>
  );

  if (isPinnedMode && containerRef) {
    return (
      <Reorder.Item
        value={affirmation}
        id={affirmation.id}
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={containerRef}
        dragElastic={0.02}
        layout
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{
          opacity: 0,
          scale: 0.96,
          filter: 'blur(3px)',
          transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="w-full relative touch-none select-none list-none"
      >
        {cardContent}
      </Reorder.Item>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.96,
        filter: 'blur(3px)',
        transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
      }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="w-full list-none"
    >
      {cardContent}
    </motion.div>
  );
};
