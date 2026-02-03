# MASTER TASKS: PHASE 2 - TYPES + ENGINE
# All tasks are HAIKU-PROOF with complete code
# Run order: AGENT_03, 04, 09 (parallel) → AGENT_11 → AGENT_10 → AGENT_12 → AGENT_13
- Canonical: This file is the single source of truth for Phase 2 tasks; ignore other variants.
- AGENT_03 updates lesson-engine barrel exports to avoid duplicate Session/SessionConfig during its
  own verification; run AGENT_11 immediately after AGENT_03 to replace the session module.

# ============================================================
# V1.3.1 DELTA NOTES
# ============================================================

- Hearts disabled for RU by default; no hearts/energy gating in v1.3.1.
- Content schema + course map must include story/checkpoint nodes and CEFR sections (A1/A2/B1).
- Add an audio manifest/pack plan to pre-cache first-session audio for the micro-win.

# ============================================================
# AGENT_03_TYPES_CORE.md (Haiku)
# ============================================================

# Task: Expand Core Domain Types

**Model:** haiku  
**Task ID:** types_003  
**Modifies:** 2 files (replaces content)  
**Depends On:** AGENT_02

## Replace File: packages/lesson-engine/src/models/index.ts

```typescript
import type { SM2State } from '../spaced-rep/index.js';

// ============================================================
// COURSE STRUCTURE
// ============================================================

export interface Course {
  readonly id: string;
  readonly name: string;
  readonly fromLang: string;
  readonly toLang: string;
  readonly levels: CEFRLevel[];
  readonly units: Unit[];
  readonly createdAt: number;
  readonly updatedAt: number;
}

export type CEFRLevel = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';

export interface Unit {
  readonly id: string;
  readonly courseId: string;
  readonly level: CEFRLevel;
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly lessons: Lesson[];
  readonly estimatedMinutes: number;
}

export interface Lesson {
  readonly id: string;
  readonly unitId: string;
  readonly title: string;
  readonly order: number;
  readonly exercises: Exercise[];
  readonly tips?: LessonTip[];
}

export interface LessonTip {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly examples: string[];
}

// ============================================================
// EXERCISES
// ============================================================

export type ExerciseKind =
  | 'translate_tap'
  | 'translate_type'
  | 'listen_tap'
  | 'listen_type'
  | 'match_pairs'
  | 'fill_blank'
  | 'select_image'
  | 'speak'
  | 'story_comprehension'   // NEW: for story nodes
  | 'checkpoint_question';  // NEW: for checkpoint tests

export interface Prompt {
  readonly text?: string;
  readonly audio?: string;
  readonly image?: string;
  readonly slowAudio?: string;
}

// FIX: Discriminated union by exercise kind for better type safety
// match_pairs has correct: MatchPair[] (tuple pairs), select_image has object choices, speak has optional phoneme hints
export type Exercise =
  | ExerciseBase & { readonly kind: 'match_pairs'; readonly correct: readonly MatchPair[] }
  | ExerciseBase & { readonly kind: 'select_image'; readonly choices: readonly ImageChoice[]; readonly correct: string }
  | ExerciseBase & { readonly kind: 'speak'; readonly correct: string; readonly phonemeHints?: readonly string[] }
  | ExerciseBase & {
      readonly kind: Exclude<ExerciseKind, 'match_pairs' | 'select_image' | 'speak'>;
      readonly choices?: readonly string[];
      readonly correct: string | readonly string[];
    };

export interface ExerciseBase {
  readonly id: string;
  readonly kind: ExerciseKind;
  readonly prompt: Prompt;
  readonly hints?: readonly string[];
  readonly explanation?: string;
  readonly difficulty: 1 | 2 | 3 | 4 | 5;
  readonly tags?: readonly string[];
}

export interface ImageChoice {
  readonly id: string;
  readonly imageUrl: string;
}

export type MatchPair = readonly [string, string];

// ============================================================
// GRADING
// ============================================================

export type GradeResultType = 'correct' | 'incorrect' | 'typo';

export interface GradeResult {
  readonly type: GradeResultType;
  readonly isCorrect: boolean;
  readonly feedback: string;
  readonly correctAnswer?: string;
  readonly userAnswer?: string;
  readonly similarity?: number;
}

export interface GradingConfig {
  readonly typoThreshold: number;
  readonly caseSensitive: boolean;
  readonly ignorePunctuation: boolean;
  readonly ignoreAccents: boolean;
}

export const DEFAULT_GRADING_CONFIG: GradingConfig = {
  typoThreshold: 0.85,
  caseSensitive: false,
  ignorePunctuation: true,
  ignoreAccents: true,
};

// ============================================================
// SESSION
// ============================================================

export interface Session {
  readonly id: string;
  readonly lessonId: string;
  readonly userId: string;
  readonly exercises: Exercise[];
  currentIndex: number;
  answers: Map<string, UserAnswer>;
  hearts: number;
  xpEarned: number;
  readonly startedAt: number;
  completedAt?: number;
}

export interface UserAnswer {
  readonly exerciseId: string;
  // match_pairs answers are tuple arrays; keep as-is (no stringification)
  readonly answer: string | MatchPair[];
  readonly timestamp: number;
  readonly gradeResult: GradeResult;
  readonly timeSpentMs: number;
}

export interface SessionConfig {
  readonly maxHearts: number;
  readonly xpPerCorrect: number;
  readonly xpPerTypo: number;
  readonly xpBonusNoMistakes: number;
  readonly xpBonusSpeed: number;
  readonly speedBonusThresholdMs: number;
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxHearts: 3,
  xpPerCorrect: 10,
  xpPerTypo: 5,
  xpBonusNoMistakes: 20,
  xpBonusSpeed: 10,
  speedBonusThresholdMs: 5000,
};

export interface SessionResult {
  readonly sessionId: string;
  readonly lessonId: string;
  readonly totalExercises: number;
  readonly correctCount: number;
  readonly incorrectCount: number;
  readonly typoCount: number;
  readonly accuracy: number;
  readonly xpEarned: number;
  readonly heartsRemaining: number;
  readonly durationMs: number;
  readonly completedAt: number;
  readonly isPerfect: boolean;
}

// ============================================================
// PROGRESS & USER
// ============================================================

export type MasteryLevel = 'learning' | 'practicing' | 'mastered';

export interface UserProgress {
  readonly userId: string;
  totalXp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActivityDate: number;
  completedLessons: string[];
  lessonProgress: Record<string, LessonProgress>;
  wordStrengths: Record<string, WordStrength>;
  achievements: readonly Achievement[];
}

export interface LessonProgress {
  readonly lessonId: string;
  completedCount: number;
  bestScore: number;
  lastCompletedAt: number;
  masteryLevel: MasteryLevel;
}

export interface WordStrength {
  readonly word: string;
  strength: number;
  lastSeenAt: number;
  timesCorrect: number;
  timesIncorrect: number;
  sm2State: SM2State;
}

// ============================================================
// SPACED REPETITION (SM-2)
// ============================================================

export type { SM2State } from '../spaced-rep/index.js';

// ============================================================
// GAMIFICATION
// ============================================================

export interface Achievement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly category: AchievementCategory;
  readonly unlockedAt: number;
}

export type AchievementCategory = 'milestone' | 'streak' | 'challenge' | 'social';

export interface Streak {
  readonly userId: string;
  current: number;
  longest: number;
  lastActivityDate: number;
  freezesAvailable: number;
  freezesUsedThisMonth: number;
}

export interface XPEvent {
  readonly userId: string;
  readonly amount: number;
  readonly source: XPSource;
  readonly timestamp: number;
  readonly metadata?: Record<string, unknown>;
}

export type XPSource =
  | 'lesson_complete'
  | 'exercise_correct'
  | 'streak_bonus'
  | 'perfect_lesson'
  | 'speed_bonus'
  | 'achievement'
  | 'challenge';

// ============================================================
// USER
// ============================================================

export interface User {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly displayName?: string;
  readonly avatarUrl?: string;
  readonly createdAt: number;
  readonly isPremium: boolean;
  readonly premiumExpiresAt?: number;
  readonly settings: UserSettings;
}

export interface UserSettings {
  readonly dailyGoalMinutes: number;
  readonly notificationsEnabled: boolean;
  readonly soundEnabled: boolean;
  readonly hapticEnabled: boolean;
  readonly interfaceLanguage: string;
  readonly targetAccent: 'american' | 'british';
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  dailyGoalMinutes: 10,
  notificationsEnabled: true,
  soundEnabled: true,
  hapticEnabled: true,
  interfaceLanguage: 'ru',
  targetAccent: 'american',
};

// ============================================================
// LEADERBOARD
// ============================================================

export interface LeaderboardEntry {
  readonly rank: number;
  readonly userId: string;
  readonly username: string;
  readonly avatarUrl?: string;
  readonly xp: number;
  readonly streak: number;
  readonly isCurrentUser: boolean;
}

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'allTime';
export type LeaderboardType = 'global' | 'friends' | 'league';

export interface LeaderboardRequest {
  readonly period: LeaderboardPeriod;
  readonly type: LeaderboardType;
  readonly limit: number;
  readonly userId: string;
}

// ============================================================
// COURSE STRUCTURE (v1.2: CEFR sections + node types)
// ============================================================

export type NodeType = 'lesson' | 'story' | 'checkpoint';

export interface CourseNode {
  readonly id: string;
  readonly type: NodeType;
  readonly title: string;
  readonly order: number;
  readonly sectionId: string; // e.g., 'a1', 'a2', 'b1'
  readonly isLocked: boolean;
  readonly isCompleted: boolean;
}

export interface CourseSection {
  readonly id: string;
  readonly level: CEFRLevel;
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly nodes: CourseNode[];
  readonly isUnlocked: boolean;
}

export interface CourseMap {
  readonly courseId: string;
  readonly sections: CourseSection[];
  readonly currentNodeId: string | null;
  readonly totalNodes: number;
  readonly completedNodes: number;
}

// Story-specific types
export interface StoryLine {
  readonly speaker: string;
  readonly text: string;
  readonly audioUrl?: string;
}

export interface Story {
  readonly id: string;
  readonly title: string;
  readonly lines: StoryLine[];
  readonly comprehensionExercises: Exercise[];
}

// Checkpoint-specific types
export interface CheckpointTest {
  readonly id: string;
  readonly sectionId: string;
  readonly title: string;
  readonly exercises: Exercise[];
  readonly passingScore: number; // e.g., 70
}

export interface CheckpointResult {
  readonly checkpointId: string;
  readonly userId: string;
  readonly score: number;
  readonly passed: boolean;
  readonly completedAt: number;
}

```

## Replace File: packages/lesson-engine/src/index.ts

```typescript
export * from './models/index.js';
export * from './grading/index.js';
export { createSession } from './session/index.js';
export { INITIAL_SM2_STATE, updateSM2State } from './spaced-rep/index.js';
```

**NOTE:** Replace the file entirely; do not merge with previous exports.

**NOTE:** Auth session types are named `AuthSession` in `@duolingoru/types` to avoid collisions.
If you see both in the same file, alias imports explicitly.

## EXACT Verification

```bash
cd packages/lesson-engine

# Step 1: TypeScript check
pnpm typecheck
echo "✓ Step 1: typecheck passes"

# Step 2: Count exported types (should be 40+ now)
grep -c "^export" src/models/index.ts
echo "✓ Step 2: 40+ exports"

# Step 3: Verify story_comprehension and checkpoint_question are in ExerciseKind
grep -q "'story_comprehension'" src/models/index.ts && echo "✓ Step 3a: 'story_comprehension' found"
grep -q "'checkpoint_question'" src/models/index.ts && echo "✓ Step 3b: 'checkpoint_question' found"
grep -q "'speak'" src/models/index.ts && echo "✓ Step 3c: 'speak' found"

# Step 4: Build
pnpm build
echo "✓ Step 4: build"
```

## SUCCESS Criteria

- [ ] `pnpm typecheck` exits 0
- [ ] 40+ type exports in models/index.ts
- [ ] All types use `readonly` appropriately
- [ ] No `any` types
- [ ] ✅ v1.2: 'story_comprehension' and 'checkpoint_question' added to ExerciseKind
- [ ] ✅ FIX B2 APPLIED: 'speak' present in ExerciseKind

## Git Commit

```
feat(engine): expand core domain types

- Add Course, Unit, Lesson, Exercise types with readonly
- Add GradeResult and GradingConfig types
- Add Session, SessionConfig, SessionResult types
- Add UserProgress, LessonProgress, WordStrength types
- Re-export SM2State from spaced-rep (single canonical definition)
- Add Achievement, Streak, XPEvent for gamification
- Add User, UserSettings types
- Add Leaderboard types
- Add v1.2 course map + story/checkpoint domain types
- Total: 40+ type exports
- v1.2: Added 'story_comprehension' and 'checkpoint_question' to ExerciseKind

Verification: pnpm typecheck exits 0
```

---

# ============================================================
# AGENT_04_CONTENT_SCHEMA.md (Haiku)
# ============================================================

# Task: Complete Content Zod Schemas + Tests

**Model:** haiku  
**Task ID:** types_004  
**Creates:** 8 files  
**Depends On:** AGENT_08

## Replace File: packages/content/src/schema/index.ts

```typescript
import { z } from 'zod';

// ============================================================
// BASE SCHEMAS (FIX B1 APPLIED: Discriminated Union)
// ============================================================

export const PromptSchema = z.object({
  text: z.string().optional(),
  audio: z.string().optional(),
  image: z.string().optional(),
  slowAudio: z.string().optional(),
});

const ExerciseBaseSchema = z.object({
  id: z.string().min(1),
  prompt: PromptSchema,
  hints: z.array(z.string()).optional(),
  explanation: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).default(1),
  tags: z.array(z.string()).optional(),
});

// ============================================================
// TRANSLATE EXERCISES (tap/type)
// ============================================================

const TranslateExerciseSchema = ExerciseBaseSchema.extend({
  kind: z.enum(['translate_tap', 'translate_type']),
  choices: z.array(z.string()).optional(),
  correct: z.union([z.string(), z.array(z.string())]),
});

// ============================================================
// LISTEN EXERCISES (tap/type)
// ============================================================

const ListenExerciseSchema = ExerciseBaseSchema.extend({
  kind: z.enum(['listen_tap', 'listen_type']),
  choices: z.array(z.string()).optional(),
  correct: z.union([z.string(), z.array(z.string())]),
});

// ============================================================
// MATCH PAIRS EXERCISE (FIX B1: Proper tuple array)
// ============================================================

const MatchPairsExerciseSchema = ExerciseBaseSchema.extend({
  kind: z.literal('match_pairs'),
  correct: z.array(z.tuple([z.string(), z.string()])),
});

// ============================================================
// FILL BLANK EXERCISE
// ============================================================

const FillBlankExerciseSchema = ExerciseBaseSchema.extend({
  kind: z.literal('fill_blank'),
  correct: z.union([z.string(), z.array(z.string())]),
});

// ============================================================
// SELECT IMAGE EXERCISE
// ============================================================

const SelectImageChoiceSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
});

const SelectImageExerciseSchema = ExerciseBaseSchema.extend({
  kind: z.literal('select_image'),
  choices: z.array(SelectImageChoiceSchema),
  correct: z.string(),
});

// ============================================================
// SPEAK EXERCISE (FIX B2: Added speak)
// ============================================================

const SpeakExerciseSchema = ExerciseBaseSchema.extend({
  kind: z.literal('speak'),
  correct: z.string(),
  phonemeHints: z.array(z.string()).optional(),
});

// ============================================================
// STORY COMPREHENSION EXERCISE
// ============================================================

const StoryComprehensionExerciseSchema = ExerciseBaseSchema.extend({
  kind: z.literal('story_comprehension'),
  choices: z.array(z.string()).optional(),
  correct: z.union([z.string(), z.array(z.string())]),
  storyContext: z.string().optional(), // Reference to which story line this relates to
});

// ============================================================
// CHECKPOINT QUESTION EXERCISE
// ============================================================

const CheckpointQuestionExerciseSchema = ExerciseBaseSchema.extend({
  kind: z.literal('checkpoint_question'),
  choices: z.array(z.string()).optional(),
  correct: z.union([z.string(), z.array(z.string())]),
  assessedSkill: z.string().optional(), // e.g., 'grammar', 'vocabulary', 'listening'
});

// ============================================================
// DISCRIMINATED UNION BY 'kind' (FIX B1: Proper schema)
// ============================================================

export const ExerciseSchema = z.discriminatedUnion('kind', [
  TranslateExerciseSchema,
  ListenExerciseSchema,
  MatchPairsExerciseSchema,
  FillBlankExerciseSchema,
  SelectImageExerciseSchema,
  SpeakExerciseSchema,
  StoryComprehensionExerciseSchema,   // NEW
  CheckpointQuestionExerciseSchema,   // NEW
]);

// ============================================================
// EXERCISE KIND (FIX B2: Added speak)
// ============================================================

export const ExerciseKindSchema = z.enum([
  'translate_tap',
  'translate_type',
  'listen_tap',
  'listen_type',
  'match_pairs',
  'fill_blank',
  'select_image',
  'speak',
  'story_comprehension',   // NEW
  'checkpoint_question',   // NEW
]);

// ============================================================
// LESSON SCHEMAS
// ============================================================

export const LessonTipSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  examples: z.array(z.string()),
});

export const LessonSchema = z.object({
  id: z.string().min(1),
  unitId: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().positive(),
  exercises: z.array(ExerciseSchema).min(1),
  tips: z.array(LessonTipSchema).optional(),
});

// ============================================================
// UNIT SCHEMAS
// ============================================================

export const CEFRLevelSchema = z.enum(['a1', 'a2', 'b1', 'b2', 'c1', 'c2']);

export const UnitMetaSchema = z.object({
  id: z.string().min(1),
  level: CEFRLevelSchema,
  title: z.string().min(1),
  description: z.string(),
  order: z.number().int().positive(),
  lessonCount: z.number().int().positive(),
  estimatedMinutes: z.number().int().positive(),
});

// ============================================================
// COURSE SCHEMAS
// ============================================================

export const CourseMetaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  fromLang: z.string().length(2),
  toLang: z.string().length(2),
  levels: z.array(CEFRLevelSchema),
  totalUnits: z.number().int().positive(),
  totalLessons: z.number().int().positive(),
});

// ============================================================
// COURSE PACK SCHEMAS
// ============================================================

export const CoursePackMetaSchema = z.object({
  packId: z.string().min(1),
  version: z.string().min(1),
  checksum: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  url: z.string().min(1),
});

const PackUnitSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  lessons: z.array(LessonSchema).min(1),
});

export const CoursePackContentSchema = z.object({
  courseId: z.string().min(1),
  level: CEFRLevelSchema,
  units: z.array(PackUnitSchema).min(1),
});

export const CoursePackSchema = z.object({
  meta: CoursePackMetaSchema,
  content: CoursePackContentSchema,
});

// ============================================================
// COURSE STRUCTURE SCHEMAS (v1.2)
// ============================================================

export const NodeTypeSchema = z.enum(['lesson', 'story', 'checkpoint']);

export const CourseNodeSchema = z.object({
  id: z.string().min(1),
  type: NodeTypeSchema,
  title: z.string().min(1),
  order: z.number().int().nonnegative(),
  sectionId: z.string().min(1), // 'a1', 'a2', 'b1'
});

export const StoryLineSchema = z.object({
  speaker: z.string(),
  text: z.string(),
  audioUrl: z.string().optional(),
});

export const StorySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  lines: z.array(StoryLineSchema).min(1),
  comprehensionExercises: z.array(ExerciseSchema).min(1),
});

export const CheckpointTestSchema = z.object({
  id: z.string().min(1),
  sectionId: z.string().min(1),
  title: z.string().min(1),
  exercises: z.array(ExerciseSchema).min(5), // At least 5 questions
  passingScore: z.number().int().min(0).max(100).default(70),
});

export const CourseSectionSchema = z.object({
  id: z.string().min(1),
  level: CEFRLevelSchema,
  title: z.string().min(1),
  description: z.string(),
  order: z.number().int().nonnegative(),
  nodes: z.array(CourseNodeSchema).min(1),
});

// ============================================================
// VALIDATION HELPERS
// ============================================================

export function validateExercise(data: unknown) {
  return ExerciseSchema.safeParse(data);
}

export function validateLesson(data: unknown) {
  return LessonSchema.safeParse(data);
}

export function validateUnitMeta(data: unknown) {
  return UnitMetaSchema.safeParse(data);
}

export function validateCourseMeta(data: unknown) {
  return CourseMetaSchema.safeParse(data);
}

export function validateCoursePackMeta(data: unknown) {
  return CoursePackMetaSchema.safeParse(data);
}

export function validateCoursePack(data: unknown) {
  return CoursePackSchema.safeParse(data);
}

// ============================================================
// TYPE EXPORTS
// ============================================================

export type ExerciseKind = z.infer<typeof ExerciseKindSchema>;
export type Prompt = z.infer<typeof PromptSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type LessonTip = z.infer<typeof LessonTipSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type CEFRLevel = z.infer<typeof CEFRLevelSchema>;
export type UnitMeta = z.infer<typeof UnitMetaSchema>;
export type CourseMeta = z.infer<typeof CourseMetaSchema>;
export type CoursePackMeta = z.infer<typeof CoursePackMetaSchema>;
export type CoursePackContent = z.infer<typeof CoursePackContentSchema>;
export type CoursePack = z.infer<typeof CoursePackSchema>;
export type NodeType = z.infer<typeof NodeTypeSchema>;
export type CourseNode = z.infer<typeof CourseNodeSchema>;
export type StoryLine = z.infer<typeof StoryLineSchema>;
export type Story = z.infer<typeof StorySchema>;
export type CheckpointTest = z.infer<typeof CheckpointTestSchema>;
export type CourseSection = z.infer<typeof CourseSectionSchema>;
```

## Create File: packages/content/tests/schema.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import {
  ExerciseSchema,
  LessonSchema,
  StorySchema,
  CheckpointTestSchema,
  CourseNodeSchema,
  UnitMetaSchema,
  CourseMetaSchema,
  CoursePackMetaSchema,
  CoursePackSchema,
  validateExercise,
  validateLesson,
  validateCoursePack,
} from '../src/schema/index.js';
import type { Exercise } from '../src/schema/index.js';

describe('Content Schemas', () => {
  describe('ExerciseSchema', () => {
    it('should validate a valid translate_tap exercise', () => {
      const exercise = {
        id: 'ex-001',
        kind: 'translate_tap',
        prompt: { text: 'Привет' },
        choices: ['Hello', 'Goodbye', 'Thanks'],
        correct: 'Hello',
        difficulty: 1,
      };
      const result = ExerciseSchema.safeParse(exercise);
      expect(result.success).toBe(true);
    });

    it('should validate exercise with multiple correct answers', () => {
      const exercise = {
        id: 'ex-002',
        kind: 'translate_type',
        prompt: { text: 'Пока' },
        correct: ['Bye', 'Goodbye', 'See you'],
        difficulty: 2,
      };
      const result = ExerciseSchema.safeParse(exercise);
      expect(result.success).toBe(true);
    });

    it('should validate match_pairs with proper tuple array (FIX B1)', () => {
      const exercise: Exercise = {
        id: 'ex-003',
        kind: 'match_pairs',
        prompt: { text: 'Match pairs' },
        correct: [['hello', 'привет'], ['goodbye', 'пока']],
        difficulty: 1,
      };
      const result = ExerciseSchema.safeParse(exercise);
      expect(result.success).toBe(true);
    });

    it('should validate speak exercise (FIX B2)', () => {
      const exercise = {
        id: 'ex-004',
        kind: 'speak',
        prompt: { text: 'Pronounce: hello' },
        correct: 'hello',
        phonemeHints: ['h-e-l-o'],
        difficulty: 2,
      };
      const result = ExerciseSchema.safeParse(exercise);
      expect(result.success).toBe(true);
    });

    it('should reject exercise without id', () => {
      const exercise = {
        kind: 'translate_tap',
        prompt: { text: 'Test' },
        correct: 'Test',
      };
      const result = ExerciseSchema.safeParse(exercise);
      expect(result.success).toBe(false);
    });

    it('should reject invalid exercise kind', () => {
      const exercise = {
        id: 'ex-005',
        kind: 'invalid_kind',
        prompt: { text: 'Test' },
        correct: 'Test',
      };
      const result = ExerciseSchema.safeParse(exercise);
      expect(result.success).toBe(false);
    });

    it('should reject difficulty outside 1-5 range', () => {
      const exercise = {
        id: 'ex-006',
        kind: 'translate_tap',
        prompt: { text: 'Test' },
        correct: 'Test',
        difficulty: 10,
      };
      const result = ExerciseSchema.safeParse(exercise);
      expect(result.success).toBe(false);
    });
  });

  describe('LessonSchema', () => {
    it('should validate a valid lesson', () => {
      const lesson = {
        id: 'lesson-01',
        unitId: 'unit-01',
        title: 'Greetings',
        order: 1,
        exercises: [
          {
            id: 'ex-001',
            kind: 'translate_tap',
            prompt: { text: 'Hello' },
            correct: 'Привет',
            difficulty: 1,
          },
        ],
      };
      const result = LessonSchema.safeParse(lesson);
      expect(result.success).toBe(true);
    });

    it('should reject lesson with empty exercises', () => {
      const lesson = {
        id: 'lesson-01',
        unitId: 'unit-01',
        title: 'Empty',
        order: 1,
        exercises: [],
      };
      const result = LessonSchema.safeParse(lesson);
      expect(result.success).toBe(false);
    });
  });

  describe('UnitMetaSchema', () => {
    it('should validate a valid unit meta', () => {
      const unit = {
        id: 'a1_unit_01',
        level: 'a1',
        title: 'Basics',
        description: 'Learn the basics',
        order: 1,
        lessonCount: 5,
        estimatedMinutes: 30,
      };
      const result = UnitMetaSchema.safeParse(unit);
      expect(result.success).toBe(true);
    });
  });

  describe('CourseMetaSchema', () => {
    it('should validate a valid course meta', () => {
      const course = {
        id: 'ru-en',
        name: 'English for Russian Speakers',
        fromLang: 'ru',
        toLang: 'en',
        levels: ['a1', 'a2', 'b1'],
        totalUnits: 10,
        totalLessons: 50,
      };
      const result = CourseMetaSchema.safeParse(course);
      expect(result.success).toBe(true);
    });

    it('should reject invalid language code', () => {
      const course = {
        id: 'ru-en',
        name: 'Test',
        fromLang: 'russian',
        toLang: 'en',
        levels: ['a1'],
        totalUnits: 1,
        totalLessons: 1,
      };
      const result = CourseMetaSchema.safeParse(course);
      expect(result.success).toBe(false);
    });
  });

  describe('CoursePackMetaSchema', () => {
    it('should validate a valid pack meta', () => {
      const meta = {
        packId: 'ru-en-a1-unit-01',
        version: 'v1',
        checksum: 'abc123',
        sizeBytes: 1024,
        url: '/packs/ru-en-a1-unit-01/v1',
      };
      const result = CoursePackMetaSchema.safeParse(meta);
      expect(result.success).toBe(true);
    });
  });

  describe('CoursePackSchema', () => {
    it('should validate a valid course pack', () => {
      const pack = {
        meta: {
          packId: 'ru-en-a1-unit-01',
          version: 'v1',
          checksum: 'abc123',
          sizeBytes: 1024,
          url: '/packs/ru-en-a1-unit-01/v1',
        },
        content: {
          courseId: 'ru-en',
          level: 'a1',
          units: [
            {
              id: 'a1_unit_01',
              title: 'Basics',
              lessons: [
                {
                  id: 'lesson-01',
                  unitId: 'a1_unit_01',
                  title: 'Greetings',
                  order: 1,
                  exercises: [
                    {
                      id: 'ex-001',
                      kind: 'translate_tap',
                      prompt: { text: 'Hello' },
                      correct: 'Привет',
                      difficulty: 1,
                    },
                  ],
                },
              ],
            },
          ],
        },
      };
      const result = CoursePackSchema.safeParse(pack);
      expect(result.success).toBe(true);
    });
  });

  describe('StorySchema', () => {
    it('should validate a valid story', () => {
      const story = {
        id: 'story-01',
        title: 'At the Cafe',
        lines: [
          { speaker: 'Waiter', text: 'Hello! What would you like?', audioUrl: '/audio/waiter-1.mp3' },
          { speaker: 'Customer', text: 'Coffee, please.' },
        ],
        comprehensionExercises: [
          {
            id: 'story-ex-01',
            kind: 'story_comprehension',
            prompt: { text: 'What did the customer order?' },
            correct: 'Coffee',
            difficulty: 1,
          },
        ],
      };
      const result = StorySchema.safeParse(story);
      expect(result.success).toBe(true);
    });
  });

  describe('CheckpointTestSchema', () => {
    it('should validate a valid checkpoint test', () => {
      const checkpoint = {
        id: 'checkpoint-a1',
        sectionId: 'a1',
        title: 'A1 Checkpoint Test',
        exercises: Array.from({ length: 5 }, (_, i) => ({
          id: `cp-ex-${i}`,
          kind: 'checkpoint_question',
          prompt: { text: `Question ${i + 1}` },
          correct: 'answer',
          difficulty: 1,
        })),
        passingScore: 70,
      };
      const result = CheckpointTestSchema.safeParse(checkpoint);
      expect(result.success).toBe(true);
    });

    it('should reject checkpoint with fewer than 5 exercises', () => {
      const checkpoint = {
        id: 'checkpoint-a1',
        sectionId: 'a1',
        title: 'A1 Checkpoint Test',
        exercises: [
          { id: 'ex-1', kind: 'checkpoint_question', prompt: { text: 'Q1' }, correct: 'A', difficulty: 1 },
        ],
        passingScore: 70,
      };
      const result = CheckpointTestSchema.safeParse(checkpoint);
      expect(result.success).toBe(false);
    });
  });

  describe('CourseNodeSchema', () => {
    it('should validate story node', () => {
      const node = { id: 'story-1', type: 'story', title: 'At the Cafe', order: 5, sectionId: 'a1' };
      expect(CourseNodeSchema.safeParse(node).success).toBe(true);
    });

    it('should validate checkpoint node', () => {
      const node = { id: 'cp-a1', type: 'checkpoint', title: 'A1 Test', order: 10, sectionId: 'a1' };
      expect(CourseNodeSchema.safeParse(node).success).toBe(true);
    });
  });

  describe('Validation Helpers', () => {
    it('validateExercise should return success for valid data', () => {
      const result = validateExercise({
        id: 'ex-001',
        kind: 'translate_tap',
        prompt: { text: 'Test' },
        correct: 'Test',
        difficulty: 1,
      });
      expect(result.success).toBe(true);
    });

    it('validateLesson should return error details for invalid data', () => {
      const result = validateLesson({
        id: 'lesson-01',
        // Missing required fields
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('validateCoursePack should return success for valid data', () => {
      const result = validateCoursePack({
        meta: {
          packId: 'ru-en-a1-unit-01',
          version: 'v1',
          checksum: 'abc123',
          sizeBytes: 1024,
          url: '/packs/ru-en-a1-unit-01/v1',
        },
        content: {
          courseId: 'ru-en',
          level: 'a1',
          units: [
            {
              id: 'a1_unit_01',
              title: 'Basics',
              lessons: [
                {
                  id: 'lesson-01',
                  unitId: 'a1_unit_01',
                  title: 'Greetings',
                  order: 1,
                  exercises: [
                    {
                      id: 'ex-001',
                      kind: 'translate_tap',
                      prompt: { text: 'Hello' },
                      correct: 'Привет',
                      difficulty: 1,
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
      expect(result.success).toBe(true);
    });
  });
});
```

## Create File: packages/content/vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

## EXACT Verification

```bash
cd packages/content

# Step 1: TypeScript
pnpm typecheck
echo "✓ Step 1: typecheck"

# Step 2: Tests (exit 0)
pnpm test
echo "✓ Step 2: tests"

# Step 3: Verify discriminated union is in place
grep -q "discriminatedUnion" src/schema/index.ts && echo "✓ Step 3: discriminatedUnion found (FIX B1)"

# Step 4: Verify story + checkpoint kinds are in schema
grep -q "'story_comprehension'" src/schema/index.ts && echo "✓ Step 4a: 'story_comprehension' found"
grep -q "'checkpoint_question'" src/schema/index.ts && echo "✓ Step 4b: 'checkpoint_question' found"
grep -q "'speak'" src/schema/index.ts && echo "✓ Step 4c: 'speak' found"

# Step 5: Validate content
pnpm validate
echo "✓ Step 5: validation"
```

## SUCCESS Criteria

- [ ] `pnpm test` exits 0
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm validate` exits 0
- [ ] ✅ FIX B1 APPLIED: discriminatedUnion schema for exercises
- [ ] ✅ v1.2: story + checkpoint schemas and kinds added
- [ ] ✅ FIX B2 APPLIED: 'speak' present in ExerciseKindSchema
- [ ] All validation helpers exported

## Git Commit

```
feat(content): add complete Zod schemas with tests

- Add discriminated union for exercise schemas by 'kind' (FIX B1)
- Add proper tuple array for match_pairs [left, right] (FIX B1)
- Add speak exercise type with phonemeHints (FIX B2)
- Add story + checkpoint exercise kinds + schemas (v1.2)
- Add ExerciseKindSchema with v1.2 kinds included
- Add LessonSchema with tips support
- Add UnitMetaSchema and CourseMetaSchema
- Add CoursePackMetaSchema and CoursePackSchema for versioned packs
- Add v1.2 course structure schemas (CourseNode, Story, CheckpointTest, CourseSection)
- Add validation helper functions
- Add unit tests covering all schemas and edge cases

Verification: pnpm test exits 0
```

---

# ============================================================
# AGENT_09_TYPES_API.md (Haiku)
# ============================================================

# Task: API Contract Types

**Model:** haiku  
**Task ID:** types_009  
**Creates:** 3 files  
**Depends On:** AGENT_08B

## Create File: packages/types/src/api.ts

```typescript
// ============================================================
// API REQUEST/RESPONSE TYPES
// ============================================================

// Health
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  version: string;
}

// Auth
export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
}

export interface RegisterResponse extends LoginResponse {
  verifyToken: string;
}

export type AuthResponse = LoginResponse | RegisterResponse;

export interface RefreshRequest {
  refreshToken: string;
}

// User
export interface UserDTO {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  isPremium: boolean;
  createdAt: string;
}

export interface UpdateUserRequest {
  displayName?: string;
  avatarUrl?: string;
}

// Policy
export type LimiterType = 'hearts' | 'energy';

export interface PolicyConfigBase {
  limiterType: LimiterType;
  updatedAt: string;
}

export interface HeartsPolicyConfig extends PolicyConfigBase {
  limiterType: 'hearts';
  maxHearts: number;
  refillHours: number;
  practiceRefillEnabled: boolean;
}

export interface EnergyPolicyConfig extends PolicyConfigBase {
  limiterType: 'energy';
  maxEnergy: number;
  rechargeHours: number;
  energyCostPerLesson: number;
  bonusEnergy: number;
  correctStreakForBonus: number;
}

export type PolicyConfig = HeartsPolicyConfig | EnergyPolicyConfig;

export interface PolicyConfigResponse {
  policy: PolicyConfig;
}

// Entitlements
export interface EntitlementsResponse {
  userId: string;
  isPremium: boolean;
  planId?: 'monthly' | 'annual' | 'lifetime';
  expiresAt?: string;
  features: string[];
}

export interface PromoCodeRedeemRequest {
  code: string;
}

export interface PromoCodeRedeemResponse {
  ok: true;
  code: string;
  entitlements: EntitlementsResponse;
}

export interface PromoCodeRedeemError {
  error: true;
  reason: 'invalid' | 'already_used';
}

export type PromoCodeRedeemResult = PromoCodeRedeemResponse | PromoCodeRedeemError;

// Progress
export interface ProgressDTO {
  userId: string;
  totalXp: number;
  level: number;
  streak: number;
  longestStreak: number;
  completedLessons: string[];
  lastActivityDate: string;
}

export interface SyncProgressRequest {
  sessions: SessionResultDTO[];
  lastSyncTimestamp: number;
}

export interface SessionResultDTO {
  sessionId: string;
  lessonId: string;
  totalExercises: number;
  correctCount: number;
  incorrectCount: number;
  xpEarned: number;
  durationMs: number;
  completedAt: string;
}

// Sync
export interface SyncItem {
  id: string;
  type: string;
  occurredAt: string;
  payload: Record<string, unknown>;
}

export interface SyncReconcileRequest {
  items: SyncItem[];
}

export interface SyncReconcileResponse {
  acked: string[];
  failed: { id: string; reason: string }[];
}

// Lessons
export interface LessonDTO {
  id: string;
  unitId: string;
  title: string;
  order: number;
  exerciseCount: number;
  isCompleted: boolean;
  bestScore?: number;
}

export interface StartLessonResponse {
  sessionId: string;
  exercises: ExerciseDTO[];
}

export interface ExerciseDTO {
  id: string;
  kind: string;
  prompt: {
    text?: string;
    audioUrl?: string;
    imageUrl?: string;
  };
  choices?: string[];
  difficulty: number;
}

// Story
export interface StoryLineDTO {
  speaker: string;
  text: string;
  audioUrl?: string;
}

export interface StoryDTO {
  id: string;
  title: string;
  lines: StoryLineDTO[];
  exerciseCount: number;
}

export interface StartStoryResponse {
  sessionId: string;
  story: StoryDTO;
  exercises: ExerciseDTO[];
}

// Checkpoint
export interface CheckpointDTO {
  id: string;
  sectionId: string;
  title: string;
  exerciseCount: number;
  passingScore: number;
}

export interface StartCheckpointResponse {
  sessionId: string;
  checkpoint: CheckpointDTO;
  exercises: ExerciseDTO[];
}

export interface CheckpointResultDTO {
  checkpointId: string;
  score: number;
  passed: boolean;
  completedAt: string;
  unlockedSection?: string; // Next section unlocked if passed
}

// Course Map
export interface CourseNodeDTO {
  id: string;
  type: 'lesson' | 'story' | 'checkpoint';
  title: string;
  order: number;
  isLocked: boolean;
  isCompleted: boolean;
}

export interface CourseSectionDTO {
  id: string;
  level: 'a1' | 'a2' | 'b1' | 'b2';
  title: string;
  description: string;
  nodes: CourseNodeDTO[];
  isUnlocked: boolean;
  completedNodes: number;
  totalNodes: number;
}

export interface CourseMapResponse {
  courseId: string;
  sections: CourseSectionDTO[];
  currentNodeId: string | null;
  totalProgress: number; // 0-100 percentage
}

export interface SubmitAnswerRequest {
  sessionId: string;
  exerciseId: string;
  answer: string;
  timeSpentMs: number;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  gradeType: 'correct' | 'incorrect' | 'typo';
  feedback: string;
  correctAnswer?: string;
  xpEarned: number;
}

// Course Packs
export interface CoursePackMeta {
  packId: string;
  version: string;
  checksum: string;
  sizeBytes: number;
  url: string;
}

export interface CoursePackManifestResponse {
  packs: CoursePackMeta[];
}

export interface CoursePack {
  meta: CoursePackMeta;
  content: {
    courseId: string;
    level: string;
    units: Array<{
      id: string;
      title: string;
      lessons: Array<{
        id: string;
        title: string;
      }>;
    }>;
  };
}

// Leaderboard
export interface LeaderboardRequest {
  period: 'weekly' | 'monthly' | 'allTime';
  type: 'global' | 'friends';
  limit?: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntryDTO[];
  currentUserRank?: number;
  totalParticipants: number;
}

export interface LeaderboardEntryDTO {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  xp: number;
  streak: number;
}

// Payments
export interface CreateSubscriptionRequest {
  planId: 'monthly' | 'annual' | 'lifetime';
  paymentMethod: 'mir' | 'sbp' | 'card';
}

export interface SubscriptionDTO {
  id: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// Notifications
export type NotificationProvider = 'webpush' | 'fcm' | 'rustore';

export interface RegisterDeviceRequest {
  provider: NotificationProvider;
  token: string;
  deviceId: string;
  platform: 'web' | 'android' | 'ios';
}

export interface RegisterDeviceResponse {
  ok: true;
}

// Error
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

## Create File: packages/types/src/auth.ts

```typescript
// ============================================================
// AUTH TYPES
// ============================================================

export interface JWTPayload {
  sub: string; // userId
  email: string;
  username: string;
  isPremium: boolean;
  iat: number;
  exp: number;
}

export interface AuthSession {
  userId: string;
  deviceId: string;
  createdAt: number;
  expiresAt: number;
  isValid: boolean;
}

export interface DeviceInfo {
  deviceId: string;
  platform: 'web' | 'android' | 'ios';
  userAgent: string;
  lastSeenAt: number;
}

export type AuthProvider = 'email' | 'vk' | 'yandex';

export interface OAuthState {
  provider: AuthProvider;
  redirectUri: string;
  nonce: string;
}
```

## Create File: packages/types/src/analytics.ts

```typescript
// ============================================================
// ANALYTICS EVENT TYPES
// ============================================================

export type AnalyticsEventName =
  | 'app_open'
  | 'lesson_started'
  | 'lesson_completed'
  | 'exercise_answered'
  | 'streak_extended'
  | 'streak_broken'
  | 'premium_shown'
  | 'premium_purchased'
  | 'premium_cancelled'
  | 'achievement_unlocked'
  | 'error_occurred';

export interface BaseAnalyticsEvent {
  name: AnalyticsEventName;
  timestamp: number;
  userId?: string;
  deviceId: string;
  sessionId: string;
}

export interface LessonStartedEvent extends BaseAnalyticsEvent {
  name: 'lesson_started';
  props: {
    lessonId: string;
    unitId: string;
    isFirstTime: boolean;
  };
}

export interface LessonCompletedEvent extends BaseAnalyticsEvent {
  name: 'lesson_completed';
  props: {
    lessonId: string;
    unitId: string;
    xpEarned: number;
    accuracy: number;
    durationMs: number;
    mistakes: number;
  };
}

export interface ExerciseAnsweredEvent extends BaseAnalyticsEvent {
  name: 'exercise_answered';
  props: {
    exerciseId: string;
    exerciseKind: string;
    isCorrect: boolean;
    timeSpentMs: number;
  };
}

export interface StreakEvent extends BaseAnalyticsEvent {
  name: 'streak_extended' | 'streak_broken';
  props: {
    previousStreak: number;
    newStreak: number;
  };
}

export interface PremiumEvent extends BaseAnalyticsEvent {
  name: 'premium_shown' | 'premium_purchased' | 'premium_cancelled';
  props: {
    trigger?: string;
    planId?: string;
    amount?: number;
  };
}

export interface ErrorEvent extends BaseAnalyticsEvent {
  name: 'error_occurred';
  props: {
    errorCode: string;
    errorMessage: string;
    stack?: string;
  };
}

export type AnalyticsEvent =
  | LessonStartedEvent
  | LessonCompletedEvent
  | ExerciseAnsweredEvent
  | StreakEvent
  | PremiumEvent
  | ErrorEvent;
```

## Update File: packages/types/src/index.ts

```typescript
export * from './api.js';
export * from './auth.js';
export * from './analytics.js';
```

## EXACT Verification

```bash
cd packages/types

# Step 1: TypeScript
pnpm typecheck
echo "✓ Step 1: typecheck"

# Step 2: Count exports (should be 30+)
grep -c "^export" src/*.ts
echo "✓ Step 2: exports counted"

# Step 3: Build
pnpm build
echo "✓ Step 3: build"
```

## SUCCESS Criteria

- [ ] `pnpm typecheck` exits 0
- [ ] 30+ total exports across all files
- [ ] No `any` types
- [ ] All DTOs have proper naming

## Git Commit

```
feat(types): add API contract types

- Add api.ts with all request/response types
- Add auth.ts with JWT and auth session types
- Add analytics.ts with typed events
- Add policy, entitlements, packs, sync, and notification DTOs
- Export all from index.ts
- Total: 30+ type exports

Verification: pnpm typecheck exits 0
```

---

# ============================================================
# AGENT_10_ENGINE_GRADING.md (Sonnet)
# ============================================================

# Task: Lesson Engine - Grading System

**Model:** sonnet  
**Task ID:** engine_010  
**Creates:** 5 files  
**Depends On:** AGENT_03
**Modifies:** packages/lesson-engine/tsconfig.json (adds vitest/globals types)

## Update File: packages/lesson-engine/tsconfig.json

Add `"types": ["vitest/globals"]` to compilerOptions:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "types": ["vitest/globals"]
  },
  "include": ["src", "tests"],
  "exclude": ["node_modules", "dist"]
}
```

**Why:** TypeScript recognizes vitest globals (`describe`, `it`, `expect`) without explicit imports.

```typescript
import type { Exercise, GradeResult, GradingConfig, MatchPair } from '../models/index.js';
import { DEFAULT_GRADING_CONFIG } from '../models/index.js';

/**
 * Normalize text for comparison
 * - Lowercase
 * - Trim whitespace
 * - Collapse multiple spaces
 * - Optionally remove punctuation
 */
export function normalizeText(
  text: string,
  config: GradingConfig = DEFAULT_GRADING_CONFIG
): string {
  let normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');

  if (config.ignorePunctuation) {
    normalized = normalized.replace(/[.,!?;:'"()-]/g, '');
  }

  return normalized;
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function calculateLevenshtein(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Calculate similarity ratio (0-1)
 */
export function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const distance = calculateLevenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return 1 - distance / maxLen;
}

/**
 * Check if answer matches any of the correct answers
 */
function matchesCorrectAnswer(
  answer: string,
  correct: string | string[],
  config: GradingConfig
): { exact: boolean; typo: boolean; correctAnswer: string } {
  const normalizedAnswer = normalizeText(answer, config);
  const correctAnswers = Array.isArray(correct) ? correct : [correct];

  for (const correctAns of correctAnswers) {
    const normalizedCorrect = normalizeText(correctAns, config);

    if (normalizedAnswer === normalizedCorrect) {
      return { exact: true, typo: false, correctAnswer: correctAns };
    }

    const similarity = calculateSimilarity(normalizedAnswer, normalizedCorrect);
    if (similarity >= config.typoThreshold) {
      return { exact: false, typo: true, correctAnswer: correctAns };
    }
  }

  const firstCorrect = correctAnswers[0];
  return { exact: false, typo: false, correctAnswer: firstCorrect };
}

/**
 * Grade a user's answer against an exercise
 * NOTE: match_pairs must use gradeMatchPairs (gradeAnswer throws).
 */
export function gradeAnswer(
  exercise: Exercise,
  answer: string,
  config: GradingConfig = DEFAULT_GRADING_CONFIG
): GradeResult {
  if (exercise.kind === 'match_pairs') {
    throw new Error('Use gradeMatchPairs for match_pairs');
  }

  const { exact, typo, correctAnswer } = matchesCorrectAnswer(
    answer,
    exercise.correct,
    config
  );

  if (exact) {
    return {
      type: 'correct',
      isCorrect: true,
      feedback: 'Отлично!',
      userAnswer: answer,
    };
  }

  if (typo) {
    return {
      type: 'typo',
      isCorrect: true,
      feedback: `Почти! Правильно: ${correctAnswer}`,
      correctAnswer,
      userAnswer: answer,
      similarity: calculateSimilarity(
        normalizeText(answer, config),
        normalizeText(correctAnswer, config)
      ),
    };
  }

  return {
    type: 'incorrect',
    isCorrect: false,
    feedback: `Неверно. Правильный ответ: ${correctAnswer}`,
    correctAnswer,
    userAnswer: answer,
    similarity: calculateSimilarity(
      normalizeText(answer, config),
      normalizeText(correctAnswer, config)
    ),
  };
}

/**
 * Grade a match pairs exercise
 */
export function gradeMatchPairs(
  userPairs: readonly MatchPair[],
  correctPairs: readonly MatchPair[],
  config: GradingConfig = DEFAULT_GRADING_CONFIG
): { correct: number; total: number; results: boolean[] } {
  const results: boolean[] = [];
  let correct = 0;

  for (const [userLeft, userRight] of userPairs) {
    const normalizedUserLeft = normalizeText(userLeft, config);
    const normalizedUserRight = normalizeText(userRight, config);

    const isCorrect = correctPairs.some(([left, right]) => {
      const normalizedLeft = normalizeText(left, config);
      const normalizedRight = normalizeText(right, config);
      return normalizedUserLeft === normalizedLeft && normalizedUserRight === normalizedRight;
    });

    results.push(isCorrect);
    if (isCorrect) correct++;
  }

  return { correct, total: correctPairs.length, results };
}
```

## Create File: packages/lesson-engine/tests/grading.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  calculateLevenshtein,
  calculateSimilarity,
  gradeAnswer,
  gradeMatchPairs,
} from '../src/grading/index.js';
import type { Exercise, GradingConfig, MatchPair } from '../src/models/index.js';
import { DEFAULT_GRADING_CONFIG } from '../src/models/index.js';

const createExercise = (correct: string | string[]): Exercise => ({
  id: 'test-ex',
  kind: 'translate_type',
  prompt: { text: 'Test' },
  correct,
  difficulty: 1,
});

describe('Grading System', () => {
  describe('normalizeText', () => {
    it('should lowercase text', () => {
      expect(normalizeText('HELLO')).toBe('hello');
    });

    it('should trim whitespace', () => {
      expect(normalizeText('  hello  ')).toBe('hello');
    });

    it('should collapse multiple spaces', () => {
      expect(normalizeText('hello   world')).toBe('hello world');
    });

    it('should remove punctuation by default', () => {
      expect(normalizeText('Hello, world!')).toBe('hello world');
    });

    it('should keep punctuation when configured', () => {
      const config: GradingConfig = { ...DEFAULT_GRADING_CONFIG, ignorePunctuation: false };
      expect(normalizeText('Hello, world!', config)).toBe('hello, world!');
    });
  });

  describe('calculateLevenshtein', () => {
    it('should return 0 for identical strings', () => {
      expect(calculateLevenshtein('hello', 'hello')).toBe(0);
    });

    it('should return correct distance for one char difference', () => {
      expect(calculateLevenshtein('hello', 'helo')).toBe(1);
      expect(calculateLevenshtein('hello', 'hellp')).toBe(1);
    });

    it('should handle empty strings', () => {
      expect(calculateLevenshtein('', 'abc')).toBe(3);
      expect(calculateLevenshtein('abc', '')).toBe(3);
    });

    it('should handle completely different strings', () => {
      expect(calculateLevenshtein('abc', 'xyz')).toBe(3);
    });
  });

  describe('calculateSimilarity', () => {
    it('should return 1 for identical strings', () => {
      expect(calculateSimilarity('hello', 'hello')).toBe(1);
    });

    it('should return 0 for empty string comparison', () => {
      expect(calculateSimilarity('', 'hello')).toBe(0);
    });

    it('should return high similarity for typos', () => {
      const sim = calculateSimilarity('hello', 'helo');
      expect(sim).toBeGreaterThan(0.7);
    });
  });

  describe('gradeAnswer', () => {
    it('should return correct for exact match', () => {
      const exercise = createExercise('Hello');
      const result = gradeAnswer(exercise, 'Hello');

      expect(result.type).toBe('correct');
      expect(result.isCorrect).toBe(true);
    });

    it('should return correct for case-insensitive match', () => {
      const exercise = createExercise('Hello');
      const result = gradeAnswer(exercise, 'hello');

      expect(result.type).toBe('correct');
      expect(result.isCorrect).toBe(true);
    });

    it('should return typo for minor mistake', () => {
      const exercise = createExercise('beautiful');
      const result = gradeAnswer(exercise, 'beatiful');

      expect(result.type).toBe('typo');
      expect(result.isCorrect).toBe(true);
      expect(result.correctAnswer).toBe('beautiful');
    });

    it('should return incorrect for wrong answer', () => {
      const exercise = createExercise('Hello');
      const result = gradeAnswer(exercise, 'Goodbye');

      expect(result.type).toBe('incorrect');
      expect(result.isCorrect).toBe(false);
      expect(result.correctAnswer).toBe('Hello');
    });

    it('should accept any of multiple correct answers', () => {
      const exercise = createExercise(['Hi', 'Hello', 'Hey']);

      expect(gradeAnswer(exercise, 'Hi').isCorrect).toBe(true);
      expect(gradeAnswer(exercise, 'Hello').isCorrect).toBe(true);
      expect(gradeAnswer(exercise, 'Hey').isCorrect).toBe(true);
    });

    it('should ignore extra whitespace', () => {
      const exercise = createExercise('Hello world');
      const result = gradeAnswer(exercise, '  hello   world  ');

      expect(result.type).toBe('correct');
    });
  });

  describe('gradeMatchPairs', () => {
    const correctPairs: MatchPair[] = [
      ['cat', 'кошка'],
      ['dog', 'собака'],
      ['bird', 'птица'],
    ];

    it('should grade all correct pairs', () => {
      const userPairs: MatchPair[] = [
        ['cat', 'кошка'],
        ['dog', 'собака'],
        ['bird', 'птица'],
      ];
      const result = gradeMatchPairs(userPairs, correctPairs);

      expect(result.correct).toBe(3);
      expect(result.total).toBe(3);
      expect(result.results).toEqual([true, true, true]);
    });

    it('should detect incorrect pairs', () => {
      const userPairs: MatchPair[] = [
        ['cat', 'собака'], // Wrong
        ['dog', 'собака'], // Correct
        ['bird', 'кошка'], // Wrong
      ];
      const result = gradeMatchPairs(userPairs, correctPairs);

      expect(result.correct).toBe(1);
      expect(result.results).toEqual([false, true, false]);
    });
  });
});
```

## EXACT Verification

```bash
cd packages/lesson-engine

# Step 1: TypeScript
pnpm typecheck
echo "✓ Step 1: typecheck"

# Step 2: Run grading tests (exit 0)
pnpm test -- grading.test.ts
echo "✓ Step 2: grading tests"

# Step 3: All tests
pnpm test
echo "✓ Step 3: all tests"

# Step 4: Build
pnpm build
echo "✓ Step 4: build"
```

## SUCCESS Criteria

- [ ] `pnpm test -- grading.test.ts` exits 0
- [ ] `pnpm typecheck` exits 0
- [ ] All grading functions exported
- [ ] Typo detection works (similarity > 0.85)

## Git Commit

```
feat(engine): implement grading system

- Add normalizeText with punctuation handling
- Add calculateLevenshtein for edit distance
- Add calculateSimilarity for typo detection
- Add gradeAnswer for single exercises
- Add gradeMatchPairs for match exercises
- Add 13 unit tests covering all cases

Verification: pnpm test exits 0
```

---

# ============================================================
# AGENT_11_ENGINE_SESSION.md (Sonnet) (FIX B4 APPLIED)
# ============================================================

# Task: Lesson Engine - Session Generator

**Model:** sonnet  
**Task ID:** engine_011  
**Depends On:** AGENT_03 (models complete)

## Precheck

```bash
cd packages/lesson-engine
grep -q "export { createSession }" src/index.ts || { echo "AGENT_03 not applied"; exit 1; }
```

## Replace File: packages/lesson-engine/src/session/index.ts

```typescript
import { v4 as uuidv4 } from 'uuid';
import type {
  Exercise,
  Lesson,
  Session,
  SessionConfig,
  GradeResult,
  UserAnswer,
} from '../models/index.js';
import { DEFAULT_SESSION_CONFIG } from '../models/index.js';

/**
 * Create a new session with given exercises
 */
export function createSession(
  lessonId: string,
  userId: string,
  exercises: Exercise[],
  config: SessionConfig = DEFAULT_SESSION_CONFIG
): Session {
  return {
    id: uuidv4(),
    lessonId,
    userId,
    exercises,
    currentIndex: 0,
    answers: new Map(),
    hearts: config.maxHearts,
    xpEarned: 0,
    startedAt: Date.now(),
  };
}

/**
 * Generate a lesson session for a user
 */
export function generateSession(
  lesson: Lesson,
  userId: string,
  _userProgress: unknown,
  config: SessionConfig = DEFAULT_SESSION_CONFIG
): Session {
  const selectedExercises = lesson.exercises;
  return createSession(lesson.id, userId, selectedExercises, config);
}

/**
 * Get current exercise in session
 */
export function getCurrentExercise(session: Session): Exercise | null {
  if (session.currentIndex >= session.exercises.length) {
    return null;
  }
  return session.exercises[session.currentIndex];
}

/**
 * Submit an answer and update session state
 * FIX B4: Removed `any`, properly typed GradeResult, use SessionConfig for XP
 */
export function submitAnswer(
  session: Session,
  answer: UserAnswer['answer'],
  gradeResult: GradeResult,  // FIX B4: Properly typed, was 'any'
  config: SessionConfig = DEFAULT_SESSION_CONFIG  // FIX B4: Use config for XP
): {
  isCorrect: boolean;
  heartsRemaining: number;
  xpGained: number;
  session: Session;
} {
  const exercise = getCurrentExercise(session);
  if (!exercise) {
    throw new Error('No current exercise');
  }

  // FIX B4: Calculate XP from config, not hardcoded
  let xpGained = 0;
  if (gradeResult.isCorrect) {
    xpGained = gradeResult.type === 'typo' 
      ? config.xpPerTypo       // FIX B4: FROM CONFIG
      : config.xpPerCorrect;   // FIX B4: FROM CONFIG
  }

  // FIX B4: Create properly typed UserAnswer
  const userAnswer: UserAnswer = {
    exerciseId: exercise.id,
    answer,
    timestamp: Date.now(),
    gradeResult,
    timeSpentMs: 0,
  };

  session.answers.set(exercise.id, userAnswer);

  if (!gradeResult.isCorrect) {
    session.hearts -= 1;
  }

  session.xpEarned += xpGained;
  session.currentIndex += 1;

  return {
    isCorrect: gradeResult.isCorrect,
    heartsRemaining: session.hearts,
    xpGained,
    session,
  };
}

/**
 * Check if session is complete
 */
export function isSessionComplete(session: Session): boolean {
  return session.currentIndex >= session.exercises.length;
}

/**
 * Get session summary
 */
export function getSessionSummary(session: Session) {
  const totalAnswers = session.answers.size;
  const correctAnswers = Array.from(session.answers.values()).filter(
    (a) => a.gradeResult.isCorrect
  ).length;
  const accuracy =
    totalAnswers === 0 ? 0 : Math.round((correctAnswers / totalAnswers) * 100);

  return {
    duration: Math.floor((Date.now() - session.startedAt) / 1000),
    totalExercises: session.exercises.length,
    completed: session.currentIndex,
    correct: correctAnswers,
    incorrect: totalAnswers - correctAnswers,
    accuracy,
    xpEarned: session.xpEarned,
    heartsRemaining: session.hearts,
  };
}
```

## Create File: packages/lesson-engine/tests/session.test.ts

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSession,
  getCurrentExercise,
  submitAnswer,
  isSessionComplete,
  getSessionSummary,
} from '../src/session/index.js';
import type { Exercise, Session, GradeResult } from '../src/models/index.js';
import { DEFAULT_SESSION_CONFIG } from '../src/models/index.js';

const mockExercises: Exercise[] = [
  {
    id: 'ex-1',
    kind: 'translate_tap',
    prompt: { text: 'hello' },
    choices: ['привет', 'пока', 'спасибо'],
    correct: 'привет',
    difficulty: 1,
  },
  {
    id: 'ex-2',
    kind: 'translate_type',
    prompt: { text: 'apple' },
    correct: 'яблоко',
    difficulty: 1,
  },
  {
    id: 'ex-3',
    kind: 'translate_tap',
    prompt: { text: 'goodbye' },
    choices: ['привет', 'пока', 'спасибо'],
    correct: 'пока',
    difficulty: 2,
  },
];

const mockGradeCorrect: GradeResult = { type: 'correct', isCorrect: true, feedback: 'Correct!' };
const mockGradeIncorrect: GradeResult = { type: 'incorrect', isCorrect: false, feedback: 'Try again' };

describe('Session Management', () => {
  let session: Session;

  beforeEach(() => {
    session = createSession('lesson-1', 'user-1', mockExercises);
  });

  describe('createSession', () => {
    it('should create session with correct initial state', () => {
      expect(session.id).toBeDefined();
      expect(session.lessonId).toBe('lesson-1');
      expect(session.userId).toBe('user-1');
      expect(session.currentIndex).toBe(0);
      expect(session.answers.size).toBe(0);
      expect(session.hearts).toBe(3);
      expect(session.xpEarned).toBe(0);
    });

    it('should generate unique session IDs', () => {
      const session2 = createSession('lesson-1', 'user-1', mockExercises);
      expect(session.id).not.toBe(session2.id);
    });

    it('should use custom config', () => {
      const customConfig = { ...DEFAULT_SESSION_CONFIG, maxHearts: 5 };
      const customSession = createSession('lesson-1', 'user-1', mockExercises, customConfig);
      expect(customSession.hearts).toBe(5);
    });
  });

  describe('getCurrentExercise', () => {
    it('should return first exercise initially', () => {
      const ex = getCurrentExercise(session);
      expect(ex?.id).toBe('ex-1');
    });

    it('should advance to next exercise after submission', () => {
      submitAnswer(session, 'привет', mockGradeCorrect);
      const ex = getCurrentExercise(session);
      expect(ex?.id).toBe('ex-2');
    });

    it('should return null when all exercises completed', () => {
      submitAnswer(session, 'привет', mockGradeCorrect);
      submitAnswer(session, 'яблоко', mockGradeCorrect);
      submitAnswer(session, 'пока', mockGradeCorrect);
      expect(isSessionComplete(session)).toBe(true);
      expect(getCurrentExercise(session)).toBeNull();
    });
  });

  describe('submitAnswer', () => {
    it('should record correct answer', () => {
      const result = submitAnswer(session, 'привет', mockGradeCorrect);
      expect(result.isCorrect).toBe(true);
      expect(result.xpGained).toBe(10);
      expect(result.heartsRemaining).toBe(3);
      expect(session.answers.size).toBe(1);
    });

    it('should deduct heart on incorrect answer', () => {
      const result = submitAnswer(session, 'пока', mockGradeIncorrect);
      expect(result.isCorrect).toBe(false);
      expect(result.heartsRemaining).toBe(2);
      expect(session.hearts).toBe(2);
    });

    it('should award less XP for typo (FIX B4: uses config)', () => {
      const typoGrade: GradeResult = { type: 'typo', isCorrect: true, feedback: 'Almost!' };
      const result = submitAnswer(session, 'helo', typoGrade);
      expect(result.isCorrect).toBe(true);
      expect(result.xpGained).toBe(5); // xpPerTypo from config
    });

    it('should accumulate XP', () => {
      submitAnswer(session, 'привет', mockGradeCorrect);
      expect(session.xpEarned).toBe(10);
      submitAnswer(session, 'яблоко', mockGradeCorrect);
      expect(session.xpEarned).toBe(20);
    });

    it('should advance current exercise', () => {
      expect(session.currentIndex).toBe(0);
      submitAnswer(session, 'привет', mockGradeCorrect);
      expect(session.currentIndex).toBe(1);
    });

    it('should accept custom config for XP calculation (FIX B4)', () => {
      const customConfig = { ...DEFAULT_SESSION_CONFIG, xpPerCorrect: 20, xpPerTypo: 10 };
      const session2 = createSession('lesson-1', 'user-1', mockExercises, customConfig);
      submitAnswer(session2, 'привет', mockGradeCorrect, customConfig);
      expect(session2.xpEarned).toBe(20); // Uses custom config
    });
  });

  describe('isSessionComplete', () => {
    it('should return false initially', () => {
      expect(isSessionComplete(session)).toBe(false);
    });

    it('should return true after all exercises', () => {
      submitAnswer(session, 'привет', mockGradeCorrect);
      submitAnswer(session, 'яблоко', mockGradeCorrect);
      submitAnswer(session, 'пока', mockGradeCorrect);
      expect(isSessionComplete(session)).toBe(true);
    });
  });

  describe('getSessionSummary', () => {
    it('should calculate accuracy correctly', () => {
      submitAnswer(session, 'привет', mockGradeCorrect);
      submitAnswer(session, 'wrong', mockGradeIncorrect);
      const summary = getSessionSummary(session);
      expect(summary.completed).toBe(2);
      expect(summary.correct).toBe(1);
      expect(summary.incorrect).toBe(1);
      expect(summary.accuracy).toBe(50);
    });

    it('should report total XP earned', () => {
      submitAnswer(session, 'привет', mockGradeCorrect);
      submitAnswer(session, 'яблоко', mockGradeCorrect);
      const summary = getSessionSummary(session);
      expect(summary.xpEarned).toBe(20);
    });

    it('should track hearts remaining', () => {
      submitAnswer(session, 'wrong', mockGradeIncorrect);
      const summary = getSessionSummary(session);
      expect(summary.heartsRemaining).toBe(2);
    });
  });
});
```

## EXACT Verification

```bash
cd packages/lesson-engine

# Step 1: TypeScript
pnpm typecheck
echo "✓ Step 1: typecheck"

# Step 2: Verify no `any` in submitAnswer
grep -v "// FIX B4" src/session/index.ts | grep -q "any" && echo "✗ FAIL: Still has `any`" || echo "✓ Step 2: No `any` found (FIX B4)"

# Step 3: Verify SessionConfig is used
grep -q "config.xpPerTypo" src/session/index.ts && echo "✓ Step 3: Using SessionConfig for XP (FIX B4)"

# Step 4: Run new tests
pnpm test -- session.test.ts
echo "✓ Step 4: session tests"

# Step 5: All tests
pnpm test
echo "✓ Step 5: all tests"

# Step 6: Build
pnpm build
echo "✓ Step 6: build"
```

## SUCCESS Criteria

- [ ] `pnpm test -- session.test.ts` exits 0
- [ ] `pnpm test` exits 0
- [ ] `pnpm typecheck` exits 0
- [ ] ✅ FIX B4 APPLIED: No `any` type in submitAnswer
- [ ] ✅ FIX B4 APPLIED: Uses `SessionConfig` for XP calculation

## Git Commit

```
feat(engine): implement session generator and submission

- Add createSession to generate new lesson sessions
- Add getCurrentExercise for navigation
- Add submitAnswer to grade and advance session
- Add isSessionComplete and getSessionSummary helpers
- Add 13 unit tests covering all scenarios
- FIX B4: Remove `any` type from submitAnswer
- FIX B4: Use SessionConfig for XP per correct/typo calculation
- FIX B4: Create properly typed UserAnswer objects

Verification: pnpm test exits 0
```

---

# ============================================================
# AGENT_12_ENGINE_PROGRESS.md (Sonnet)
# ============================================================

# Task: Lesson Engine - Progress Tracking

**Model:** sonnet  
**Task ID:** engine_012  
**Depends On:** engine_011

## Create File: packages/lesson-engine/src/progress/tracker.ts

```typescript
import type {
  UserProgress,
  LessonProgress,
  WordStrength,
  MasteryLevel,
  Achievement,
} from '../models/index.js';
import { updateSM2State, INITIAL_SM2_STATE } from '../spaced-rep/index.js';

export interface ProgressUpdate {
  lessonId: string;
  mistakes: number;
  accuracy: number;
  xpEarned: number;
}

/**
 * Update user progress after lesson completion
 */
export function updateProgress(
  current: UserProgress,
  update: ProgressUpdate
): UserProgress {
  const newProgress = { ...current };

  newProgress.totalXp += update.xpEarned;
  const oldLevel = newProgress.level;
  newProgress.level = Math.floor(newProgress.totalXp / 100) + 1;

  const lessonProg = current.lessonProgress[update.lessonId] || {
    lessonId: update.lessonId,
    completedCount: 0,
    bestScore: 0,
    lastCompletedAt: 0,
    masteryLevel: 'learning' as MasteryLevel,
  };

  lessonProg.completedCount += 1;
  lessonProg.bestScore = Math.max(lessonProg.bestScore, update.accuracy);
  lessonProg.lastCompletedAt = Date.now();

  if (lessonProg.bestScore >= 90 && lessonProg.completedCount >= 2) {
    lessonProg.masteryLevel = 'mastered';
  } else if (lessonProg.bestScore >= 70 && lessonProg.completedCount >= 1) {
    lessonProg.masteryLevel = 'practicing';
  }

  newProgress.lessonProgress[update.lessonId] = lessonProg;
  if (!newProgress.completedLessons.includes(update.lessonId)) {
    newProgress.completedLessons.push(update.lessonId);
  }

  const today = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  const lastDay = Math.floor(newProgress.lastActivityDate / (24 * 60 * 60 * 1000));

  if (today === lastDay + 1) {
    newProgress.streak += 1;
    newProgress.longestStreak = Math.max(newProgress.longestStreak, newProgress.streak);
  } else if (today > lastDay + 1) {
    newProgress.streak = 1;
  }

  newProgress.lastActivityDate = Date.now();

  const newAchievements = checkAchievements(newProgress, update, oldLevel, newProgress.level);
  newAchievements.forEach((ach) => {
    if (!newProgress.achievements.find((a) => a.id === ach.id)) {
      newProgress.achievements.push(ach);
    }
  });

  return newProgress;
}

/**
 * Update word strength based on exercise performance
 */
export function updateWordStrength(current: WordStrength, quality: number): WordStrength {
  const updated = { ...current };

  if (quality >= 3) {
    updated.timesCorrect += 1;
  } else {
    updated.timesIncorrect += 1;
  }

  updated.lastSeenAt = Date.now();
  updated.sm2State = updateSM2State(current.sm2State, quality);

  const totalAttempts = updated.timesCorrect + updated.timesIncorrect;
  updated.strength = Math.min(1, updated.timesCorrect / totalAttempts);

  return updated;
}

/**
 * Get weak words for spaced repetition practice
 */
export function getWeakWords(progress: UserProgress, limit: number = 10): string[] {
  const words = Object.entries(progress.wordStrengths);
  words.sort((a, b) => {
    const strengthDiff = a[1].strength - b[1].strength;
    if (strengthDiff !== 0) return strengthDiff;
    return a[1].lastSeenAt - b[1].lastSeenAt;
  });
  return words.slice(0, limit).map(([word]) => word);
}

function checkAchievements(
  progress: UserProgress,
  update: ProgressUpdate,
  oldLevel: number,
  newLevel: number
): Achievement[] {
  const achievements: Achievement[] = [];

  if (progress.totalXp >= 100 && progress.totalXp - update.xpEarned < 100) {
    achievements.push({
      id: 'xp-100',
      title: 'First 100 XP',
      description: 'Earn your first 100 XP',
      icon: '⭐',
      category: 'milestone',
      unlockedAt: Date.now(),
    });
  }

  if (newLevel > oldLevel) {
    achievements.push({
      id: `level-${newLevel}`,
      title: `Reached Level ${newLevel}`,
      description: `You are now level ${newLevel}!`,
      icon: '🎉',
      category: 'milestone',
      unlockedAt: Date.now(),
    });
  }

  if (progress.streak === 7) {
    achievements.push({
      id: 'streak-7',
      title: '7-Day Streak',
      description: 'Learn for 7 days in a row',
      icon: '🔥',
      category: 'streak',
      unlockedAt: Date.now(),
    });
  }

  if (update.mistakes === 0) {
    achievements.push({
      id: 'perfect-lesson',
      title: 'Perfect Lesson',
      description: 'Complete a lesson with zero mistakes',
      icon: '💯',
      category: 'challenge',
      unlockedAt: Date.now(),
    });
  }

  return achievements;
}
```

## Create File: packages/lesson-engine/src/progress/index.ts

```typescript
export * from './tracker.js';
```

## Update File: packages/lesson-engine/src/index.ts

```typescript
export * from './models/index.js';
export * from './grading/index.js';
export {
  createSession,
  generateSession,
  getCurrentExercise,
  submitAnswer,
  isSessionComplete,
  getSessionSummary,
} from './session/index.js';
export { INITIAL_SM2_STATE, updateSM2State } from './spaced-rep/index.js';
export * from './progress/index.js';
```

## Create File: packages/lesson-engine/tests/progress.test.ts

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { updateProgress, updateWordStrength, getWeakWords } from '../src/progress/tracker.js';
import type { UserProgress, WordStrength } from '../src/models/index.js';
import { INITIAL_SM2_STATE } from '../src/spaced-rep/index.js';

const createMockProgress = (overrides = {}): UserProgress => ({
  userId: 'user-1',
  totalXp: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  lastActivityDate: 0,
  completedLessons: [],
  lessonProgress: {},
  wordStrengths: {},
  achievements: [],
  ...overrides,
});

describe('Progress Tracking', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set to midday to avoid midnight edge cases
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('updateProgress', () => {
    it('should add XP', () => {
      const progress = createMockProgress();
      const updated = updateProgress(progress, {
        lessonId: 'lesson-1',
        mistakes: 0,
        accuracy: 100,
        xpEarned: 50,
      });
      expect(updated.totalXp).toBe(50);
    });

    it('should level up at 100 XP', () => {
      const progress = createMockProgress({ totalXp: 75 });
      const updated = updateProgress(progress, {
        lessonId: 'lesson-1',
        mistakes: 0,
        accuracy: 100,
        xpEarned: 50,
      });
      expect(updated.level).toBe(2);
    });

    it('should track lesson completion', () => {
      const progress = createMockProgress();
      const updated = updateProgress(progress, {
        lessonId: 'lesson-1',
        mistakes: 1,
        accuracy: 80,
        xpEarned: 50,
      });
      expect(updated.completedLessons.includes('lesson-1')).toBe(true);
    });

    it('should update mastery to practicing at 70%', () => {
      const progress = createMockProgress();
      const updated = updateProgress(progress, {
        lessonId: 'lesson-1',
        mistakes: 3,
        accuracy: 70,
        xpEarned: 50,
      });
      const lesson = updated.lessonProgress['lesson-1'];
      expect(lesson?.masteryLevel).toBe('practicing');
    });

    it('should extend streak on consecutive days', () => {
      // Yesterday at same time
      const yesterday = new Date('2026-01-14T12:00:00Z').getTime();
      const progress = createMockProgress({ streak: 5, lastActivityDate: yesterday });
      const updated = updateProgress(progress, {
        lessonId: 'lesson-1',
        mistakes: 0,
        accuracy: 100,
        xpEarned: 50,
      });
      expect(updated.streak).toBe(6);
    });

    it('should reset streak on gap', () => {
      // Two days ago at same time
      const twoDaysAgo = new Date('2026-01-13T12:00:00Z').getTime();
      const progress = createMockProgress({ streak: 10, lastActivityDate: twoDaysAgo });
      const updated = updateProgress(progress, {
        lessonId: 'lesson-1',
        mistakes: 0,
        accuracy: 100,
        xpEarned: 50,
      });
      expect(updated.streak).toBe(1);
    });

    it('should unlock perfect lesson achievement', () => {
      const progress = createMockProgress();
      const updated = updateProgress(progress, {
        lessonId: 'lesson-1',
        mistakes: 0,
        accuracy: 100,
        xpEarned: 50,
      });
      const hasPerfect = updated.achievements.some((a) => a.id === 'perfect-lesson');
      expect(hasPerfect).toBe(true);
    });
  });

  describe('updateWordStrength', () => {
    it('should increment timesCorrect on quality >= 3', () => {
      const word: WordStrength = {
        word: 'apple',
        strength: 0.5,
        lastSeenAt: Date.now(),
        timesCorrect: 3,
        timesIncorrect: 2,
        sm2State: INITIAL_SM2_STATE,
      };
      const updated = updateWordStrength(word, 4);
      expect(updated.timesCorrect).toBe(4);
    });

    it('should increment timesIncorrect on quality < 3', () => {
      const word: WordStrength = {
        word: 'apple',
        strength: 0.5,
        lastSeenAt: Date.now(),
        timesCorrect: 3,
        timesIncorrect: 2,
        sm2State: INITIAL_SM2_STATE,
      };
      const updated = updateWordStrength(word, 2);
      expect(updated.timesIncorrect).toBe(3);
    });
  });

  describe('getWeakWords', () => {
    it('should return words sorted by weakness', () => {
      const progress = createMockProgress({
        wordStrengths: {
          strong: { word: 'strong', strength: 0.9, lastSeenAt: Date.now(), timesCorrect: 9, timesIncorrect: 1, sm2State: INITIAL_SM2_STATE },
          weak: { word: 'weak', strength: 0.2, lastSeenAt: Date.now(), timesCorrect: 1, timesIncorrect: 4, sm2State: INITIAL_SM2_STATE },
          medium: { word: 'medium', strength: 0.5, lastSeenAt: Date.now(), timesCorrect: 3, timesIncorrect: 3, sm2State: INITIAL_SM2_STATE },
        },
      });
      const weak = getWeakWords(progress, 10);
      expect(weak[0]).toBe('weak');
      expect(weak[1]).toBe('medium');
      expect(weak[2]).toBe('strong');
    });

    it('should respect limit', () => {
      const progress = createMockProgress({
        wordStrengths: Object.fromEntries(
          [...Array(20).keys()].map((i) => [
            `word-${i}`,
            { word: `word-${i}`, strength: Math.random(), lastSeenAt: Date.now(), timesCorrect: 1, timesIncorrect: 1, sm2State: INITIAL_SM2_STATE },
          ])
        ),
      });
      const weak = getWeakWords(progress, 5);
      expect(weak.length).toBe(5);
    });
  });
});
```

## EXACT Verification

```bash
cd packages/lesson-engine

# Step 1: TypeScript
pnpm typecheck
echo "✓ Step 1: typecheck"

# Step 2: New tests
pnpm test -- progress.test.ts
echo "✓ Step 2: progress tests"

# Step 3: All tests
pnpm test
echo "✓ Step 3: all tests"

# Step 4: Build
pnpm build
echo "✓ Step 4: build"
```

## SUCCESS Criteria

- [ ] `pnpm test -- progress.test.ts` exits 0
- [ ] `pnpm test` exits 0
- [ ] `pnpm typecheck` exits 0

## Git Commit

```
feat(engine): implement progress tracking and achievements

- Add updateProgress for XP, level, streak, mastery
- Add updateWordStrength for spaced repetition
- Add getWeakWords for practice selection
- Add automatic achievement unlocking
- Add 10 unit tests

Verification: pnpm test exits 0
```

---

# ============================================================
# AGENT_13_CONTENT_VALIDATE.md (Haiku)
# ============================================================

# Task: Content Validation & Sample A1 Content

**Model:** haiku  
**Task ID:** content_013  
**Depends On:** AGENT_04 (schema must support match_pairs tuples)

## Create 5 Additional Content Files

See MASTER_TASKS_PHASE_1.md AGENT_08 for base content.

### Additional: packages/content/courses/ru-en/a1/unit_01/meta.json
```json
{
  "id": "a1_unit_01",
  "level": "a1",
  "title": "Unit 1: Greetings & Basics",
  "description": "Learn to say hello, goodbye, and basic introductions",
  "order": 1,
  "lessonCount": 2,
  "estimatedMinutes": 15
}
```

### Additional: packages/content/courses/ru-en/a1/unit_01/lesson_02.json
```json
{
  "id": "a1_u1_l2",
  "unitId": "a1_unit_01",
  "title": "My Name Is...",
  "order": 2,
  "exercises": [
    {
      "id": "ex-003",
      "kind": "translate_type",
      "prompt": { "text": "Меня зовут..." },
      "correct": ["My name is", "I am called", "I'm called"],
      "difficulty": 1
    },
    {
      "id": "ex-004",
      "kind": "match_pairs",
      "prompt": { "text": "Match greetings" },
      "correct": [["hello", "привет"], ["goodbye", "до свидания"], ["thank you", "спасибо"]],
      "difficulty": 2
    }
  ]
}
```

### Additional: packages/content/courses/ru-en/a1/unit_01/story_01.json
```json
{
  "id": "a1_u1_story_01",
  "title": "Meeting a Friend",
  "lines": [
    { "speaker": "Anna", "text": "Hello! My name is Anna.", "audioUrl": "/audio/a1/story01/line01.mp3" },
    { "speaker": "Boris", "text": "Hi Anna! I am Boris.", "audioUrl": "/audio/a1/story01/line02.mp3" },
    { "speaker": "Anna", "text": "Nice to meet you!", "audioUrl": "/audio/a1/story01/line03.mp3" },
    { "speaker": "Boris", "text": "Nice to meet you too!", "audioUrl": "/audio/a1/story01/line04.mp3" }
  ],
  "comprehensionExercises": [
    {
      "id": "story01-ex-01",
      "kind": "story_comprehension",
      "prompt": { "text": "What is the woman's name?" },
      "correct": ["Anna"],
      "difficulty": 1
    },
    {
      "id": "story01-ex-02",
      "kind": "story_comprehension",
      "prompt": { "text": "What is the man's name?" },
      "correct": ["Boris"],
      "difficulty": 1
    },
    {
      "id": "story01-ex-03",
      "kind": "story_comprehension",
      "prompt": { "text": "What does Anna say at the end?" },
      "choices": ["Goodbye!", "Nice to meet you!", "Thank you!"],
      "correct": "Nice to meet you!",
      "difficulty": 1
    }
  ]
}
```

### Additional: packages/content/courses/ru-en/a1/checkpoint_a1.json
```json
{
  "id": "checkpoint_a1",
  "sectionId": "a1",
  "title": "A1 Basics Checkpoint",
  "passingScore": 70,
  "exercises": [
    {
      "id": "cp-a1-01",
      "kind": "checkpoint_question",
      "prompt": { "text": "Translate: Привет" },
      "choices": ["Hello", "Goodbye", "Thanks", "Sorry"],
      "correct": "Hello",
      "difficulty": 1,
      "assessedSkill": "vocabulary"
    },
    {
      "id": "cp-a1-02",
      "kind": "checkpoint_question",
      "prompt": { "text": "Translate: Меня зовут..." },
      "correct": ["My name is", "I am called"],
      "difficulty": 1,
      "assessedSkill": "grammar"
    },
    {
      "id": "cp-a1-03",
      "kind": "checkpoint_question",
      "prompt": { "text": "Match: hello" },
      "choices": ["пока", "привет", "спасибо", "да"],
      "correct": "привет",
      "difficulty": 1,
      "assessedSkill": "vocabulary"
    },
    {
      "id": "cp-a1-04",
      "kind": "checkpoint_question",
      "prompt": { "text": "Translate: Thank you" },
      "correct": ["Спасибо"],
      "difficulty": 1,
      "assessedSkill": "vocabulary"
    },
    {
      "id": "cp-a1-05",
      "kind": "checkpoint_question",
      "prompt": { "text": "Complete: My ___ is Anna" },
      "choices": ["name", "hello", "goodbye", "thank"],
      "correct": "name",
      "difficulty": 1,
      "assessedSkill": "grammar"
    }
  ]
}
```

### Additional: packages/content/courses/ru-en/a1/course_map.json
```json
{
  "courseId": "ru-en",
  "sections": [
    {
      "id": "a1",
      "level": "a1",
      "title": "A1 - Beginner",
      "description": "Basic greetings, introductions, and simple phrases",
      "order": 1,
      "nodes": [
        { "id": "a1_u1_l1", "type": "lesson", "title": "Hello & Goodbye", "order": 1, "sectionId": "a1" },
        { "id": "a1_u1_l2", "type": "lesson", "title": "My Name Is...", "order": 2, "sectionId": "a1" },
        { "id": "a1_u1_story_01", "type": "story", "title": "Meeting a Friend", "order": 3, "sectionId": "a1" },
        { "id": "a1_u1_l3", "type": "lesson", "title": "Please & Thank You", "order": 4, "sectionId": "a1" },
        { "id": "a1_u1_l4", "type": "lesson", "title": "Yes & No", "order": 5, "sectionId": "a1" },
        { "id": "checkpoint_a1", "type": "checkpoint", "title": "A1 Checkpoint", "order": 6, "sectionId": "a1" }
      ]
    },
    {
      "id": "a2",
      "level": "a2",
      "title": "A2 - Elementary",
      "description": "Daily routines, simple conversations, past tense basics",
      "order": 2,
      "nodes": []
    },
    {
      "id": "b1",
      "level": "b1",
      "title": "B1 - Intermediate",
      "description": "Complex sentences, opinions, and abstract topics",
      "order": 3,
      "nodes": []
    }
  ]
}
```

## EXACT Verification

```bash
cd packages/content

# Step 1: JSON syntax
node -e "
const fs = require('fs');
const files = [
  'courses/ru-en/a1/unit_01/meta.json',
  'courses/ru-en/a1/unit_01/lesson_01.json',
  'courses/ru-en/a1/unit_01/lesson_02.json',
  'courses/ru-en/a1/unit_01/story_01.json',
  'courses/ru-en/a1/checkpoint_a1.json',
  'courses/ru-en/a1/course_map.json',
];
files.forEach((f) => JSON.parse(fs.readFileSync(f, 'utf-8')));
console.log('✓ Step 1: JSON valid');
"

# Step 2: Validate
pnpm validate
echo "✓ Step 2: Zod validation"

# Step 3: Sanity checks (v1.2 story + checkpoint + course map)
node -e "
const fs = require('fs');
const story = JSON.parse(fs.readFileSync('courses/ru-en/a1/unit_01/story_01.json', 'utf-8'));
if (story.lines?.length >= 4) console.log('✓ Step 3a: story has 4+ lines');
if (story.comprehensionExercises?.length >= 3) console.log('✓ Step 3b: story has 3+ comprehension exercises');

const checkpoint = JSON.parse(fs.readFileSync('courses/ru-en/a1/checkpoint_a1.json', 'utf-8'));
if (checkpoint.exercises?.length >= 5) console.log('✓ Step 3c: checkpoint has 5+ exercises');

const courseMap = JSON.parse(fs.readFileSync('courses/ru-en/a1/course_map.json', 'utf-8'));
const nodes = (courseMap.sections || []).flatMap((s) => s.nodes || []);
const types = new Set(nodes.map((n) => n.type));
if (types.has('story') && types.has('checkpoint')) console.log('✓ Step 3d: course map includes story + checkpoint nodes');
"
```

## SUCCESS Criteria

- [ ] All JSON files parse
- [ ] `pnpm validate` passes
- [ ] Story has 4+ lines + 3+ comprehension exercises
- [ ] Checkpoint has 5+ exercises
- [ ] Course map includes story + checkpoint nodes

## Git Commit

```
feat(content): add A1 sample content

- Add Unit 1 meta.json
- Add Lesson 2 with 2 exercises
- Add Story 01 with comprehension exercises (v1.2)
- Add A1 checkpoint test (v1.2)
- Add A1 course map with CEFR sections + node types (v1.2)

Verification: pnpm validate passes
```

---

# PHASE 2 COMPLETE CHECKLIST

After running all Phase 2 tasks:

- [ ] Types: 40+ exports in lesson-engine (v1.2: story/checkpoint + course map types)
- [ ] Schemas: content tests pass (v1.2: story/checkpoint + CourseNode schemas)
- [ ] API Types: 30+ exports in types package
- [ ] Grading: 13 tests pass
- [ ] Session: 13 tests pass (FIX B4: no any, uses SessionConfig)
- [ ] Progress: 10 tests pass
- [ ] Content: lessons + story + checkpoint + course map validate
- [ ] Total tests: 48+ passing
- [ ] Git: 7 commits with proper messages
- [ ] ✅ FIX B1 APPLIED: Discriminated union for ExerciseSchema
- [ ] ✅ v1.2: 'story_comprehension' + 'checkpoint_question' added to ExerciseKind and ExerciseKindSchema
- [ ] ✅ FIX B2 APPLIED: 'speak' present in ExerciseKind and ExerciseKindSchema
- [ ] ✅ FIX B4 APPLIED: No `any` in submitAnswer, uses SessionConfig for XP
