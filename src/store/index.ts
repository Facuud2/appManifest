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

export interface CelebrationData {
  title: string;
  message: string;
  fragments?: number;
  nextStepLabel?: string;
  onNextStep?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
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

  // Goals / Affirmations view mode and direct navigation
  goalsViewMode: 'list' | 'rampage';
  setGoalsViewMode: (mode: 'list' | 'rampage') => void;
  navigateToGoals: (mode?: 'list' | 'rampage') => void;

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

  // Rampage Set Editor Modal
  isRampageSetEditorOpen: boolean;
  editingRampageSet: RampageSet | null;
  openRampageSetEditor: (setToEdit?: RampageSet | null) => void;
  closeRampageSetEditor: () => void;

  // Global Deletion Confirmation Popups
  pendingDeleteAffirmation: Affirmation | null;
  setPendingDeleteAffirmation: (aff: Affirmation | null) => void;
  pendingDeleteJournalEntry: JournalEntry | null;
  setPendingDeleteJournalEntry: (entry: JournalEntry | null) => void;

  // Lite Mode (Modo Ligero)
  isLiteMode: boolean;
  toggleLiteMode: () => void;
  setLiteMode: (enabled: boolean) => void;

  // Liquid Glass Color Mode (Dark / Light / System)
  colorMode: 'dark' | 'light' | 'system';
  setColorMode: (mode: 'dark' | 'light' | 'system') => void;
  toggleColorMode: () => void;

  // AI Sandbox Mode (Cero consumo de API)
  aiSandboxMode: boolean;
  toggleAiSandboxMode: () => void;
  setAiSandboxMode: (enabled: boolean) => void;

  // AI Rampage Config Modal
  isRampageConfigOpen: boolean;
  openRampageConfig: () => void;
  closeRampageConfig: () => void;

  // Cosmic Oracle & Ether Fragments (Gacha / Gambling místico)
  etherFragments: number;
  addEtherFragments: (amount: number) => void;
  isOracleOpen: boolean;
  openOracle: () => void;
  closeOracle: () => void;

  // Success Celebration & Next Step
  celebrationData: CelebrationData | null;
  triggerCelebration: (data: CelebrationData) => void;
  closeCelebration: () => void;

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
  checkAndUnlockMilestones: (options?: { suppressModal?: boolean }) => Milestone[];
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
      rampageSets: scopedRampage,
    };
  };

  return {
    isInitialized: false,
    activeTab: 'inicio',
    setActiveTab: (tab) => set({ activeTab: tab }),

    goalsViewMode: 'list',
    setGoalsViewMode: (mode) => set({ goalsViewMode: mode }),
    navigateToGoals: (mode = 'list') => set({ activeTab: 'objetivos', goalsViewMode: mode }),

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

    isRampageSetEditorOpen: false,
    editingRampageSet: null,
    openRampageSetEditor: (setToEdit = null) => {
      set({ isRampageSetEditorOpen: true, editingRampageSet: setToEdit });
    },
    closeRampageSetEditor: () => {
      set({ isRampageSetEditorOpen: false, editingRampageSet: null });
    },

    pendingDeleteAffirmation: null,
    setPendingDeleteAffirmation: (aff = null) => {
      set({ pendingDeleteAffirmation: aff });
    },
    pendingDeleteJournalEntry: null,
    setPendingDeleteJournalEntry: (entry = null) => {
      set({ pendingDeleteJournalEntry: entry });
    },

    // Lite Mode
    isLiteMode: initialSettings.isLiteMode || false,
    toggleLiteMode: () => {
      const current = get().isLiteMode;
      const next = !current;
      storage.saveUserSettings({ isLiteMode: next });
      if (typeof document !== 'undefined') {
        if (next) document.documentElement.classList.add('lite-mode');
        else document.documentElement.classList.remove('lite-mode');
      }
      set({ isLiteMode: next, settings: { ...get().settings, isLiteMode: next } });
    },
    setLiteMode: (enabled: boolean) => {
      storage.saveUserSettings({ isLiteMode: enabled });
      if (typeof document !== 'undefined') {
        if (enabled) document.documentElement.classList.add('lite-mode');
        else document.documentElement.classList.remove('lite-mode');
      }
      set({ isLiteMode: enabled, settings: { ...get().settings, isLiteMode: enabled } });
    },

    // Neumorphic Rainbow Pastels (Light Mode Enforced)
    colorMode: 'light',
    setColorMode: (_mode: 'dark' | 'light' | 'system' = 'light') => {
      storage.saveUserSettings({ colorMode: 'light' });
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      set({ colorMode: 'light', settings: { ...get().settings, colorMode: 'light' } });
    },
    toggleColorMode: () => {
      get().setColorMode('light');
    },

    // AI Sandbox Mode (Cero consumo de API)
    aiSandboxMode: Boolean(
      initialSettings.aiSandboxMode ||
      (typeof window !== 'undefined' && (window.navigator as any)?.webdriver === true)
    ),
    toggleAiSandboxMode: () => {
      const current = get().aiSandboxMode;
      const next = !current;
      storage.saveUserSettings({ aiSandboxMode: next });
      set({ aiSandboxMode: next, settings: { ...get().settings, aiSandboxMode: next } });
    },
    setAiSandboxMode: (enabled: boolean) => {
      storage.saveUserSettings({ aiSandboxMode: enabled });
      set({ aiSandboxMode: enabled, settings: { ...get().settings, aiSandboxMode: enabled } });
    },

    // AI Rampage Config Modal
    isRampageConfigOpen: false,
    openRampageConfig: () => set({ isRampageConfigOpen: true }),
    closeRampageConfig: () => set({ isRampageConfigOpen: false }),

    // Cosmic Oracle & Ether Fragments
    etherFragments: initialSettings.etherFragments ?? 50,
    addEtherFragments: (amount: number) => {
      const next = Math.max(0, (get().etherFragments || 0) + amount);
      storage.saveUserSettings({ etherFragments: next });
      set({ etherFragments: next, settings: { ...get().settings, etherFragments: next } });
    },
    isOracleOpen: false,
    openOracle: () => set({ isOracleOpen: true }),
    closeOracle: () => set({ isOracleOpen: false }),

    // Success Celebration & Next Step
    celebrationData: null,
    triggerCelebration: (data: CelebrationData) => set({ celebrationData: data }),
    closeCelebration: () => set({ celebrationData: null }),

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

      if (settings.isLiteMode && typeof document !== 'undefined') {
        document.documentElement.classList.add('lite-mode');
      }

      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }

      set({
        ...scoped,
        activeScope: scope,
        settings: storage.getUserSettings(),
        isLiteMode: settings.isLiteMode || false,
        colorMode: 'light',
        etherFragments: settings.etherFragments ?? 50,
        isInitialized: true,
      });

      // Silently record any milestones already satisfied by existing stored data on startup
      const initialMilestones = get().getAvailableMilestones();
      const currentSettings = storage.getUserSettings();
      const alreadyUnlockedIds = new Set(currentSettings.unlockedMilestones || []);
      let changedInitial = false;
      initialMilestones.forEach((m) => {
        if (m.unlocked && !alreadyUnlockedIds.has(m.id)) {
          alreadyUnlockedIds.add(m.id);
          changedInitial = true;
        }
      });
      if (changedInitial) {
        const syncedSettings = storage.saveUserSettings({
          unlockedMilestones: Array.from(alreadyUnlockedIds),
        });
        set({ settings: syncedSettings });
      }

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

      // Silently sync already-unlocked milestones for this scope so switching scope doesn't trigger popups
      const scopeMilestones = get().getAvailableMilestones();
      const curUnlocked = new Set(storage.getUserSettings().unlockedMilestones || []);
      let scopeChanged = false;
      scopeMilestones.forEach((m) => {
        if (m.unlocked && !curUnlocked.has(m.id)) {
          curUnlocked.add(m.id);
          scopeChanged = true;
        }
      });
      if (scopeChanged) {
        const synced = storage.saveUserSettings({ unlockedMilestones: Array.from(curUnlocked) });
        set({ settings: synced });
      }

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

          // Silently sync any milestones already satisfied by remote data so remote hydration doesn't falsely trigger popups
          const remoteMilestones = get().getAvailableMilestones();
          const curUnlocked = new Set(storage.getUserSettings().unlockedMilestones || []);
          let remoteMilestoneChanged = false;
          remoteMilestones.forEach((m) => {
            if (m.unlocked && !curUnlocked.has(m.id)) {
              curUnlocked.add(m.id);
              remoteMilestoneChanged = true;
            }
          });
          if (remoteMilestoneChanged) {
            const syncedSettings = storage.saveUserSettings({
              unlockedMilestones: Array.from(curUnlocked),
            });
            set({ settings: syncedSettings });
          }
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
      get().checkAndUnlockMilestones();
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

    deleteAffirmation: async (id) => {
      storage.deleteAffirmation(id);
      const incShared = get().includeSharedInPersonal;
      set(computeScopedState(get().activeScope, incShared));
      await tursoSync.pushChange({ entity: 'affirmation', action: 'delete', id });
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
      get().checkAndUnlockMilestones();
    },

    // Journal
    saveJournalEntry: (entry) => {
      const scope = entry.userId || get().activeScope;
      const author = entry.author || getAuthorForScope(scope);
      const enriched: JournalEntry = {
        ...entry,
        userId: scope,
        author,
        updatedAt: new Date().toISOString(),
      };

      storage.saveJournalEntry(enriched);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));

      // Async Turso sync
      tursoSync.pushChange({ entity: 'journal', action: 'save', data: enriched });
    },

    deleteJournalEntry: async (id) => {
      storage.deleteJournalEntry(id);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));
      await tursoSync.pushChange({ entity: 'journal', action: 'delete', id });
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

    deleteGoal: async (id) => {
      storage.deleteGoal(id);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));
      await tursoSync.pushChange({ entity: 'goal', action: 'delete', id });
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

    deleteGoalStep: async (id) => {
      storage.deleteGoalStep(id);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));
      await tursoSync.pushChange({ entity: 'step', action: 'delete', id });
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

    deleteManifestationSign: async (id) => {
      storage.deleteManifestationSign(id);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));
      await tursoSync.pushChange({ entity: 'sign', action: 'delete', id });
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

    deleteSuccessStory: async (id) => {
      storage.deleteSuccessStory(id);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));
      await tursoSync.pushChange({ entity: 'story', action: 'delete', id });
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

    deleteFutureManifestation: async (id) => {
      storage.deleteFutureManifestation(id);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));
      await tursoSync.pushChange({ entity: 'future', action: 'delete', id });
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

    deleteAgendaEvent: async (id) => {
      storage.deleteAgendaEvent(id);
      set(computeScopedState(get().activeScope, get().includeSharedInPersonal));
      await tursoSync.pushChange({ entity: 'event', action: 'delete', id });
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
      const affirmationsList = get().affirmations;
      const rampageList = get().rampageSets;
      const journals = get().journalEntries;

      const affirmationsCount = affirmationsList.length;
      const rampageSetsCount = rampageList.length;
      const journalCount = journals.length;
      const totalRepeats =
        affirmationsList.reduce((sum, a) => sum + (a.repeatCount || 0), 0) +
        rampageList.reduce(
          (sum, r) =>
            sum + (r.affirmations || []).reduce((s, ra) => s + (ra.repeatCount || 0), 0),
          0
        );
      const releaseCount = settings.totalReleases || 0;
      const successCount =
        get().successStories.length +
        journals.filter((e) => e.entryType === 'reflection' || e.entryType === 'gratitude').length;
      const signsCount =
        get().manifestationSigns.length +
        journals.filter((e) => e.entryType === 'sign').length;

      const scopeLabel =
        currentScope === 'facu' ? 'Facu' : currentScope === 'maia' ? 'Maia' : 'ambos';

      return [
        {
          id: 'welcome_manifest',
          title: 'Primer Destello',
          description: `Abriste el santuario de ${scopeLabel} y diste el primer paso consciente.`,
          icon: 'Sparkles',
          category: 'writing',
          unlocked: true,
          rewardFragments: 15,
          progress: { current: 1, target: 1 },
        },
        {
          id: 'first_action',
          title: 'Voz Creadora',
          description: 'Anclaste tu primera afirmación consciente en el santuario.',
          icon: 'HeartHandshake',
          category: 'action',
          unlocked: affirmationsCount >= 1,
          rewardFragments: 20,
          progress: { current: Math.min(affirmationsCount, 1), target: 1 },
        },
        {
          id: 'affirmation_architect',
          title: 'Arquitecto de Intenciones',
          description: 'Creaste 5 o más afirmaciones para sostener tu nueva realidad.',
          icon: 'Award',
          category: 'action',
          unlocked: affirmationsCount >= 5,
          rewardFragments: 35,
          progress: { current: Math.min(affirmationsCount, 5), target: 5 },
        },
        {
          id: 'rampage_creator',
          title: 'Secuencia de Poder',
          description: 'Creaste tu primer Set de Rampage para elevar tu frecuencia.',
          icon: 'Flame',
          category: 'action',
          unlocked: rampageSetsCount >= 1,
          rewardFragments: 30,
          progress: { current: Math.min(rampageSetsCount, 1), target: 1 },
        },
        {
          id: 'manifestor_master',
          title: 'Frecuencia Magnética',
          description: 'Acumulaste 25 o más repeticiones conscientes en tus afirmaciones y sets.',
          icon: 'Award',
          category: 'action',
          unlocked: totalRepeats >= 25,
          rewardFragments: 45,
          progress: { current: Math.min(totalRepeats, 25), target: 25 },
        },
        {
          id: 'first_journal',
          title: 'Semilla en el Diario',
          description: 'Escribiste tu primera manifestación o avance en el Diario.',
          icon: 'Feather',
          category: 'writing',
          unlocked: journalCount >= 1,
          rewardFragments: 20,
          progress: { current: Math.min(journalCount, 1), target: 1 },
        },
        {
          id: 'dedicated_scribe',
          title: 'Alma Reflexiva',
          description: 'Registraste 3 o más entradas expresando tu mundo interior en el Diario.',
          icon: 'Feather',
          category: 'writing',
          unlocked: journalCount >= 3,
          rewardFragments: 35,
          progress: { current: Math.min(journalCount, 3), target: 3 },
        },
        {
          id: 'first_success',
          title: 'Manifestador Real',
          description: 'Anclaste tu primera Success Story documentando un deseo cumplido.',
          icon: 'Award',
          category: 'action',
          unlocked: successCount >= 1,
          rewardFragments: 50,
          progress: { current: Math.min(successCount, 1), target: 1 },
        },
        {
          id: 'sign_observer',
          title: 'Ojos de Sincronía',
          description: 'Detectaste y registraste tu primera señal o número repetido en el camino.',
          icon: 'Compass',
          category: 'writing',
          unlocked: signsCount >= 1,
          rewardFragments: 25,
          progress: { current: Math.min(signsCount, 1), target: 1 },
        },
        {
          id: 'first_release',
          title: 'Vuelo Ligero',
          description: 'Completaste tu primer ritual de liberación soltando una carga.',
          icon: 'Flame',
          category: 'release',
          unlocked: releaseCount >= 1,
          rewardFragments: 30,
          progress: { current: Math.min(releaseCount, 1), target: 1 },
        },
        {
          id: 'streak_3',
          title: 'Ritmo Sereno',
          description: 'Mantuviste 3 días seguidos visitando tu espacio personal.',
          icon: 'Sun',
          category: 'streak',
          unlocked: settings.dailyStreak >= 3,
          rewardFragments: 40,
          progress: { current: Math.min(settings.dailyStreak, 3), target: 3 },
        },
      ];
    },

    checkAndUnlockMilestones: (options) => {
      const currentSettings = storage.getUserSettings();
      const unlockedSet = new Set(currentSettings.unlockedMilestones || []);
      // Ensure welcome_manifest is always baseline unlocked
      unlockedSet.add('welcome_manifest');

      const allMilestones = get().getAvailableMilestones();
      const newlyUnlocked = allMilestones.filter(
        (m) => m.unlocked && !unlockedSet.has(m.id)
      );

      if (newlyUnlocked.length === 0) {
        return [];
      }

      newlyUnlocked.forEach((m) => unlockedSet.add(m.id));
      const totalFragments = newlyUnlocked.reduce((sum, m) => sum + (m.rewardFragments || 20), 0);
      const nextEther = Math.max(0, (get().etherFragments || 0) + totalFragments);

      const updatedSettings = storage.saveUserSettings({
        unlockedMilestones: Array.from(unlockedSet),
        etherFragments: nextEther,
      });

      set({
        settings: updatedSettings,
        etherFragments: nextEther,
      });

      const primary = newlyUnlocked[0];
      get().showToast(
        `🏆 ¡Logro desbloqueado: ${primary.title}! +${totalFragments} Fragmentos de Éter`,
        'celebrate'
      );

      if (!options?.suppressModal) {
        get().triggerCelebration({
          title:
            newlyUnlocked.length > 1
              ? `¡${newlyUnlocked.length} Logros Desbloqueados!`
              : `¡Logro: ${primary.title}!`,
          message: newlyUnlocked.map((m) => m.description).join(' • '),
          fragments: totalFragments,
          nextStepLabel: 'Girar el Oráculo',
          onNextStep: () => get().openOracle(),
          secondaryLabel: 'Ver mis Logros',
          onSecondary: () => get().setActiveTab('espacio'),
        });
      }

      return newlyUnlocked;
    },
  };
});