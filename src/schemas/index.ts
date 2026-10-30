import { z } from 'zod';

export const EntryTypeEnum = z.enum(['manifestation', 'gratitude', 'affirmation', 'reflection', 'free']);
export const MoodTypeEnum = z.enum(['peaceful', 'inspired', 'grateful', 'radiant', 'contemplative']);
export const GoalCategoryEnum = z.enum(['crecimiento', 'carrera', 'bienestar', 'relaciones', 'abundancia', 'creatividad']);
export const GoalStatusEnum = z.enum(['active', 'paused', 'completed', 'archived']);

export const JournalEntrySchema = z.object({
  id: z.string().min(1),
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
  title: z.string().min(1, 'La acción debe tener un nombre claro'),
  description: z.string().optional(),
  completed: z.boolean().default(false),
  completedAt: z.string().optional(),
  createdAt: z.string(),
});

export const GoalSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, 'La intención u objetivo es requerido'),
  description: z.string().default(''),
  category: GoalCategoryEnum,
  motivation: z.string().min(1, 'Escribe tu por qué o motivación íntima'),
  status: GoalStatusEnum.default('active'),
  targetDate: z.string().optional(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

export const AgendaEventSchema = z.object({
  id: z.string().min(1),
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
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: MoodTypeEnum,
  highlights: z.string(),
  challenges: z.string(),
  learnings: z.string(),
  gratitude: z.string(),
  createdAt: z.string(),
});

export const UserSettingsSchema = z.object({
  userName: z.string().default('Soñador'),
  greetingPreference: z.enum(['morning_gentle', 'intimate', 'empowered']).default('intimate'),
  theme: z.enum(['pastel-rainbow', 'serene-lavender', 'mint-glow']).default('pastel-rainbow'),
  reducedMotion: z.boolean().default(false),
  favoriteAffirmations: z.array(z.string()).default([]),
  firstLaunchCompleted: z.boolean().default(false),
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
  settings: UserSettingsSchema,
});
