'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { PremiumDeleteModal } from '@/components/ui/PremiumDeleteModal';

export const GlobalDeleteConfirmationModal: React.FC = () => {
  const {
    pendingDeleteAffirmation,
    setPendingDeleteAffirmation,
    deleteAffirmation,
    pendingDeleteJournalEntry,
    setPendingDeleteJournalEntry,
    deleteJournalEntry,
    showToast,
  } = useAppStore();

  return (
    <>
      {/* Pop-up de Confirmación: Eliminar Afirmación (Premium Popup Cancel) */}
      <PremiumDeleteModal
        isOpen={!!pendingDeleteAffirmation}
        title="¿Eliminar esta afirmación?"
        subtitle="Esta afirmación desaparecerá de tu altar personal y de tu conteo de repeticiones."
        pillNotice="Esta acción liberará este decreto de tu santuario"
        itemPreviewText={pendingDeleteAffirmation?.text}
        confirmLabel="Sí, eliminar"
        cancelLabel="Conservar"
        onCancel={() => setPendingDeleteAffirmation(null)}
        onConfirm={() => {
          if (pendingDeleteAffirmation) {
            deleteAffirmation(pendingDeleteAffirmation.id);
            setPendingDeleteAffirmation(null);
            showToast('Decreto liberado de tu santuario', 'info');
          }
        }}
      />

      {/* Pop-up de Confirmación: Eliminar Entrada de Diario / Grimorio (Premium Popup Cancel) */}
      <PremiumDeleteModal
        isOpen={!!pendingDeleteJournalEntry}
        title="¿Eliminar esta vivencia?"
        subtitle="Esta entrada será retirada de tu grimorio y no podrá ser recuperada."
        pillNotice="Esta acción liberará esta memoria de tu grimorio"
        itemPreviewTitle={pendingDeleteJournalEntry?.title}
        itemPreviewText={pendingDeleteJournalEntry?.content}
        confirmLabel="Sí, eliminar"
        cancelLabel="Conservar"
        onCancel={() => setPendingDeleteJournalEntry(null)}
        onConfirm={() => {
          if (pendingDeleteJournalEntry) {
            deleteJournalEntry(pendingDeleteJournalEntry.id);
            setPendingDeleteJournalEntry(null);
            showToast('Entrada retirada de tu diario', 'info');
          }
        }}
      />
    </>
  );
};
