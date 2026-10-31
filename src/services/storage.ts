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

export const CURRENT_SCHEMA_VERSION = 3;

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Facu',
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
  activeScope: 'facu',
  dailyStreak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalJournalEntries: 1,
  totalActionsCompleted: 1,
  totalReleases: 0,
  unlockedMilestones: ['first_step', 'welcome_manifest'],
};

// Seed sample data for Facu, Maia, and Shared
const SEED_JOURNAL: JournalEntry[] = [
  // Facu
  {
    id: 'seed-facu-1',
    userId: 'facu',
    author: 'Facu',
    title: 'Mi espacio de quietud y claridad',
    content: 'Hoy abro este santuario para conectar con lo que realmente deseo. No desde la prisa ni la exigencia, sino desde la presencia y el cariño hacia mi camino.',
    entryType: 'manifestation',
    mood: 'radiant',
    gratitudeItems: ['El aire fresco de la mañana', 'Este momento para ordenar mis ideas'],
    affirmations: ['Elijo vivir con intención, calma y gratitud.'],
    tags: ['Comienzo', 'Intención', 'Paz'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Maia
  {
    id: 'seed-maia-1',
    userId: 'maia',
    author: 'Maia',
    title: 'Santuario de intuición y proyectos del corazón',
    content: 'Comienzo este espacio íntimo para escuchar mi voz interior, honrar mi sensibilidad y permitirme manifestar con ligereza y amor propio.',
    entryType: 'manifestation',
    mood: 'inspired',
    gratitudeItems: ['La belleza de los nuevos comienzos', 'Confianza en mi intuición'],
    affirmations: ['Todo fluye en el momento perfecto para mí.'],
    tags: ['Magia', 'Intuición', 'Creación'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Shared (Facu & Maia)
  {
    id: 'seed-shared-1',
    userId: 'shared',
    author: 'Facu & Maia',
    title: 'Nuestra visión compartida y sueños juntos',
    content: 'Este es nuestro espacio compartido para co-crear, registrar viajes deseados, momentos mágicos y manifestar en equipo la vida luminosa que queremos construir.',
    entryType: 'manifestation',
    mood: 'radiant',
    gratitudeItems: ['Caminar juntos con complicidad y amor', 'Nuestros sueños mutuos'],
    affirmations: ['Juntos multiplicamos la alegría, la abundancia y la paz.'],
    tags: ['Nosotros', 'Amor', 'Co-Creación'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_GOALS: Goal[] = [
  // Facu
  {
    id: 'goal-facu-1',
    userId: 'facu',
    author: 'Facu',
    title: 'Cultivar mi paz mental y coherencia diaria',
    description: 'Crear una rutina suave matutina que me conecte con mi centro antes de entrar al ruido del mundo.',
    category: 'bienestar',
    motivation: 'Quiero vivir sintiendo que dirijo mi vida desde la serenidad y no desde la reacción automática.',
    status: 'active',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  // Maia
  {
    id: 'goal-maia-1',
    userId: 'maia',
    author: 'Maia',
    title: 'Expandir mi creatividad y proyectos personales',
    description: 'Dedicar tiempo sagrado a mis expresiones artísticas y proyectos con plena confianza.',
    category: 'creatividad',
    motivation: 'Dar luz a lo que llevo dentro me llena de alegría y autenticidad.',
    status: 'active',
    targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  // Shared
  {
    id: 'goal-shared-1',
    userId: 'shared',
    author: 'Facu & Maia',
    title: 'Nuestro viaje soñado a la naturaleza',
    description: 'Planear nuestra escapada a las montañas con tiempo libre y desconexión total.',
    category: 'relaciones',
    motivation: 'Celebrar nuestro amor y recargar energías en un rincón mágico.',
    status: 'active',
    targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
];

const SEED_GOAL_STEPS: GoalStep[] = [
  {
    id: 'step-facu-1',
    goalId: 'goal-facu-1',
    userId: 'facu',
    title: 'Dedicar 10 minutos a escribir en mi diario al despertar',
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'step-facu-2',
    goalId: 'goal-facu-1',
    userId: 'facu',
    title: 'Hacer una pausa al mediodía para respirar hondo',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'step-maia-1',
    goalId: 'goal-maia-1',
    userId: 'maia',
    title: 'Crear un tablero de inspiración visual para mi proyecto',
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'step-shared-1',
    goalId: 'goal-shared-1',
    userId: 'shared',
    title: 'Investigar cabañas con ventanales y vistas al bosque',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

const SEED_AGENDA: AgendaEvent[] = [
  {
    id: 'agenda-facu-1',
    userId: 'facu',
    author: 'Facu',
    title: 'Momento de enfoque y planificación personal',
    description: 'Ordenar prioridades de la semana.',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    completed: false,
    goalId: 'goal-facu-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agenda-shared-1',
    userId: 'shared',
    author: 'Facu & Maia',
    title: 'Cena & charla de intenciones juntos',
    description: 'Cocinar algo rico y revisar nuestras visiones compartidas.',
    date: new Date().toISOString().split('T')[0],
    time: '21:00',
    completed: false,
    goalId: 'goal-shared-1',
    createdAt: new Date().toISOString(),
  },
];

const SEED_SUCCESS_STORIES: SuccessStory[] = [
  {
    id: 'success-shared-1',
    userId: 'shared',
    author: 'Facu & Maia',
    title: 'Nuestra primera gran sincronía juntos',
    goalId: 'goal-shared-1',
    manifestedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    story: 'Teníamos la intención de encontrar un fin de semana libre sin obligaciones. Sin planearlo, ambos tuvimos los días libres exactamente en la misma fecha y encontramos un lugar perfecto.',
    signsEncountered: [
      'Ambos vimos la secuencia 11:11 el mismo día',
      'Una recomendación casual que nos llegó por separado',
    ],
    mindsetShift: 'Soltamos la exigencia y confiamos en que el universo organiza los tiempos perfectos.',
    gratitudeNote: 'Gracias por la complicidad y la magia compartida.',
    createdAt: new Date().toISOString(),
  },
];

const SEED_SIGNS: ManifestationSign[] = [
  {
    id: 'sign-facu-1',
    userId: 'facu',
    author: 'Facu',
    title: 'Sincronía 11:11 y conversación inspiradora',
    signType: 'angel_number',
    description: 'Al mirar el reloj eran las 11:11 en el preciso instante en que recibí una propuesta creativa.',
    date: new Date().toISOString().split('T')[0],
    feeling: 'Sensación de calidez en el pecho y certeza.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sign-shared-1',
    userId: 'shared',
    author: 'Facu & Maia',
    title: 'Mariposa brillante en nuestro camino',
    signType: 'symbol',
    description: 'Durante un paseo juntos, una mariposa se posó cerca de nosotros justo cuando hablábamos de nuestros planes.',
    date: new Date().toISOString().split('T')[0],
    feeling: 'Confirmación y alegría compartida.',
    createdAt: new Date().toISOString(),
  },
];

const SEED_FUTURE_MANIFESTATIONS: FutureManifestation[] = [
  {
    id: 'future-shared-1',
    userId: 'shared',
    author: 'Facu & Maia',
    title: 'Nuestra cabaña cerca de las montañas',
    horizon: '1_year',
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    visionText: 'Nos vemos desayunando café caliente con el aroma a madera y lluvia en el jardín. Sentimos profunda paz, abundancia y complicidad en nuestro propio hogar.',
    letterToFutureSelf: 'A nuestro Yo del futuro: Que nunca olvidemos cómo empezó este sueño, con amor y certeza.',
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
  bulkReplaceFromRemote(data: any): void;
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
    if (!version || parseInt(version) < CURRENT_SCHEMA_VERSION) {
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
    }
  }

  public bulkReplaceFromRemote(data: any): void {
    if (!data) return;
    if (data.journalEntries) this.safeSet(STORAGE_KEYS.JOURNAL, data.journalEntries);
    if (data.goals) this.safeSet(STORAGE_KEYS.GOALS, data.goals);
    if (data.goalSteps) this.safeSet(STORAGE_KEYS.GOAL_STEPS, data.goalSteps);
    if (data.agendaEvents) this.safeSet(STORAGE_KEYS.AGENDA, data.agendaEvents);
    if (data.manifestationSigns) this.safeSet(STORAGE_KEYS.SIGNS, data.manifestationSigns);
    if (data.successStories) this.safeSet(STORAGE_KEYS.SUCCESS_STORIES, data.successStories);
    if (data.futureManifestations) this.safeSet(STORAGE_KEYS.FUTURE_MANIFESTATIONS, data.futureManifestations);
    if (data.releaseEntries) this.safeSet(STORAGE_KEYS.RELEASES, data.releaseEntries);
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

  public mergeRemoteData(remoteData: {
    journalEntries?: JournalEntry[];
    goals?: Goal[];
    goalSteps?: GoalStep[];
    agendaEvents?: AgendaEvent[];
    manifestationSigns?: ManifestationSign[];
    successStories?: SuccessStory[];
    futureManifestations?: FutureManifestation[];
    releaseEntries?: ReleaseEntry[];
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
        map.set(item.id, item);
      }
      for (const rItem of remoteList) {
        if (!map.has(rItem.id)) {
          map.set(rItem.id, rItem);
          changed = true;
        } else {
          // If remote item exists, keep whichever is updated or keep current
          map.set(rItem.id, rItem);
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
    window.localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    window.localStorage.removeItem(STORAGE_KEYS.SCHEMA_VERSION);
    this.initSeedDataIfNeeded();
  }
}

export const storage = new LocalStorageService();
