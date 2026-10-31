import { z } from 'zod';

export const UserScopeEnum = z.enum(['facu', 'maia', 'shared']);
export const EntryTypeEnum = z.enum(['manifestation', 'gratitude', 'affirmation', 'reflection', 'free', 'sign']);
export const MoodTypeEnum = z.enum(['peaceful', 'inspired', 'grateful', 'radiant', 'contemplative']);
export const GoalCategoryEnum = z.enum(['crecimiento', 'carrera', 'bienestar', 'relaciones', 'abundancia', 'creatividad']);
export const GoalStatusEnum = z.enum(['active', 'paused', 'completed', 'archived']);
export const SignTypeEnum = z.enum(['angel_number', 'dream', 'coincidence', 'symbol', 'encounter', 'intuitive']);
export const FutureHorizonEnum = z.enum(['3_months', '6_months', '1_year', '3_years', 'exact_date']);

export const JournalEntrySchema = z.object({
  id: z.string().min(1),
  userId: UserScopeEnum.default('facu'),
  author: z.string().default('Facu'),
  title: z.string().min(1, 'El título o intención es requerido'),
  content: z.string().min(1, 'El contenido no puede estar vacío'),
  entryType: EntryTypeEnum,
  mood: MoodTypeEnum.optional(),
  gratitudeItems: z.array(z.string()).optional(),
  affirmations: z.array(z.string()).optional(),
  tags: z.array(z.string()).default([]),
  goalReferences: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GoalStepSchema = z.object({
  id: z.string().min(1),
  goalId: z.string().min(1),
  userId: UserScopeEnum.default('facu'),
  title: z.string().min(1, 'La acción debe tener un nombre claro'),
  description: z.string().optional(),
  completed: z.boolean().default(false),
  completedAt: z.string().optional(),
  createdAt: z.string(),
});

export const GoalSchema = z.object({
  id: z.string().min(1),
  userId: UserScopeEnum.default('facu'),
  author: z.string().default('Facu'),
  title: z.string().min(1, 'La intención u objetivo es requerido'),
  description: z.string().default(''),
  category: GoalCategoryEnum,
  motivation: z.string().min(1, 'Escribe tu por qué o motivación íntima'),
  status: GoalStatusEnum.default('active'),
  targetDate: z.string().optional(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

export const ManifestationSignSchema = z.object({
  id: z.string().min(1),
  userId: UserScopeEnum.default('facu'),
  author: z.string().default('Facu'),
  title: z.string().min(1, 'Escribe qué señal o sincronía percibiste'),
  signType: SignTypeEnum,
  description: z.string().default(''),
  date: z.string(),
  linkedGoalId: z.string().optional(),
  feeling: z.string().default(''),
  createdAt: z.string(),
});

export const SuccessStorySchema = z.object({
  id: z.string().min(1),
  userId: UserScopeEnum.default('facu'),
  author: z.string().default('Facu'),
  title: z.string().min(1, 'Nombra tu manifestación cumplida'),
  goalId: z.string().optional(),
  manifestedDate: z.string(),
  story: z.string().min(1, 'Cuéntanos cómo se desenvolvió en tu realidad'),
  signsEncountered: z.array(z.string()).default([]),
  mindsetShift: z.string().default(''),
  gratitudeNote: z.string().default(''),
  createdAt: z.string(),
});

export const FutureManifestationSchema = z.object({
  id: z.string().min(1),
  userId: UserScopeEnum.default('facu'),
  author: z.string().default('Facu'),
  title: z.string().min(1, 'Nombra esta visión futura'),
  horizon: FutureHorizonEnum,
  targetDate: z.string().optional(),
  visionText: z.string().min(1, 'Escribe tu visión sensorial en tiempo presente'),
  letterToFutureSelf: z.string().optional(),
  isSealed: z.boolean().default(false),
  createdAt: z.string(),
});

export const AgendaEventSchema = z.object({
  id: z.string().min(1),
  userId: UserScopeEnum.default('facu'),
  author: z.string().default('Facu'),
  title: z.string().min(1, 'El compromiso o actividad es requerido'),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  time: z.string().optional(),
  completed: z.boolean().default(false),
  goalId: z.string().optional(),
  createdAt: z.string(),
});

export const ReleaseEntrySchema = z.object({
  id: z.string().min(1),
  userId: UserScopeEnum.default('facu'),
  content: z.string().min(1, 'Escribe aquello que deseas soltar'),
  reflection: z.object({
    whyAffects: z.string().optional(),
    learned: z.string().optional(),
    remember: z.string().optional(),
    chooseNow: z.string().optional(),
  }).optional(),
  createdAt: z.string(),
  releasedAt: z.string().optional(),
  status: z.enum(['draft', 'released']).default('draft'),
});

export const DailyReflectionSchema = z.object({
  id: z.string().min(1),
  userId: UserScopeEnum.default('facu'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: MoodTypeEnum,
  highlights: z.string(),
  challenges: z.string(),
  learnings: z.string(),
  gratitude: z.string(),
  createdAt: z.string(),
});

export const AffirmationSchema = z.object({
  id: z.string().min(1),
  userId: UserScopeEnum.default('facu'),
  author: z.string().default('Facu'),
  text: z.string().min(1, 'El texto de la afirmación es requerido'),
  repeatCount: z.number().int().nonnegative().default(0),
  category: z.string().optional(),
  createdAt: z.string(),
  lastRepeatedAt: z.string().optional(),
});

export const UserSettingsSchema = z.object({
  userName: z.string().default('Facu'),
  greetingPreference: z.enum(['morning_gentle', 'intimate', 'empowered']).default('intimate'),
  theme: z.enum(['pastel-rainbow', 'serene-lavender', 'mint-glow']).default('pastel-rainbow'),
  reducedMotion: z.boolean().default(false),
  favoriteAffirmations: z.array(z.string()).default([]),
  firstLaunchCompleted: z.boolean().default(false),
  tutorialCompleted: z.boolean().default(false),
  activeScope: UserScopeEnum.default('facu'),
  dailyStreak: z.number().default(1),
  lastActiveDate: z.string().default(''),
  totalJournalEntries: z.number().default(0),
  totalActionsCompleted: z.number().default(0),
  totalReleases: z.number().default(0),
  unlockedMilestones: z.array(z.string()).default([]),
});

export const BackupDataSchema = z.object({
  version: z.number(),
  exportedAt: z.string(),
  journalEntries: z.array(JournalEntrySchema),
  goals: z.array(GoalSchema),
  goalSteps: z.array(GoalStepSchema),
  agendaEvents: z.array(AgendaEventSchema),
  releaseEntries: z.array(ReleaseEntrySchema),
  dailyReflections: z.array(DailyReflectionSchema),
  manifestationSigns: z.array(ManifestationSignSchema).optional(),
  successStories: z.array(SuccessStorySchema).optional(),
  futureManifestations: z.array(FutureManifestationSchema).optional(),
  affirmations: z.array(AffirmationSchema).optional(),
  settings: UserSettingsSchema,
});
