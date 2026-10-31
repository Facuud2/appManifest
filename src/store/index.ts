import { create } from 'zustand';
import {
  JournalEntry,
  EntryType,
  Goal,
  GoalStep,
  AgendaEvent,
  ReleaseEntry,
  DailyReflection,
  UserSettings,
  Milestone,
  ManifestationSign,
  SuccessStory,
  FutureManifestation,
  Affirmation,
  RampageSet,
  UserScope,
} from '@/types';
import { storage } from '@/services/storage';
import { tursoSync } from '@/services/tursoSync';

export type AppTab = 'inicio' | 'agenda' | 'diario' | 'objetivos' | 'espacio';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'gentle' | 'celebrate';
  text: string;
}

// Helper to filter entities strictly based on scope
function filterByScope<T extends { userId: UserScope }>(
  items: T[],
  scope: UserScope,
  includeSharedInPersonal: boolean = false
): T[] {
  if (scope === 'shared') {
    return items.filter((item) => item.userId === 'shared');
  }
  if (includeSharedInPersonal) {
    return items.filter((item) => item.userId === scope || item.userId === 'shared');
  }
  return items.filter((item) => item.userId === scope);
}

function getAuthorForScope(scope: UserScope): string {
  switch (scope) {
    case 'facu':
      return 'Facu';
    case 'maia':
      return 'Maia';
    case 'shared':
      return 'Facu & Maia';
    default:
      return 'Facu';
  }
}

interface AppState {
  isInitialized: boolean;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Journal Editor direct trigger
  isJournalEditorOpen: boolean;
  journalEditorInitialMode?: EntryType;
  editingJournalEntry?: JournalEntry | null;
  openJournalEditor: (mode?: EntryType, entryToEdit?: JournalEntry | null) => void;
  closeJournalEditor: () => void;

  // Active User / Space Scope
  activeScope: UserScope;
  includeSharedInPersonal: boolean;
  setActiveScope: (scope: UserScope) => void;
  toggleIncludeSharedInPersonal: () => void;

  // Turso Real-Time Sync Status
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncFromRemote: () => Promise<void>;

  // Scoped Entity Lists (strictly filtered by activeScope)
  journalEntries: JournalEntry[];
  goals: Goal[];
  goalSteps: GoalStep[];
  agendaEvents: AgendaEvent[];
  releaseEntries: ReleaseEntry[];
  dailyReflections: DailyReflection[];
  manifestationSigns: ManifestationSign[];
  successStories: SuccessStory[];
  futureManifestations: FutureManifestation[];
  affirmations: Affirmation[];
  rampageSets: RampageSet[];
  settings: UserSettings;
  toasts: ToastMessage[];

  // Affirmation Editor Modal
  isAffirmationEditorOpen: boolean;
  editingAffirmation: Affirmation | null;
  openAffirmationEditor: (affirmationToEdit?: Affirmation | null) => void;
  closeAffirmationEditor: () => void;

  // Actions
  init: () => void;
  showToast: (text: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Affirmations
  saveAffirmation: (affirmation: Affirmation) => void;
  incrementAffirmationRepeat: (id: string) => void;
  togglePinAffirmation: (id: string) => void;
  reorderAffirmations: (ordered: Affirmation[]) => void;
  deleteAffirmation: (id: string) => void;

  // Rampage Sets
  saveRampageSet: (set: RampageSet) => void;
  deleteRampageSet: (id: string) => void;
  incrementRampageAffirmationRepeat: (setId: string, affirmationId: string) => void;

  // Journal
  saveJournalEntry: (entry: JournalEntry) => void;
  deleteJournalEntry: (id: string) => void;

  // Goals & Steps
  saveGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  saveGoalStep: (step: GoalStep) => void;
  toggleGoalStep: (id: string) => void;
  deleteGoalStep: (id: string) => void;

  // Signs & Synchronicities
  saveManifestationSign: (sign: ManifestationSign) => void;
  deleteManifestationSign: (id: string) => void;

  // Success Stories
  saveSuccessStory: (story: SuccessStory) => void;
  deleteSuccessStory: (id: string) => void;

  // Future Manifestations
  saveFutureManifestation: (future: FutureManifestation) => void;
  deleteFutureManifestation: (id: string) => void;

  // Agenda
  saveAgendaEvent: (event: AgendaEvent) => void;
  toggleAgendaEvent: (id: string) => void;
  deleteAgendaEvent: (id: string) => void;

  // Release
  saveReleaseEntry: (entry: ReleaseEntry) => void;
  destroyRelease: (id: string) => void;

  // Reflections
  saveDailyReflection: (reflection: DailyReflection) => void;

  // Settings
  updateSettings: (partial: Partial<UserSettings>) => void;
  restoreFromBackup: (json: string) => { success: boolean; message: string; error?: string };

  // Derived Helpers
  getGoalProgress: (goalId: string) => number;
  getAvailableMilestones: () => Milestone[];
}

export const useAppStore = create<AppState>((set, get) => {
  const initialSettings = storage.getUserSettings();
  const initialScope: UserScope = initialSettings.activeScope || 'facu';

  const computeScopedState = (scope: UserScope, includeShared: boolean = false) => {
    const rawRampage = storage.getRampageSets();
    const scopedRampage = filterByScope(rawRampage, scope, true);
    return {
      journalEntries: filterByScope(storage.getJournalEntries(), scope, includeShared),
      goals: filterByScope(storage.getGoals(), scope, includeShared),
      goalSteps: filterByScope(storage.getGoalSteps(), scope, includeShared),
      agendaEvents: filterByScope(storage.getAgendaEvents(), scope, includeShared),
      releaseEntries: filterByScope(storage.getReleaseEntries(), scope, includeShared),
      dailyReflections: filterByScope(storage.getDailyReflections(), scope, includeShared),
      manifestationSigns: filterByScope(storage.getManifestationSigns(), scope, includeShared),
      successStories: filterByScope(storage.getSuccessStories(), scope, includeShared),
      futureManifestations: filterByScope(storage.getFutureManifestations(), scope, includeShared),
      affirmations: filterByScope(storage.getAffirmations(), scope, includeShared),
      rampageSets: scopedRampage.length > 0 ? scopedRampage : rawRampage,
    };
  };

  return {
    isInitialized: false,
    activeTab: 'inicio',
    setActiveTab: (tab) => set({ activeTab: tab }),

    isJournalEditorOpen: false,
    journalEditorInitialMode: 'manifestation',
    editingJournalEntry: null,
    openJournalEditor: (mode = 'manifestation', entryToEdit = null) => {
      set({
        isJournalEditorOpen: true,
        journalEditorInitialMode: mode,
        editingJournalEntry: entryToEdit,
      });
    },
    closeJournalEditor: () => {
      set({ isJournalEditorOpen: false, editingJournalEntry: null });
    },

    isAffirmationEditorOpen: false,
    editingAffirmation: null,
    openAffirmationEditor: (aff = null) => {
      set({ isAffirmationEditorOpen: true, editingAffirmation: aff });
    },
    closeAffirmationEditor: () => {
      set({ isAffirmationEditorOpen: false, editingAffirmation: null });
    },

    activeScope: initialScope,
    includeSharedInPersonal: false,
    isSyncing: false,
    lastSyncTime: null,

    journalEntries: [],
    goals: [],
    goalSteps: [],
    agendaEvents: [],
    releaseEntries: [],
    dailyReflections: [],
    manifestationSigns: [],
    successStories: [],
    futureManifestations: [],
    affirmations: [],
    rampageSets: [],
    settings: initialSettings,
    toasts: [],

    init: () => {
      storage.initSeedDataIfNeeded();
      const settings = storage.getUserSettings();
      const scope = settings.activeScope || 'facu';

      // Check streak
      const today = new Date().toISOString().split('T')[0];
      if (settings.lastActiveDate && settings.lastActiveDate !== today) {
        const last = new Date(settings.lastActiveDate);
        const diffDays = Math.round((new Date(today).getTime() - last.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          const updated = storage.saveUserSettings({
            dailyStreak: settings.dailyStreak + 1,
            lastActiveDate: today,
          });
          set({ settings: updated });
        } else if (diffDays > 1) {
          const updated = storage.saveUserSettings({
            dailyStreak: 1,
            lastActiveDate: today,
          });
          set({ settings: updated });
        }
      } else if (!settings.lastActiveDate) {
        const updated = storage.saveUserSettings({ lastActiveDate: today });
        set({ settings: updated });
      }

      const scoped = computeScopedState(scope, false);

      set({
        ...scoped,
        activeScope: scope,
        settings: storage.getUserSettings(),
        isInitialized: true,
      });

      // Background remote sync from Turso on init
      get().syncFromRemote();

      // Listen for window focus & network reconnection to sync Turso in real time
      if (typeof window !== 'undefined') {
        const handleSyncTrigger = () => {
          get().syncFromRemote();
        };

        window.addEventListener('focus', handleSyncTrigger);
        window.addEventListener('online', handleSyncTrigger);

        window.addEventListener('manifest_data_changed', () => {
          const currentScope = get().activeScope;
          const incShared = get().includeSharedInPersonal;
          set({
            ...computeScopedState(currentScope, incShared),
            settings: storage.getUserSettings(),
          });
        });
      }
    },

    setActiveScope: (scope: UserScope) => {
      const currentUserName = scope === 'facu' ? 'Facu' : scope === 'maia' ? 'Maia' : 'Facu & Maia';
      const updatedSettings = storage.saveUserSettings({
        activeScope: scope,
        userName: currentUserName,
      });

      const incShared = get().includeSharedInPersonal;
      const scoped = computeScopedState(scope, incShared);

      set({
        activeScope: scope,
        settings: updatedSettings,
        ...scoped,
      });

      // Sync with Turso for this scope
      get().syncFromRemote();
    },

    toggleIncludeSharedInPersonal: () => {
      const nextState = !get().includeSharedInPersonal;
      set({ includeSharedInPersonal: nextState });
      const scoped = computeScopedState(get().activeScope, nextState);
      set(scoped);
    },

    syncFromRemote: async () => {
      if (get().isSyncing) return;
      set({ isSyncing: true });

      try {
        const remoteData = await tursoSync.fetchRemoteData();
        if (remoteData) {
          storage.mergeRemoteData(remoteData);
          const currentScope = get().activeScope;
          const incShared = get().includeSharedInPersonal;
          const scoped = computeScopedState(currentScope, incShared);
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          set({
            ...scoped,
            isSyncing: false,
            lastSyncTime: nowStr,
          });
        } else {
          set({ isSyncing: false });
        }
      } catch (err) {
        console.warn('Sync failed:', err);
        set({ isSyncing: false });
      }
    },

    showToast: (text, type = 'gentle') => {
      const id = Math.random().toString(36).substring(2, 9);
      set((state) => ({ toasts: [...state.toasts, { id, text, type }] }));
      setTimeout(() => {
        get().removeToast(id);
      }, 3600);
    },

    removeToast: (id) => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    },

    // Affirmations
    saveAffirmation: (affirmation) => {
      const scope = affirmation.userId || get().activeScope;
      const author = affirmation.author || getAuthorForScope(scope);
      const enriched: Affirmation = {
        ...affirmation,
        userId: scope,
        author,
        repeatCount: affirmation.repeatCount ?? 0,
        createdAt: affirmation.createdAt || new Date().toISOString(),
        pinned: affirmation.pinned ?? false,
        order: affirmation.order,
      };
      storage.saveAffirmation(enriched);
      const incShared = get().includeSharedInPersonal;
      set(computeScopedState(get().activeScope, incShared));
      tursoSync.pushChange({ entity: 'affirmation', action: 'save', data: enriched });
    },

    incrementAffirmationRepeat: (id) => {
      const updated = storage.incrementAffirmationRepeat(id);
      if (!updated) return;
      const incShared = get().includeSharedInPersonal;
      set(computeScopedState(get().activeScope, incShared));
      tursoSync.pushChange({ entity: 'affirmation', action: 'save', data: updated });
    },

    togglePinAffirmation: (id) => {
      const updated = storage.togglePinAffirmation(id);
      if (!updated) return;
      const incShared = get().includeSharedInPersonal;
      set(computeScopedState(get().activeScope, incShared));
      tursoSync.pushChange({ entity: 'affirmation', action: 'save', data: updated });
    },

    reorderAffirmations: (ordered) => {
      storage.reorderAffirmations(ordered);
      const incShared = get().includeSharedInPersonal;
      set(computeScopedState(get().activeScope, incShared));
    },

    deleteAffirmation: (id) => {
      storage.deleteAffirmation(id);
      const incShared = get().includeSharedInPersonal;
      set(computeScopedState(get().activeScope, incShared));
      tursoSync.pushChange({ entity: 'affirmation', action: 'delete', id });
    },

    // Rampage Sets
    saveRampageSet: (setObj) => {
      const scope = setObj.userId || get().activeScope;
      const author = setObj.author || getAuthorForScope(scope);
      const enriched: RampageSet = {
        ...setObj,
        userId: scope,
        author,
        createdAt: setObj.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.saveRampageSet(enriched);
      const incShared = get().includeSharedInPersonal;
      set(computeScopedState(get().activeScope, incShared));
    },

    deleteRampageSet: (id) => {
      storage.deleteRampageSet(id);
      const incShared = get().includeSharedInPersonal;
      set(computeScopedState(get().activeScope, incShared));
    },

    incrementRampageAffirmationRepeat: (setId, affirmationId) => {
      const result = storage.incrementRampageAffirmationRepeat(setId, affirmationId);
      if (!result) return;
      const incShared = get().includeSharedInPersonal;
      set(computeScopedState(get().activeScope, incShared));
    },

    // Journal
    saveJournalEntry: (entry) => {
      const scope = entry.userId || get().activeScope;
      const author = entry.author || getAuthorForScope(scope);
      const isExisting = storage.getJournalEntries().some((j) => j.id === entry.id);
      const enriched: JournalEntry = {
        ...entry,
        userId: scope,
        author,
        updatedAt: new Date().toISOString(),
      };

      storage.saveJournalEntry(enriched);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // ÚNICAMENTE mostrar notificación al crear una nueva entrada de notas de cuaderno
      if (!isExisting) {
        get().showToast('Nueva nota guardada en tu cuaderno ✨', 'success');
      }

      // Async Turso sync
      tursoSync.pushChange({ entity: 'journal', action: 'save', data: enriched });
    },

    deleteJournalEntry: (id) => {
      storage.deleteJournalEntry(id);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));
      tursoSync.pushChange({ entity: 'journal', action: 'delete', id });
    },

    // Goals
    saveGoal: (goal) => {
      const scope = goal.userId || get().activeScope;
      const author = goal.author || getAuthorForScope(scope);
      const enriched: Goal = {
        ...goal,
        userId: scope,
        author,
      };

      storage.saveGoal(enriched);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // Async Turso sync
      tursoSync.pushChange({ entity: 'goal', action: 'save', data: enriched });
    },

    deleteGoal: (id) => {
      storage.deleteGoal(id);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // Async Turso sync
      tursoSync.pushChange({ entity: 'goal', action: 'delete', id });
    },

    saveGoalStep: (step) => {
      const scope = step.userId || get().activeScope;
      const enriched: GoalStep = {
        ...step,
        userId: scope,
      };

      storage.saveGoalStep(enriched);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // Async Turso sync
      tursoSync.pushChange({ entity: 'step', action: 'save', data: enriched });
    },

    toggleGoalStep: (id) => {
      const steps = storage.getGoalSteps();
      const step = steps.find((s) => s.id === id);
      if (!step) return;
      const willBeCompleted = !step.completed;
      const updatedStep: GoalStep = {
        ...step,
        completed: willBeCompleted,
        completedAt: willBeCompleted ? new Date().toISOString() : undefined,
      };
      storage.saveGoalStep(updatedStep);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));
      set({ settings: storage.getUserSettings() });

      // Async Turso sync
      tursoSync.pushChange({ entity: 'step', action: 'save', data: updatedStep });
    },

    deleteGoalStep: (id) => {
      storage.deleteGoalStep(id);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // Async Turso sync
      tursoSync.pushChange({ entity: 'step', action: 'delete', id });
    },

    // Signs & Synchronicities
    saveManifestationSign: (sign) => {
      const scope = sign.userId || get().activeScope;
      const author = sign.author || getAuthorForScope(scope);
      const enriched: ManifestationSign = {
        ...sign,
        userId: scope,
        author,
      };

      storage.saveManifestationSign(enriched);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // Async Turso sync
      tursoSync.pushChange({ entity: 'sign', action: 'save', data: enriched });
    },

    deleteManifestationSign: (id) => {
      storage.deleteManifestationSign(id);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // Async Turso sync
      tursoSync.pushChange({ entity: 'sign', action: 'delete', id });
    },

    // Success Stories
    saveSuccessStory: (story) => {
      const scope = story.userId || get().activeScope;
      const author = story.author || getAuthorForScope(scope);
      const enriched: SuccessStory = {
        ...story,
        userId: scope,
        author,
      };

      storage.saveSuccessStory(enriched);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // Async Turso sync
      tursoSync.pushChange({ entity: 'story', action: 'save', data: enriched });
    },

    deleteSuccessStory: (id) => {
      storage.deleteSuccessStory(id);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // Async Turso sync
      tursoSync.pushChange({ entity: 'story', action: 'delete', id });
    },

    // Future Manifestations
    saveFutureManifestation: (future) => {
      const scope = future.userId || get().activeScope;
      const author = future.author || getAuthorForScope(scope);
      const enriched: FutureManifestation = {
        ...future,
        userId: scope,
        author,
      };

      storage.saveFutureManifestation(enriched);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // Async Turso sync
      tursoSync.pushChange({ entity: 'future', action: 'save', data: enriched });
    },

    deleteFutureManifestation: (id) => {
      storage.deleteFutureManifestation(id);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // Async Turso sync
      tursoSync.pushChange({ entity: 'future', action: 'delete', id });
    },

    // Agenda
    saveAgendaEvent: (event) => {
      const scope = event.userId || get().activeScope;
      const author = event.author || getAuthorForScope(scope);
      const enriched: AgendaEvent = {
        ...event,
        userId: scope,
        author,
      };

      storage.saveAgendaEvent(enriched);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // Async Turso sync
      tursoSync.pushChange({ entity: 'event', action: 'save', data: enriched });
    },

    toggleAgendaEvent: (id) => {
      const events = storage.getAgendaEvents();
      const event = events.find((e) => e.id === id);
      if (!event) return;
      const updated: AgendaEvent = { ...event, completed: !event.completed };
      storage.saveAgendaEvent(updated);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // Async Turso sync
      tursoSync.pushChange({ entity: 'event', action: 'save', data: updated });
    },

    deleteAgendaEvent: (id) => {
      storage.deleteAgendaEvent(id);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // Async Turso sync
      tursoSync.pushChange({ entity: 'event', action: 'delete', id });
    },

    // Release
    saveReleaseEntry: (entry) => {
      const scope = entry.userId || get().activeScope;
      const enriched: ReleaseEntry = {
        ...entry,
        userId: scope,
      };

      storage.saveReleaseEntry(enriched);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // Async Turso sync
      tursoSync.pushChange({ entity: 'release', action: 'save', data: enriched });
    },

    destroyRelease: (id) => {
      storage.permanentlyDestroyRelease(id);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));
      set({ settings: storage.getUserSettings() });

      // Async Turso sync
      tursoSync.pushChange({ entity: 'release', action: 'delete', id });
    },

    // Daily Reflection
    saveDailyReflection: (reflection) => {
      const scope = reflection.userId || get().activeScope;
      const enriched: DailyReflection = {
        ...reflection,
        userId: scope,
      };

      storage.saveDailyReflection(enriched);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));
    },

    // Settings & Backup
    updateSettings: (partial) => {
      const updated = storage.saveUserSettings(partial);
      set({ settings: updated });
    },

    restoreFromBackup: (json) => {
      const res = storage.importBackup(json);
      if (res.success) {
        const currentScope = get().activeScope;
        const incShared = get().includeSharedInPersonal;
        set({
          ...computeScopedState(currentScope, incShared),
          settings: storage.getUserSettings(),
        });
      }
      return res;
    },

    // Helpers
    getGoalProgress: (goalId) => {
      const steps = storage.getGoalSteps().filter((s) => s.goalId === goalId);
      if (steps.length === 0) return 0;
      const completed = steps.filter((s) => s.completed).length;
      return Math.round((completed / steps.length) * 100);
    },

    getAvailableMilestones: () => {
      const settings = get().settings;
      const currentScope = get().activeScope;
      const journalCount = get().journalEntries.length;
      const completedActions = get().goalSteps.filter((s) => s.completed).length;
      const completedGoals = get().goals.filter((g) => {
        const steps = get().goalSteps.filter((s) => s.goalId === g.id);
        return steps.length > 0 && steps.every((s) => s.completed);
      }).length;
      const releaseCount = settings.totalReleases;
      const successCount = get().successStories.length;
      const signsCount = get().manifestationSigns.length;

      return [
        {
          id: 'welcome_manifest',
          title: 'Primer Destello',
          description: `Abriste el santuario de ${currentScope === 'facu' ? 'Facu' : currentScope === 'maia' ? 'Maia' : 'ambos'} y diste el primer paso consciente.`,
          icon: 'Sparkles',
          category: 'writing',
          unlocked: true,
        },
        {
          id: 'first_action',
          title: 'Manifestación en Acción',
          description: 'Convertiste una intención mental en tu primera acción real completada.',
          icon: 'HeartHandshake',
          category: 'action',
          unlocked: completedActions >= 1,
        },
        {
          id: 'sign_observer',
          title: 'Ojos de Sincronía',
          description: 'Detectaste y registraste tu primera señal o número repetido en el camino.',
          icon: 'Compass',
          category: 'writing',
          unlocked: signsCount >= 1,
        },
        {
          id: 'first_success',
          title: 'Manifestador Real',
          description: 'Anclaste tu primera Historia de Éxito documentando un deseo cumplido.',
          icon: 'Award',
          category: 'action',
          unlocked: successCount >= 1,
        },
        {
          id: 'dedicated_scribe',
          title: 'Alma Reflexiva',
          description: 'Registraste 3 o más entradas expresando tu mundo interior.',
          icon: 'Feather',
          category: 'writing',
          unlocked: journalCount >= 3,
        },
        {
          id: 'first_release',
          title: 'Vuelo Ligero',
          description: 'Completaste tu primer ritual de liberación soltando una carga.',
          icon: 'Flame',
          category: 'release',
          unlocked: releaseCount >= 1,
        },
        {
          id: 'streak_3',
          title: 'Ritmo Sereno',
          description: 'Mantuviste 3 días seguidos visitando tu espacio personal.',
          icon: 'Sun',
          category: 'streak',
          unlocked: settings.dailyStreak >= 3,
        },
        {
          id: 'manifestor_master',
          title: 'Coherencia Completa',
          description: 'Completaste todas las acciones tangibles de un objetivo.',
          icon: 'Award',
          category: 'action',
          unlocked: completedGoals >= 1,
        },
      ];
    },
  };
});