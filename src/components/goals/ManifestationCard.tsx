'use client';

import React from 'react';
import { Affirmation } from '@/types';
import { useAppStore } from '@/store';
import {
  Pin,
  Flame,
  Trash2,
  Edit3,
  Equal,
} from 'lucide-react';
import { useTapVsScroll } from '@/hooks/useTapVsScroll';

interface ManifestationCardProps {
  affirmation: Affirmation;
  isPinnedMode?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onDragHandlePointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onEdit?: (aff: Affirmation) => void;
  onDeleteRequest?: (aff: Affirmation) => void;
}

export const ManifestationCard: React.FC<ManifestationCardProps> = ({
  affirmation,
  isPinnedMode = false,
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

  const cardTapHandlers = useTapVsScroll({
    onTap: () => incrementAffirmationRepeat(affirmation.id),
  });

  return (
    <div
      data-testid={`manifestation-card-${affirmation.id}`}
      {...cardTapHandlers}
      className="w-full p-4 sm:p-4.5 rounded-3xl glass-card-interactive border border-white/95 shadow-sm space-y-2.5 select-none cursor-pointer hover:shadow-md touch-pan-y"
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isPinnedMode && (
            <button
              type="button"
              data-testid={`drag-handle-${affirmation.id}`}
              onPointerDown={(e) => {
                if (onDragHandlePointerDown) {
                  onDragHandlePointerDown(e);
                }
              }}
              title="Arrastrar para reordenar prioridad"
              className="touch-none cursor-grab active:cursor-grabbing p-1 -ml-1 rounded-lg hover:bg-white/90 text-manifest-inkMuted/60 hover:text-manifest-ink transition-colors flex items-center justify-center shrink-0"
            >
              <Equal className="w-3.5 h-3.5 stroke-[2.4]" />
            </button>
          )}

          {affirmation.userId === 'shared' ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-manifest-pink/60 to-manifest-celeste/60 text-manifest-ink border border-white">
              ✨ Juntos
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/80 text-manifest-inkMuted border border-white/80">
              {affirmation.author || (affirmation.userId === 'facu' ? 'Facu' : 'Maia')}
            </span>
          )}
        </div>

        {/* Action Buttons - Unified h-7, rounded-xl and consistent baseline */}
        <div
          className="flex items-center gap-1 sm:gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Pin Button */}
          <button
            type="button"
            onClick={handlePin}
            title={affirmation.pinned ? 'Desfijar manifestación' : 'Fijar manifestación'}
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              affirmation.pinned
                ? 'bg-manifest-lavender/70 text-manifest-auraPurple border border-manifest-auraPurple/30 shadow-xs'
                : 'bg-white/70 hover:bg-white text-manifest-inkMuted hover:text-manifest-ink border border-white/80'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${affirmation.pinned ? 'fill-manifest-auraPurple' : ''}`} />
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={handleEdit}
            title="Editar manifestación"
            className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/70 hover:bg-white text-manifest-inkMuted hover:text-manifest-ink border border-white/80 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Repeat Counter Button */}
          <button
            type="button"
            onClick={handleRepeat}
            title="Repeticiones"
            className="h-7 flex items-center gap-1 px-2 rounded-xl bg-white/85 hover:bg-white text-manifest-ink border border-white/90 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Flame
              className={`w-3.5 h-3.5 transition-colors ${
                affirmation.repeatCount > 0 ? 'text-amber-500 fill-amber-400' : 'text-manifest-inkMuted'
              }`}
            />
            <span className="text-[11px] font-bold font-mono text-manifest-ink">
              {affirmation.repeatCount || 0}
            </span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            title="Eliminar manifestación"
            className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/70 hover:bg-rose-50 text-manifest-inkMuted hover:text-rose-500 border border-white/80 shadow-xs active:scale-95 transition-all cursor-pointer"
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
};
