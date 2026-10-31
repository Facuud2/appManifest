import { create } from 'zustand';
import {
  JournalEntry,
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
} from '@/types';
import { storage } from '@/services/storage';

export type AppTab = 'inicio' | 'agenda' | 'diario' | 'objetivos' | 'espacio';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'gentle' | 'celebrate';
  text: string;
}

interface AppState {
  isInitialized: boolean;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  journalEntries: JournalEntry[];
  goals: Goal[];
  goalSteps: GoalStep[];
  agendaEvents: AgendaEvent[];
  releaseEntries: ReleaseEntry[];
  dailyReflections: DailyReflection[];
  manifestationSigns: ManifestationSign[];
  successStories: SuccessStory[];
  futureManifestations: FutureManifestation[];
  settings: UserSettings;
  toasts: ToastMessage[];

  // Actions
  init: () => void;
  showToast: (text: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

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

export const useAppStore = create<AppState>((set, get) => ({
  isInitialized: false,
  activeTab: 'inicio',
  setActiveTab: (tab) => set({ activeTab: tab }),

  journalEntries: [],
  goals: [],
  goalSteps: [],
  agendaEvents: [],
  releaseEntries: [],
  dailyReflections: [],
  manifestationSigns: [],
  successStories: [],
  futureManifestations: [],
  settings: storage.getUserSettings(),
  toasts: [],

  init: () => {
    storage.initSeedDataIfNeeded();
    const journalEntries = storage.getJournalEntries();
    const goals = storage.getGoals();
    const goalSteps = storage.getGoalSteps();
    const agendaEvents = storage.getAgendaEvents();
    const releaseEntries = storage.getReleaseEntries();
    const dailyReflections = storage.getDailyReflections();
    const manifestationSigns = storage.getManifestationSigns();
    const successStories = storage.getSuccessStories();
    const futureManifestations = storage.getFutureManifestations();
    const settings = storage.getUserSettings();

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

    set({
      journalEntries,
      goals,
      goalSteps,
      agendaEvents,
      releaseEntries,
      dailyReflections,
      manifestationSigns,
      successStories,
      futureManifestations,
      settings: storage.getUserSettings(),
      isInitialized: true,
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('manifest_data_changed', () => {
        set({
          journalEntries: storage.getJournalEntries(),
          goals: storage.getGoals(),
          goalSteps: storage.getGoalSteps(),
          agendaEvents: storage.getAgendaEvents(),
          releaseEntries: storage.getReleaseEntries(),
          dailyReflections: storage.getDailyReflections(),
          manifestationSigns: storage.getManifestationSigns(),
          successStories: storage.getSuccessStories(),
          futureManifestations: storage.getFutureManifestations(),
          settings: storage.getUserSettings(),
        });
      });
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

  // Journal
  saveJournalEntry: (entry) => {
    storage.saveJournalEntry(entry);
    set({ journalEntries: storage.getJournalEntries() });
    get().showToast('Palabras guardadas con serenidad ✨', 'success');
  },

  deleteJournalEntry: (id) => {
    storage.deleteJournalEntry(id);
    set({ journalEntries: storage.getJournalEntries() });
    get().showToast('Entrada retirada del diario', 'info');
  },

  // Goals
  saveGoal: (goal) => {
    storage.saveGoal(goal);
    set({ goals: storage.getGoals() });
    get().showToast('Intención anclada al universo ✨', 'success');
  },

  deleteGoal: (id) => {
    storage.deleteGoal(id);
    set({
      goals: storage.getGoals(),
      goalSteps: storage.getGoalSteps(),
    });
    get().showToast('Intención retirada', 'info');
  },

  saveGoalStep: (step) => {
    storage.saveGoalStep(step);
    set({ goalSteps: storage.getGoalSteps() });
    get().showToast('Paso de acción registrado', 'gentle');
  },

  toggleGoalStep: (id) => {
    const steps = get().goalSteps;
    const step = steps.find((s) => s.id === id);
    if (!step) return;
    const willBeCompleted = !step.completed;
    const updatedStep: GoalStep = {
      ...step,
      completed: willBeCompleted,
      completedAt: willBeCompleted ? new Date().toISOString() : undefined,
    };
    storage.saveGoalStep(updatedStep);
    set({ goalSteps: storage.getGoalSteps(), settings: storage.getUserSettings() });
    if (willBeCompleted) {
      get().showToast('¡Un paso tangible manifestado con éxito! 🌸', 'celebrate');
    }
  },

  deleteGoalStep: (id) => {
    storage.deleteGoalStep(id);
    set({ goalSteps: storage.getGoalSteps() });
  },

  // Signs & Synchronicities
  saveManifestationSign: (sign) => {
    storage.saveManifestationSign(sign);
    set({ manifestationSigns: storage.getManifestationSigns() });
    get().showToast('Sincronía capturada en tu camino ✨', 'celebrate');
  },

  deleteManifestationSign: (id) => {
    storage.deleteManifestationSign(id);
    set({ manifestationSigns: storage.getManifestationSigns() });
    get().showToast('Señal retirada', 'info');
  },

  // Success Stories
  saveSuccessStory: (story) => {
    storage.saveSuccessStory(story);
    set({ successStories: storage.getSuccessStories() });
    get().showToast('¡Historia de éxito anclada en gratitud eterna! 🌟', 'celebrate');
  },

  deleteSuccessStory: (id) => {
    storage.deleteSuccessStory(id);
    set({ successStories: storage.getSuccessStories() });
    get().showToast('Historia retirada del registro', 'info');
  },

  // Future Manifestations
  saveFutureManifestation: (future) => {
    storage.saveFutureManifestation(future);
    set({ futureManifestations: storage.getFutureManifestations() });
    get().showToast('Semilla del futuro plantada con certeza 🌱', 'success');
  },

  deleteFutureManifestation: (id) => {
    storage.deleteFutureManifestation(id);
    set({ futureManifestations: storage.getFutureManifestations() });
    get().showToast('Visión retirada', 'info');
  },

  // Agenda
  saveAgendaEvent: (event) => {
    storage.saveAgendaEvent(event);
    set({ agendaEvents: storage.getAgendaEvents() });
    get().showToast('Compromiso agendado con presencia', 'gentle');
  },

  toggleAgendaEvent: (id) => {
    const events = get().agendaEvents;
    const event = events.find((e) => e.id === id);
    if (!event) return;
    const updated: AgendaEvent = { ...event, completed: !event.completed };
    storage.saveAgendaEvent(updated);
    set({ agendaEvents: storage.getAgendaEvents() });
    if (updated.completed) {
      get().showToast('Actividad cumplida con amor ✨', 'success');
    }
  },

  deleteAgendaEvent: (id) => {
    storage.deleteAgendaEvent(id);
    set({ agendaEvents: storage.getAgendaEvents() });
    get().showToast('Actividad eliminada', 'info');
  },

  // Release
  saveReleaseEntry: (entry) => {
    storage.saveReleaseEntry(entry);
    set({ releaseEntries: storage.getReleaseEntries() });
  },

  destroyRelease: (id) => {
    storage.permanentlyDestroyRelease(id);
    set({
      releaseEntries: storage.getReleaseEntries(),
      settings: storage.getUserSettings(),
    });
    get().showToast('Liberado y desvanecido en gratitud y paz 🕊️', 'celebrate');
  },

  // Daily Reflection
  saveDailyReflection: (reflection) => {
    storage.saveDailyReflection(reflection);
    set({ dailyReflections: storage.getDailyReflections() });
    get().showToast('Reflexión diaria guardada en tu santuario', 'success');
  },

  // Settings & Backup
  updateSettings: (partial) => {
    const updated = storage.saveUserSettings(partial);
    set({ settings: updated });
    get().showToast('Tus preferencias han sido actualizadas', 'gentle');
  },

  restoreFromBackup: (json) => {
    const res = storage.importBackup(json);
    if (res.success) {
      set({
        journalEntries: storage.getJournalEntries(),
        goals: storage.getGoals(),
        goalSteps: storage.getGoalSteps(),
        agendaEvents: storage.getAgendaEvents(),
        releaseEntries: storage.getReleaseEntries(),
        dailyReflections: storage.getDailyReflections(),
        manifestationSigns: storage.getManifestationSigns(),
        successStories: storage.getSuccessStories(),
        futureManifestations: storage.getFutureManifestations(),
        settings: storage.getUserSettings(),
      });
      get().showToast('Santuario restaurado íntegramente ✨', 'celebrate');
    }
    return res;
  },

  // Helpers
  getGoalProgress: (goalId) => {
    const steps = get().goalSteps.filter((s) => s.goalId === goalId);
    if (steps.length === 0) return 0;
    const completed = steps.filter((s) => s.completed).length;
    return Math.round((completed / steps.length) * 100);
  },

  getAvailableMilestones: () => {
    const settings = get().settings;
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
        description: 'Abriste tu santuario y diste el primer paso consciente hacia tu transformación.',
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
}));
