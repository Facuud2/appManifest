export type EntryType = 'manifestation' | 'gratitude' | 'affirmation' | 'reflection' | 'free';

export type MoodType = 'peaceful' | 'inspired' | 'grateful' | 'radiant' | 'contemplative';

export type GoalCategory = 'crecimiento' | 'carrera' | 'bienestar' | 'relaciones' | 'abundancia' | 'creatividad';

export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  entryType: EntryType;
  mood?: MoodType;
  gratitudeItems?: string[];
  affirmations?: string[];
  tags: string[];
  goalReferences?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalStep {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  motivation: string;
  status: GoalStatus;
  targetDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  completed: boolean;
  goalId?: string;
  createdAt: string;
}

export interface ReleaseReflection {
  whyAffects?: string;
  learned?: string;
  remember?: string;
  chooseNow?: string;
}

export interface ReleaseEntry {
  id: string;
  content: string;
  reflection?: ReleaseReflection;
  createdAt: string;
  releasedAt?: string;
  status: 'draft' | 'released';
}

export interface DailyReflection {
  id: string;
  date: string; // YYYY-MM-DD
  mood: MoodType;
  highlights: string;
  challenges: string;
  learnings: string;
  gratitude: string;
  createdAt: string;
}

export interface UserSettings {
  userName: string;
  greetingPreference: 'morning_gentle' | 'intimate' | 'empowered';
  theme: 'pastel-rainbow' | 'serene-lavender' | 'mint-glow';
  reducedMotion: boolean;
  favoriteAffirmations: string[];
  firstLaunchCompleted: boolean;
  dailyStreak: number;
  lastActiveDate: string;
  totalJournalEntries: number;
  totalActionsCompleted: number;
  totalReleases: number;
  unlockedMilestones: string[];
}

export interface BackupData {
  version: number;
  exportedAt: string;
  journalEntries: JournalEntry[];
  goals: Goal[];
  goalSteps: GoalStep[];
  agendaEvents: AgendaEvent[];
  releaseEntries: ReleaseEntry[];
  dailyReflections: DailyReflection[];
  settings: UserSettings;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'writing' | 'action' | 'release' | 'streak';
  unlocked: boolean;
}
