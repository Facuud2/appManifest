'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Affirmation } from '@/types';
import { ManifestationCard } from './ManifestationCard';

interface PinnedAffirmationsListProps {
  pinnedAffirmations: Affirmation[];
  onReorder: (reordered: Affirmation[]) => void;
  onDeleteRequest?: (aff: Affirmation) => void;
}

export const PinnedAffirmationsList: React.FC<PinnedAffirmationsListProps> = ({
  pinnedAffirmations,
  onReorder,
  onDeleteRequest,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState<number>(0);

  const dragSessionRef = useRef<{
    id: string;
    pointerOffsetInCard: number;
    currentOffsetY: number;
    order: Affirmation[];
    cleanup: () => void;
  } | null>(null);

  // Keep latest props in refs for active drag session
  const latestPinnedRef = useRef(pinnedAffirmations);
  latestPinnedRef.current = pinnedAffirmations;
  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  useEffect(() => {
    return () => {
      if (dragSessionRef.current) {
        dragSessionRef.current.cleanup();
        dragSessionRef.current = null;
      }
    };
  }, []);

  const handleDragStart = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, affirmationId: string) => {
      e.preventDefault();
      e.stopPropagation();

      const containerEl = containerRef.current;
      const itemEl = itemRefs.current[affirmationId];
      if (!containerEl || !itemEl) return;

      if (dragSessionRef.current) {
        dragSessionRef.current.cleanup();
      }

      const itemRect = itemEl.getBoundingClientRect();
      const pointerOffsetInCard = e.clientY - itemRect.top;

      setDraggedId(affirmationId);
      setDragOffsetY(0);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const session = dragSessionRef.current;
        const currContainer = containerRef.current;
        const currItemEl = itemRefs.current[affirmationId];
        if (!session || !currContainer || !currItemEl) return;

        const containerRect = currContainer.getBoundingClientRect();
        const currItemRect = currItemEl.getBoundingClientRect();
        const height = currItemRect.height;

        // Untransformed layout top of this item in viewport coordinates
        const baseTop = currItemRect.top - session.currentOffsetY;

        // Desired visual top following pointer, strictly clamped to container bounds
        const desiredVisualTop = moveEvent.clientY - session.pointerOffsetInCard;
        const maxVisualTop = Math.max(containerRect.top, containerRect.bottom - height);
        const clampedVisualTop = Math.max(
          containerRect.top,
          Math.min(maxVisualTop, desiredVisualTop)
        );

        const visualCenterY = clampedVisualTop + height / 2;

        // Check if we crossed a neighbor's midpoint to swap order
        const currentOrder = [...session.order];
        const draggedIdx = currentOrder.findIndex((a) => a.id === affirmationId);

        if (draggedIdx !== -1) {
          let swapIdx = -1;

          if (draggedIdx > 0) {
            const prevId = currentOrder[draggedIdx - 1].id;
            const prevEl = itemRefs.current[prevId];
            if (prevEl) {
              const prevRect = prevEl.getBoundingClientRect();
              const prevCenterY = prevRect.top + prevRect.height / 2;
              if (visualCenterY < prevCenterY) {
                swapIdx = draggedIdx - 1;
              }
            }
          }

          if (swapIdx === -1 && draggedIdx < currentOrder.length - 1) {
            const nextId = currentOrder[draggedIdx + 1].id;
            const nextEl = itemRefs.current[nextId];
            if (nextEl) {
              const nextRect = nextEl.getBoundingClientRect();
              const nextCenterY = nextRect.top + nextRect.height / 2;
              if (visualCenterY > nextCenterY) {
                swapIdx = draggedIdx + 1;
              }
            }
          }

          if (swapIdx !== -1) {
            const temp = currentOrder[draggedIdx];
            currentOrder[draggedIdx] = currentOrder[swapIdx];
            currentOrder[swapIdx] = temp;
            session.order = currentOrder;
            onReorderRef.current(currentOrder);
          }
        }

        // Re-measure after potential synchronous DOM update or compute offset from baseTop
        const updatedItemRect = currItemEl.getBoundingClientRect();
        const updatedBaseTop = updatedItemRect.top - session.currentOffsetY;
        const nextOffsetY = clampedVisualTop - updatedBaseTop;

        session.currentOffsetY = nextOffsetY;
        setDragOffsetY(nextOffsetY);
      };

      const handlePointerEnd = () => {
        if (dragSessionRef.current) {
          dragSessionRef.current.cleanup();
          dragSessionRef.current = null;
        }
        setDraggedId(null);
        setDragOffsetY(0);
      };

      window.addEventListener('pointermove', handlePointerMove, { passive: false });
      window.addEventListener('pointerup', handlePointerEnd);
      window.addEventListener('pointercancel', handlePointerEnd);

      dragSessionRef.current = {
        id: affirmationId,
        pointerOffsetInCard,
        currentOffsetY: 0,
        order: [...latestPinnedRef.current],
        cleanup: () => {
          window.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('pointerup', handlePointerEnd);
          window.removeEventListener('pointercancel', handlePointerEnd);
        },
      };
    },
    []
  );

  return (
    <div
      ref={containerRef}
      data-testid="pinned-affirmations-container"
      className="relative w-full rounded-3xl"
    >
      <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
        {pinnedAffirmations.map((aff) => {
          const isDragging = draggedId === aff.id;
          return (
            <li
              key={aff.id}
              ref={(el) => {
                itemRefs.current[aff.id] = el as unknown as HTMLDivElement | null;
              }}
              style={
                isDragging
                  ? {
                      transform: `translate3d(0px, ${dragOffsetY}px, 0px)`,
                      zIndex: 30,
                      position: 'relative',
                    }
                  : undefined
              }
              className={`w-full relative select-none list-none ${
                isDragging ? 'shadow-lg' : ''
              }`}
            >
              <ManifestationCard
                affirmation={aff}
                isPinnedMode={true}
                onDragHandlePointerDown={(e) => handleDragStart(e, aff.id)}
                onDeleteRequest={onDeleteRequest}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};
