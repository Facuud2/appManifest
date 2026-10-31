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
  SETTINGS: 'manifest_user_settings',
  SCHEMA_VERSION: 'manifest_schema_version',
} as const;

export const CURRENT_SCHEMA_VERSION = 2;

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Alma Creadora',
  greetingPreference: 'intimate',
  theme: 'pastel-rainbow',
  reducedMotion: false,
  favoriteAffirmations: [
    'Todo lo que anhelo con el corazón ya está buscando el camino hacia mí.',
    'Confío en el ritmo natural de mi vida y en mis pasos conscientes.',
    'Merezco vivir en paz, belleza y profunda realización.',
    'Doy gracias por este nuevo día y por mi capacidad de crear mi realidad.',
  ],
  firstLaunchCompleted: true,
  tutorialCompleted: false,
  dailyStreak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalJournalEntries: 1,
  totalActionsCompleted: 1,
  totalReleases: 0,
  unlockedMilestones: ['first_step', 'welcome_manifest'],
};

// Seed sample data for an inviting first experience
const SEED_JOURNAL: JournalEntry[] = [
  {
    id: 'seed-journal-1',
    title: 'Mi primer día en mi santuario digital',
    content: 'Hoy abro este espacio para conectar con lo que realmente deseo. No desde la prisa ni la exigencia, sino desde la presencia y el cariño hacia mi camino. Me permito soñar, escribir sin juicios y honrar cada paso que doy.',
    entryType: 'manifestation',
    mood: 'radiant',
    gratitudeItems: [
      'Este momento de quietud para mí',
      'El aire fresco de la mañana',
      'La certeza de que estoy aprendiendo a confiar',
    ],
    affirmations: [
      'Elijo vivir con intención, calma y gratitud.',
    ],
    tags: ['Comienzo', 'Intención', 'Paz'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_GOALS: Goal[] = [
  {
    id: 'seed-goal-1',
    title: 'Cultivar mi paz mental y coherencia diaria',
    description: 'Crear una rutina suave matutina que me conecte con mi centro antes de entrar al ruido del mundo.',
    category: 'bienestar',
    motivation: 'Quiero vivir sintiendo que dirijo mi vida desde la serenidad y no desde la reacción automática.',
    status: 'active',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
];

const SEED_GOAL_STEPS: GoalStep[] = [
  {
    id: 'seed-step-1',
    goalId: 'seed-goal-1',
    title: 'Dedicar 10 minutos a escribir en mi diario al despertar',
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-step-2',
    goalId: 'seed-goal-1',
    title: 'Beber un vaso de agua tibia con intención y presencia',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-step-3',
    goalId: 'seed-goal-1',
    title: 'Hacer una pausa al mediodía para respirar hondo 3 veces',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

const SEED_AGENDA: AgendaEvent[] = [
  {
    id: 'seed-event-1',
    title: 'Cita conmigo: Ritual de gratitud y manifestación',
    description: 'Espacio íntimo para revisar mis anhelos de la semana.',
    date: new Date().toISOString().split('T')[0],
    time: '20:30',
    completed: false,
    goalId: 'seed-goal-1',
    createdAt: new Date().toISOString(),
  },
];

const SEED_SUCCESS_STORIES: SuccessStory[] = [
  {
    id: 'seed-success-1',
    title: 'El rincón de trabajo bañado de luz natural',
    goalId: 'seed-goal-1',
    manifestedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    story: 'Durante meses visualicé un espacio silencioso con ventanales altos donde pudiera crear en calma. Cuando dejé de forzar la búsqueda y ordené mis intenciones, un amigo me comentó casualmente de un lugar disponible que superaba todo lo imaginado.',
    signsEncountered: [
      'Repetición del número 444 durante 3 días seguidos',
      'Una pluma blanca en el umbral de mi puerta',
      'Un mensaje inesperado mencionando exactamente la palabra serenidad',
    ],
    mindsetShift: 'Solté el cómo y la urgencia; me enfoqué en habitar ya la paz antes de verla materializada físicamente.',
    gratitudeNote: 'Gracias a la sincronicidad de la vida y a mi valentía de sostener la visión sin dudar.',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SEED_SIGNS: ManifestationSign[] = [
  {
    id: 'seed-sign-1',
    title: 'Sincronía 11:11 y conversación inspiradora',
    signType: 'angel_number',
    description: 'Al mirar el reloj eran las 11:11 en el preciso instante en que recibí una propuesta creativa que encaja con mi proyecto.',
    date: new Date().toISOString().split('T')[0],
    linkedGoalId: 'seed-goal-1',
    feeling: 'Sensación de calidez en el pecho, certeza y alineación total.',
    createdAt: new Date().toISOString(),
  },
];

const SEED_FUTURE_MANIFESTATIONS: FutureManifestation[] = [
  {
    id: 'seed-future-1',
    title: 'Mi retiro creativo en la naturaleza serena',
    horizon: '6_months',
    targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    visionText: 'Me veo despertando con el sonido de los pájaros y el aroma a pino fresco. Tengo mi cuaderno sobre una mesa de madera maciza, bebiendo té caliente. Mi corazón está en completa gratitud, sintiendo abundancia y ligereza.',
    letterToFutureSelf: 'Querido Yo del futuro: Recuerda que cuando sembraste esta semilla, confiaste plenamente en tu capacidad de florecer sin prisa.',
    isSealed: false,
    createdAt: new Date().toISOString(),
  },
];

export interface IStorageService {
  getJournalEntries(): JournalEntry[];
  saveJournalEntry(entry: JournalEntry): void;
  deleteJournalEntry(id: string): void;

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

  public initSeedDataIfNeeded(): void {
    if (!this.isBrowser()) return;
    const version = window.localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION);
    if (!version) {
      this.safeSet(STORAGE_KEYS.JOURNAL, SEED_JOURNAL);
      this.safeSet(STORAGE_KEYS.GOALS, SEED_GOALS);
      this.safeSet(STORAGE_KEYS.GOAL_STEPS, SEED_GOAL_STEPS);
      this.safeSet(STORAGE_KEYS.AGENDA, SEED_AGENDA);
      this.safeSet(STORAGE_KEYS.RELEASES, []);
      this.safeSet(STORAGE_KEYS.REFLECTIONS, []);
      this.safeSet(STORAGE_KEYS.SIGNS, SEED_SIGNS);
      this.safeSet(STORAGE_KEYS.SUCCESS_STORIES, SEED_SUCCESS_STORIES);
      this.safeSet(STORAGE_KEYS.FUTURE_MANIFESTATIONS, SEED_FUTURE_MANIFESTATIONS);
      this.safeSet(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      window.localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
    } else {
      // Migrate if older schema
      const signs = window.localStorage.getItem(STORAGE_KEYS.SIGNS);
      if (!signs) this.safeSet(STORAGE_KEYS.SIGNS, SEED_SIGNS);
      const stories = window.localStorage.getItem(STORAGE_KEYS.SUCCESS_STORIES);
      if (!stories) this.safeSet(STORAGE_KEYS.SUCCESS_STORIES, SEED_SUCCESS_STORIES);
      const futures = window.localStorage.getItem(STORAGE_KEYS.FUTURE_MANIFESTATIONS);
      if (!futures) this.safeSet(STORAGE_KEYS.FUTURE_MANIFESTATIONS, SEED_FUTURE_MANIFESTATIONS);
      window.localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
    }
  }

  // Journal
  public getJournalEntries(): JournalEntry[] {
    const raw = this.safeGet<unknown[]>(STORAGE_KEYS.JOURNAL, []);
    const valid: JournalEntry[] = [];
    for (const item of raw) {
      const parsed = JournalEntrySchema.safeParse(item);
      if (parsed.success) valid.push(parsed.data as JournalEntry);
    }
    return valid.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public saveJournalEntry(entry: JournalEntry): void {
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
    const current = this.getJournalEntries();
    this.safeSet(STORAGE_KEYS.JOURNAL, current.filter((e) => e.id !== id));
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

  // Manifestation Signs & Synchronicities
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
      updated = [...current, event];
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
    if (parsed.success) {
      return parsed.data as UserSettings;
    }
    return DEFAULT_SETTINGS;
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
    window.localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    window.localStorage.removeItem(STORAGE_KEYS.SCHEMA_VERSION);
    this.initSeedDataIfNeeded();
  }
}

export const storage = new LocalStorageService();
