import {
  JournalEntry,
  Goal,
  GoalStep,
  AgendaEvent,
  ReleaseEntry,
  DailyReflection,
  UserSettings,
  BackupData,
  ManifestationSign,
  SuccessStory,
  FutureManifestation,
  Affirmation,
  RampageSet,
  RampageAffirmation,
  UserScope,
} from '@/types';
import {
  BackupDataSchema,
  JournalEntrySchema,
  GoalSchema,
  GoalStepSchema,
  AgendaEventSchema,
  ReleaseEntrySchema,
  DailyReflectionSchema,
  UserSettingsSchema,
  ManifestationSignSchema,
  SuccessStorySchema,
  FutureManifestationSchema,
  AffirmationSchema,
  RampageSetSchema,
} from '@/schemas';

const STORAGE_KEYS = {
  JOURNAL: 'manifest_journal_entries',
  GOALS: 'manifest_goals',
  GOAL_STEPS: 'manifest_goal_steps',
  AGENDA: 'manifest_agenda_events',
  RELEASES: 'manifest_release_entries',
  REFLECTIONS: 'manifest_reflections',
  SIGNS: 'manifest_signs',
  SUCCESS_STORIES: 'manifest_success_stories',
  FUTURE_MANIFESTATIONS: 'manifest_future_manifestations',
  AFFIRMATIONS: 'manifest_affirmations',
  RAMPAGE_SETS: 'manifest_rampage_sets',
  SETTINGS: 'manifest_user_settings',
  DELETED_IDS: 'manifest_deleted_ids',
  SCHEMA_VERSION: 'manifest_schema_version',
} as const;

export const CURRENT_SCHEMA_VERSION = 5;

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Facu',
  greetingPreference: 'intimate',
  theme: 'pastel-rainbow',
  reducedMotion: false,
  favoriteAffirmations: [],
  firstLaunchCompleted: true,
  tutorialCompleted: true,
  activeScope: 'facu',
  dailyStreak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalJournalEntries: 0,
  totalActionsCompleted: 0,
  totalReleases: 0,
  unlockedMilestones: [],
  etherFragments: 50,
  isLiteMode: false,
  aiSandboxMode: false,
};

// Clean empty seed collections (no mock / test data)
const SEED_JOURNAL: JournalEntry[] = [];
const SEED_GOALS: Goal[] = [];
const SEED_GOAL_STEPS: GoalStep[] = [];
const SEED_AGENDA: AgendaEvent[] = [];
const SEED_SUCCESS_STORIES: SuccessStory[] = [];
const SEED_SIGNS: ManifestationSign[] = [];
const SEED_FUTURE_MANIFESTATIONS: FutureManifestation[] = [];
const SEED_AFFIRMATIONS: Affirmation[] = [];

export interface IStorageService {
  getJournalEntries(): JournalEntry[];
  saveJournalEntry(entry: JournalEntry): void;
  deleteJournalEntry(id: string): void;

  getAffirmations(): Affirmation[];
  saveAffirmation(affirmation: Affirmation): void;
  incrementAffirmationRepeat(id: string): Affirmation | null;
  togglePinAffirmation(id: string): Affirmation | null;
  reorderAffirmations(orderedAffirmations: Affirmation[]): void;
  deleteAffirmation(id: string): void;

  getRampageSets(): RampageSet[];
  saveRampageSet(set: RampageSet): void;
  deleteRampageSet(id: string): void;
  incrementRampageAffirmationRepeat(setId: string, affirmationId: string): { updatedSet: RampageSet; repeatCount: number } | null;

  getGoals(): Goal[];
  saveGoal(goal: Goal): void;
  deleteGoal(id: string): void;

  getGoalSteps(goalId?: string): GoalStep[];
  saveGoalStep(step: GoalStep): void;
  deleteGoalStep(id: string): void;

  getAgendaEvents(): AgendaEvent[];
  saveAgendaEvent(event: AgendaEvent): void;
  deleteAgendaEvent(id: string): void;

  getReleaseEntries(): ReleaseEntry[];
  saveReleaseEntry(entry: ReleaseEntry): void;
  permanentlyDestroyRelease(id: string): void;

  getDailyReflections(): DailyReflection[];
  saveDailyReflection(reflection: DailyReflection): void;

  getManifestationSigns(): ManifestationSign[];
  saveManifestationSign(sign: ManifestationSign): void;
  deleteManifestationSign(id: string): void;

  getSuccessStories(): SuccessStory[];
  saveSuccessStory(story: SuccessStory): void;
  deleteSuccessStory(id: string): void;

  getFutureManifestations(): FutureManifestation[];
  saveFutureManifestation(future: FutureManifestation): void;
  deleteFutureManifestation(id: string): void;

  getUserSettings(): UserSettings;
  saveUserSettings(settings: Partial<UserSettings>): UserSettings;

  exportBackup(): BackupData;
  importBackup(jsonString: string): { success: boolean; message: string; error?: string };
  clearAllData(): void;
  bulkReplaceFromRemote(data: any): void;

  // Tombstones & Deletion guarantees
  markAsDeleted(id: string): void;
  unmarkDeleted(id: string): void;
  isDeleted(id: string): boolean;
  getDeletedIds(): string[];
}

class LocalStorageService implements IStorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private safeGet<T>(key: string, fallback: T): T {
    if (!this.isBrowser()) return fallback;
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`[LocalStorage] Error parsing key ${key}:`, e);
      return fallback;
    }
  }

  private safeSet<T>(key: string, value: T): void {
    if (!this.isBrowser()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new Event('manifest_data_changed'));
    } catch (e) {
      console.error(`[LocalStorage] Error saving key ${key}:`, e);
    }
  }

  // Tombstone methods to prevent resurrecting deleted items upon remote sync
  public getDeletedIds(): string[] {
    return this.safeGet<string[]>(STORAGE_KEYS.DELETED_IDS, []);
  }

  public markAsDeleted(id: string): void {
    if (!this.isBrowser() || !id) return;
    const current = new Set(this.getDeletedIds());
    current.add(id);
    this.safeSet(STORAGE_KEYS.DELETED_IDS, Array.from(current));
  }

  public unmarkDeleted(id: string): void {
    if (!this.isBrowser() || !id) return;
    const current = new Set(this.getDeletedIds());
    current.delete(id);
    this.safeSet(STORAGE_KEYS.DELETED_IDS, Array.from(current));
  }

  public isDeleted(id: string): boolean {
    if (!id) return false;
    const current = new Set(this.getDeletedIds());
    return current.has(id);
  }

  public initSeedDataIfNeeded(): void {
    if (!this.isBrowser()) return;
    const version = window.localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
    if (!version || parseInt(version) < CURRENT_SCHEMA_VERSION) {
      // Clean out any legacy mock/seed items from previous versions
      const currentJournals = this.getJournalEntries();
      this.safeSet(
        STORAGE_KEYS.JOURNAL,
        currentJournals.filter((j) => !j.id.startsWith('seed-'))
      );
      this.safeSet(STORAGE_KEYS.GOALS, []);
      this.safeSet(STORAGE_KEYS.GOAL_STEPS, []);
      this.safeSet(STORAGE_KEYS.AGENDA, []);
      this.safeSet(STORAGE_KEYS.RELEASES, []);
      this.safeSet(STORAGE_KEYS.REFLECTIONS, []);
      this.safeSet(STORAGE_KEYS.SIGNS, []);
      this.safeSet(STORAGE_KEYS.SUCCESS_STORIES, []);
      this.safeSet(STORAGE_KEYS.FUTURE_MANIFESTATIONS, []);

      const currentAffs = this.getAffirmations();
      this.safeSet(
        STORAGE_KEYS.AFFIRMATIONS,
        currentAffs.filter(
          (a) =>
            !a.id.startsWith('aff-facu-') &&
            !a.id.startsWith('aff-maia-') &&
            !a.id.startsWith('aff-shared-')
        )
      );

      const currentRampage = this.safeGet<any[]>(STORAGE_KEYS.RAMPAGE_SETS, []);
      this.safeSet(
        STORAGE_KEYS.RAMPAGE_SETS,
        currentRampage.filter((r) => r && r.id && !r.id.startsWith('set-'))
      );

      const existingSettings = this.safeGet<any>(STORAGE_KEYS.SETTINGS, null);
      if (!existingSettings) {
        this.safeSet(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      }
      window.localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
    }
  }

  public bulkReplaceFromRemote(data: any): void {
    if (!data) return;
    if (data.journalEntries) this.safeSet(STORAGE_KEYS.JOURNAL, data.journalEntries.filter((j: any) => !j.id?.startsWith('seed-')));
    if (data.goals) this.safeSet(STORAGE_KEYS.GOALS, data.goals);
    if (data.goalSteps) this.safeSet(STORAGE_KEYS.GOAL_STEPS, data.goalSteps);
    if (data.agendaEvents) this.safeSet(STORAGE_KEYS.AGENDA, data.agendaEvents);
    if (data.manifestationSigns) this.safeSet(STORAGE_KEYS.SIGNS, data.manifestationSigns);
    if (data.successStories) this.safeSet(STORAGE_KEYS.SUCCESS_STORIES, data.successStories);
    if (data.futureManifestations) this.safeSet(STORAGE_KEYS.FUTURE_MANIFESTATIONS, data.futureManifestations);
    if (data.releaseEntries) this.safeSet(STORAGE_KEYS.RELEASES, data.releaseEntries);
    if (data.affirmations) {
      this.safeSet(
        STORAGE_KEYS.AFFIRMATIONS,
        data.affirmations.filter(
          (a: any) =>
            !a.id?.startsWith('aff-facu-') &&
            !a.id?.startsWith('aff-maia-') &&
            !a.id?.startsWith('aff-shared-')
        )
      );
    }
  }

  // Journal
  public getJournalEntries(): JournalEntry[] {
    const raw = this.safeGet<unknown[]>(STORAGE_KEYS.JOURNAL, []);
    const valid: JournalEntry[] = [];
    for (const item of raw) {
      const parsed = JournalEntrySchema.safeParse(item);
      if (parsed.success && !parsed.data.id.startsWith('seed-') && !this.isDeleted(parsed.data.id)) {
        valid.push(parsed.data as JournalEntry);
      }
    }
    return valid.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public saveJournalEntry(entry: JournalEntry): void {
    this.unmarkDeleted(entry.id);
    const current = this.getJournalEntries();
    const index = current.findIndex((e) => e.id === entry.id);
    let updated: JournalEntry[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = { ...entry, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...entry, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
      const settings = this.getUserSettings();
      this.saveUserSettings({ totalJournalEntries: settings.totalJournalEntries + 1 });
    }
    this.safeSet(STORAGE_KEYS.JOURNAL, updated);
  }

  public deleteJournalEntry(id: string): void {
    this.markAsDeleted(id);
    const current = this.getJournalEntries();
    this.safeSet(STORAGE_KEYS.JOURNAL, current.filter((e) => e.id !== id));
  }

  // Affirmations
  public getAffirmations(): Affirmation[] {
    const raw = this.safeGet<unknown[]>(STORAGE_KEYS.AFFIRMATIONS, []);
    const valid: Affirmation[] = [];
    for (const item of raw) {
      const parsed = AffirmationSchema.safeParse(item);
      if (
        parsed.success &&
        !this.isDeleted(parsed.data.id) &&
        !parsed.data.id.startsWith('aff-facu-') &&
        !parsed.data.id.startsWith('aff-maia-') &&
        !parsed.data.id.startsWith('aff-shared-')
      ) {
        valid.push(parsed.data as Affirmation);
      }
    }
    return valid.sort((a, b) => {
      // Pinned items come first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // If both are pinned or have custom orders, respect order
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      // Fallback to createdAt asc for chronological Trello-like order
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  public saveAffirmation(affirmation: Affirmation): void {
    this.unmarkDeleted(affirmation.id);
    const current = this.getAffirmations();
    const index = current.findIndex((a) => a.id === affirmation.id);
    let updated: Affirmation[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = affirmation;
    } else {
      updated = [affirmation, ...current];
    }
    this.safeSet(STORAGE_KEYS.AFFIRMATIONS, updated);
  }

  public togglePinAffirmation(id: string): Affirmation | null {
    const current = this.getAffirmations();
    const index = current.findIndex((a) => a.id === id);
    if (index < 0) return null;
    const target = current[index];
    const willBePinned = !target.pinned;
    const updated: Affirmation = {
      ...target,
      pinned: willBePinned,
      order: willBePinned ? 0 : undefined,
    };
    current[index] = updated;
    this.safeSet(STORAGE_KEYS.AFFIRMATIONS, current);
    return updated;
  }

  public reorderAffirmations(orderedAffirmations: Affirmation[]): void {
    const current = this.getAffirmations();
    const orderMap = new Map<string, number>();
    orderedAffirmations.forEach((item, idx) => {
      orderMap.set(item.id, idx);
    });

    const updated = current.map((item) => {
      if (orderMap.has(item.id)) {
        return {
          ...item,
          order: orderMap.get(item.id),
        };
      }
      return item;
    });

    this.safeSet(STORAGE_KEYS.AFFIRMATIONS, updated);
  }

  public incrementAffirmationRepeat(id: string): Affirmation | null {
    const current = this.getAffirmations();
    const index = current.findIndex((a) => a.id === id);
    if (index < 0) return null;
    const target = current[index];
    const updated: Affirmation = {
      ...target,
      repeatCount: (target.repeatCount || 0) + 1,
      lastRepeatedAt: new Date().toISOString(),
    };
    current[index] = updated;
    this.safeSet(STORAGE_KEYS.AFFIRMATIONS, current);
    return updated;
  }

  public deleteAffirmation(id: string): void {
    this.markAsDeleted(id);
    const current = this.getAffirmations();
    this.safeSet(STORAGE_KEYS.AFFIRMATIONS, current.filter((a) => a.id !== id));
  }

  // Rampage Sets
  public getRampageSets(): RampageSet[] {
    const raw = this.safeGet<unknown[]>(STORAGE_KEYS.RAMPAGE_SETS, []);
    const valid: RampageSet[] = [];
    if (raw && raw.length > 0) {
      for (const item of raw) {
        // Exclude test/seed sets
        if (
          typeof item === 'object' &&
          item !== null &&
          'id' in item &&
          typeof (item as any).id === 'string' &&
          (item as any).id.startsWith('set-')
        ) {
          continue;
        }
        const parsed = RampageSetSchema.safeParse(item);
        if (parsed.success && !this.isDeleted(parsed.data.id)) {
          valid.push(parsed.data as RampageSet);
        }
      }
    }

    return valid;
  }

  public saveRampageSet(set: RampageSet): void {
    this.unmarkDeleted(set.id);
    const current = this.getRampageSets();
    const index = current.findIndex((s) => s.id === set.id);
    let updated: RampageSet[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = { ...set, updatedAt: new Date().toISOString() };
    } else {
      updated = [set, ...current];
    }
    this.safeSet(STORAGE_KEYS.RAMPAGE_SETS, updated);
  }

  public deleteRampageSet(id: string): void {
    this.markAsDeleted(id);
    const current = this.getRampageSets();
    this.safeSet(STORAGE_KEYS.RAMPAGE_SETS, current.filter((s) => s.id !== id));
  }

  public incrementRampageAffirmationRepeat(setId: string, affirmationId: string): { updatedSet: RampageSet; repeatCount: number } | null {
    const current = this.getRampageSets();
    const setIndex = current.findIndex((s) => s.id === setId);
    if (setIndex < 0) return null;
    const targetSet = current[setIndex];
    let newRepeat = 1;
    const updatedAffirmations = targetSet.affirmations.map((aff) => {
      if (aff.id === affirmationId) {
        newRepeat = (aff.repeatCount || 0) + 1;
        return { ...aff, repeatCount: newRepeat };
      }
      return aff;
    });
    const updatedSet: RampageSet = {
      ...targetSet,
      affirmations: updatedAffirmations,
      updatedAt: new Date().toISOString(),
    };
    current[setIndex] = updatedSet;
    this.safeSet(STORAGE_KEYS.RAMPAGE_SETS, current);
    return { updatedSet, repeatCount: newRepeat };
  }

  // Goals
  public getGoals(): Goal[] {
    const raw = this.safeGet<unknown[]>(STORAGE_KEYS.GOALS, []);
    const valid: Goal[] = [];
    for (const item of raw) {
      const parsed = GoalSchema.safeParse(item);
      if (parsed.success) valid.push(parsed.data as Goal);
    }
    return valid;
  }

  public saveGoal(goal: Goal): void {
    const current = this.getGoals();
    const index = current.findIndex((g) => g.id === goal.id);
    let updated: Goal[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = goal;
    } else {
      updated = [goal, ...current];
    }
    this.safeSet(STORAGE_KEYS.GOALS, updated);
  }

  public deleteGoal(id: string): void {
    const current = this.getGoals();
    this.safeSet(STORAGE_KEYS.GOALS, current.filter((g) => g.id !== id));
    const currentSteps = this.getGoalSteps();
    this.safeSet(STORAGE_KEYS.GOAL_STEPS, currentSteps.filter((s) => s.goalId !== id));
  }

  // Goal Steps
  public getGoalSteps(goalId?: string): GoalStep[] {
    const raw = this.safeGet<unknown[]>(STORAGE_KEYS.GOAL_STEPS, []);
    const valid: GoalStep[] = [];
    for (const item of raw) {
      const parsed = GoalStepSchema.safeParse(item);
      if (parsed.success) valid.push(parsed.data as GoalStep);
    }
    if (goalId) {
      return valid.filter((s) => s.goalId === goalId);
    }
    return valid;
  }

  public saveGoalStep(step: GoalStep): void {
    const current = this.getGoalSteps();
    const index = current.findIndex((s) => s.id === step.id);
    let updated: GoalStep[];
    if (index >= 0) {
      const previous = current[index];
      updated = [...current];
      updated[index] = step;
      if (!previous.completed && step.completed) {
        const settings = this.getUserSettings();
        this.saveUserSettings({ totalActionsCompleted: settings.totalActionsCompleted + 1 });
      }
    } else {
      updated = [...current, step];
    }
    this.safeSet(STORAGE_KEYS.GOAL_STEPS, updated);
  }

  public deleteGoalStep(id: string): void {
    const current = this.getGoalSteps();
    this.safeSet(STORAGE_KEYS.GOAL_STEPS, current.filter((s) => s.id !== id));
  }

  // Signs & Synchronicities
  public getManifestationSigns(): ManifestationSign[] {
    const raw = this.safeGet<unknown[]>(STORAGE_KEYS.SIGNS, []);
    const valid: ManifestationSign[] = [];
    for (const item of raw) {
      const parsed = ManifestationSignSchema.safeParse(item);
      if (parsed.success) valid.push(parsed.data as ManifestationSign);
    }
    return valid.sort((a, b) => b.date.localeCompare(a.date));
  }

  public saveManifestationSign(sign: ManifestationSign): void {
    const current = this.getManifestationSigns();
    const index = current.findIndex((s) => s.id === sign.id);
    let updated: ManifestationSign[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = sign;
    } else {
      updated = [sign, ...current];
    }
    this.safeSet(STORAGE_KEYS.SIGNS, updated);
  }

  public deleteManifestationSign(id: string): void {
    const current = this.getManifestationSigns();
    this.safeSet(STORAGE_KEYS.SIGNS, current.filter((s) => s.id !== id));
  }

  // Success Stories
  public getSuccessStories(): SuccessStory[] {
    const raw = this.safeGet<unknown[]>(STORAGE_KEYS.SUCCESS_STORIES, []);
    const valid: SuccessStory[] = [];
    for (const item of raw) {
      const parsed = SuccessStorySchema.safeParse(item);
      if (parsed.success) valid.push(parsed.data as SuccessStory);
    }
    return valid.sort((a, b) => b.manifestedDate.localeCompare(a.manifestedDate));
  }

  public saveSuccessStory(story: SuccessStory): void {
    const current = this.getSuccessStories();
    const index = current.findIndex((s) => s.id === story.id);
    let updated: SuccessStory[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = story;
    } else {
      updated = [story, ...current];
    }
    this.safeSet(STORAGE_KEYS.SUCCESS_STORIES, updated);
  }

  public deleteSuccessStory(id: string): void {
    const current = this.getSuccessStories();
    this.safeSet(STORAGE_KEYS.SUCCESS_STORIES, current.filter((s) => s.id !== id));
  }

  // Future Manifestations
  public getFutureManifestations(): FutureManifestation[] {
    const raw = this.safeGet<unknown[]>(STORAGE_KEYS.FUTURE_MANIFESTATIONS, []);
    const valid: FutureManifestation[] = [];
    for (const item of raw) {
      const parsed = FutureManifestationSchema.safeParse(item);
      if (parsed.success) valid.push(parsed.data as FutureManifestation);
    }
    return valid.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public saveFutureManifestation(future: FutureManifestation): void {
    const current = this.getFutureManifestations();
    const index = current.findIndex((f) => f.id === future.id);
    let updated: FutureManifestation[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = future;
    } else {
      updated = [future, ...current];
    }
    this.safeSet(STORAGE_KEYS.FUTURE_MANIFESTATIONS, updated);
  }

  public deleteFutureManifestation(id: string): void {
    const current = this.getFutureManifestations();
    this.safeSet(STORAGE_KEYS.FUTURE_MANIFESTATIONS, current.filter((f) => f.id !== id));
  }

  // Agenda
  public getAgendaEvents(): AgendaEvent[] {
    const raw = this.safeGet<unknown[]>(STORAGE_KEYS.AGENDA, []);
    const valid: AgendaEvent[] = [];
    for (const item of raw) {
      const parsed = AgendaEventSchema.safeParse(item);
      if (parsed.success) valid.push(parsed.data as AgendaEvent);
    }
    return valid.sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));
  }

  public saveAgendaEvent(event: AgendaEvent): void {
    const current = this.getAgendaEvents();
    const index = current.findIndex((e) => e.id === event.id);
    let updated: AgendaEvent[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = event;
    } else {
      updated = [event, ...current];
    }
    this.safeSet(STORAGE_KEYS.AGENDA, updated);
  }

  public deleteAgendaEvent(id: string): void {
    const current = this.getAgendaEvents();
    this.safeSet(STORAGE_KEYS.AGENDA, current.filter((e) => e.id !== id));
  }

  // Release Ritual
  public getReleaseEntries(): ReleaseEntry[] {
    const raw = this.safeGet<unknown[]>(STORAGE_KEYS.RELEASES, []);
    const valid: ReleaseEntry[] = [];
    for (const item of raw) {
      const parsed = ReleaseEntrySchema.safeParse(item);
      if (parsed.success) valid.push(parsed.data as ReleaseEntry);
    }
    return valid;
  }

  public saveReleaseEntry(entry: ReleaseEntry): void {
    const current = this.getReleaseEntries();
    const index = current.findIndex((r) => r.id === entry.id);
    let updated: ReleaseEntry[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = entry;
    } else {
      updated = [entry, ...current];
    }
    this.safeSet(STORAGE_KEYS.RELEASES, updated);
  }

  public permanentlyDestroyRelease(id: string): void {
    const current = this.getReleaseEntries();
    this.safeSet(STORAGE_KEYS.RELEASES, current.filter((r) => r.id !== id));
    const settings = this.getUserSettings();
    this.saveUserSettings({ totalReleases: settings.totalReleases + 1 });
  }

  // Daily Reflections
  public getDailyReflections(): DailyReflection[] {
    const raw = this.safeGet<unknown[]>(STORAGE_KEYS.REFLECTIONS, []);
    const valid: DailyReflection[] = [];
    for (const item of raw) {
      const parsed = DailyReflectionSchema.safeParse(item);
      if (parsed.success) valid.push(parsed.data as DailyReflection);
    }
    return valid;
  }

  public saveDailyReflection(reflection: DailyReflection): void {
    const current = this.getDailyReflections();
    const index = current.findIndex((r) => r.id === reflection.id || r.date === reflection.date);
    let updated: DailyReflection[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = reflection;
    } else {
      updated = [reflection, ...current];
    }
    this.safeSet(STORAGE_KEYS.REFLECTIONS, updated);
  }

  // Settings
  public getUserSettings(): UserSettings {
    const raw = this.safeGet<unknown>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    const parsed = UserSettingsSchema.safeParse(raw);
    const data = (parsed.success ? parsed.data : DEFAULT_SETTINGS) as UserSettings;
    if (typeof window !== 'undefined' && (window.navigator as any)?.webdriver === true) {
      data.aiSandboxMode = true;
    }
    return data;
  }

  public saveUserSettings(partial: Partial<UserSettings>): UserSettings {
    const current = this.getUserSettings();
    const merged = { ...current, ...partial };
    this.safeSet(STORAGE_KEYS.SETTINGS, merged);
    return merged;
  }

  // Backup & Restore
  public exportBackup(): BackupData {
    return {
      version: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      journalEntries: this.getJournalEntries(),
      goals: this.getGoals(),
      goalSteps: this.getGoalSteps(),
      agendaEvents: this.getAgendaEvents(),
      releaseEntries: this.getReleaseEntries(),
      dailyReflections: this.getDailyReflections(),
      manifestationSigns: this.getManifestationSigns(),
      successStories: this.getSuccessStories(),
      futureManifestations: this.getFutureManifestations(),
      affirmations: this.getAffirmations(),
      settings: this.getUserSettings(),
    };
  }

  public importBackup(jsonString: string): { success: boolean; message: string; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      const validated = BackupDataSchema.safeParse(parsed);
      if (!validated.success) {
        return {
          success: false,
          message: 'El archivo de copia de seguridad no cumple el esquema de validación.',
          error: validated.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
        };
      }

      const data = validated.data;
      this.safeSet(STORAGE_KEYS.JOURNAL, data.journalEntries);
      this.safeSet(STORAGE_KEYS.GOALS, data.goals);
      this.safeSet(STORAGE_KEYS.GOAL_STEPS, data.goalSteps);
      this.safeSet(STORAGE_KEYS.AGENDA, data.agendaEvents);
      this.safeSet(STORAGE_KEYS.RELEASES, data.releaseEntries);
      this.safeSet(STORAGE_KEYS.REFLECTIONS, data.dailyReflections);
      if (data.manifestationSigns) this.safeSet(STORAGE_KEYS.SIGNS, data.manifestationSigns);
      if (data.successStories) this.safeSet(STORAGE_KEYS.SUCCESS_STORIES, data.successStories);
      if (data.futureManifestations) this.safeSet(STORAGE_KEYS.FUTURE_MANIFESTATIONS, data.futureManifestations);
      if (data.affirmations) this.safeSet(STORAGE_KEYS.AFFIRMATIONS, data.affirmations);
      this.safeSet(STORAGE_KEYS.SETTINGS, data.settings);
      window.localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, String(data.version || CURRENT_SCHEMA_VERSION));

      return {
        success: true,
        message: 'Copia de seguridad restaurada correctamente con éxito.',
      };
    } catch (e) {
      return {
        success: false,
        message: 'Error de sintaxis al leer el archivo JSON.',
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  public mergeRemoteData(remoteData: {
    journalEntries?: JournalEntry[];
    goals?: Goal[];
    goalSteps?: GoalStep[];
    agendaEvents?: AgendaEvent[];
    manifestationSigns?: ManifestationSign[];
    successStories?: SuccessStory[];
    futureManifestations?: FutureManifestation[];
    releaseEntries?: ReleaseEntry[];
    affirmations?: Affirmation[];
  }): boolean {
    if (!this.isBrowser()) return false;
    let changed = false;

    const mergeList = <T extends { id: string }>(
      storageKey: string,
      currentList: T[],
      remoteList?: T[]
    ) => {
      if (!remoteList || !Array.isArray(remoteList) || remoteList.length === 0) return currentList;
      const map = new Map<string, T>();
      for (const item of currentList) {
        if (!this.isDeleted(item.id)) {
          map.set(item.id, item);
        } else {
          changed = true;
        }
      }
      for (const rItem of remoteList) {
        // Ignorar cualquier elemento que el usuario haya marcado como eliminado
        if (this.isDeleted(rItem.id)) {
          continue;
        }

        if (!map.has(rItem.id)) {
          map.set(rItem.id, rItem);
          changed = true;
        } else {
          // If remote item exists, merge fields cleanly without overwriting local client-pinned states
          const currentItem = map.get(rItem.id) as any;
          const mergedItem = {
            ...rItem,
            pinned: (rItem as any).pinned !== undefined ? (rItem as any).pinned : currentItem?.pinned,
            order: (rItem as any).order !== undefined ? (rItem as any).order : currentItem?.order,
          };
          map.set(rItem.id, mergedItem as T);
        }
      }
      const merged = Array.from(map.values());
      this.safeSet(storageKey, merged);
      return merged;
    };

    if (remoteData.journalEntries) mergeList(STORAGE_KEYS.JOURNAL, this.getJournalEntries(), remoteData.journalEntries);
    if (remoteData.goals) mergeList(STORAGE_KEYS.GOALS, this.getGoals(), remoteData.goals);
    if (remoteData.goalSteps) mergeList(STORAGE_KEYS.GOAL_STEPS, this.getGoalSteps(), remoteData.goalSteps);
    if (remoteData.agendaEvents) mergeList(STORAGE_KEYS.AGENDA, this.getAgendaEvents(), remoteData.agendaEvents);
    if (remoteData.manifestationSigns) mergeList(STORAGE_KEYS.SIGNS, this.getManifestationSigns(), remoteData.manifestationSigns);
    if (remoteData.successStories) mergeList(STORAGE_KEYS.SUCCESS_STORIES, this.getSuccessStories(), remoteData.successStories);
    if (remoteData.futureManifestations) mergeList(STORAGE_KEYS.FUTURE_MANIFESTATIONS, this.getFutureManifestations(), remoteData.futureManifestations);
    if (remoteData.releaseEntries) mergeList(STORAGE_KEYS.RELEASES, this.getReleaseEntries(), remoteData.releaseEntries);
    if (remoteData.affirmations) mergeList(STORAGE_KEYS.AFFIRMATIONS, this.getAffirmations(), remoteData.affirmations);

    return changed;
  }

  public clearAllData(): void {
    if (!this.isBrowser()) return;
    window.localStorage.removeItem(STORAGE_KEYS.JOURNAL);
    window.localStorage.removeItem(STORAGE_KEYS.GOALS);
    window.localStorage.removeItem(STORAGE_KEYS.GOAL_STEPS);
    window.localStorage.removeItem(STORAGE_KEYS.AGENDA);
    window.localStorage.removeItem(STORAGE_KEYS.RELEASES);
    window.localStorage.removeItem(STORAGE_KEYS.REFLECTIONS);
    window.localStorage.removeItem(STORAGE_KEYS.SIGNS);
    window.localStorage.removeItem(STORAGE_KEYS.SUCCESS_STORIES);
    window.localStorage.removeItem(STORAGE_KEYS.FUTURE_MANIFESTATIONS);
    window.localStorage.removeItem(STORAGE_KEYS.AFFIRMATIONS);
    window.localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    window.localStorage.removeItem(STORAGE_KEYS.SCHEMA_VERSION);
    this.initSeedDataIfNeeded();
  }
}

export const storage = new LocalStorageService();
