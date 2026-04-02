// Classroom mode types — teacher dashboard + student management

import type { MasteryTier } from './components.js';

// --- Classroom lifecycle ---

export interface Classroom {
  id: string;
  name: string;
  teacherProfileId: string;
  students: ClassroomStudent[];
  groups: StudentGroup[];
  settings: ClassroomSettings;
  status: ClassroomStatus;
  createdAt: string;
  lastActivity: string;
}

export type ClassroomStatus = 'active' | 'paused' | 'ended';

export interface ClassroomSettings {
  maxStudents: number;
  timeLimitMinutes: number | null;
  allowFreeExploration: boolean;
  focusSkills: string[];
  pauseOnTeacherRequest: boolean;
}

export const DEFAULT_CLASSROOM_SETTINGS: ClassroomSettings = {
  maxStudents: 30,
  timeLimitMinutes: null,
  allowFreeExploration: true,
  focusSkills: [],
  pauseOnTeacherRequest: true,
};

// --- Student data (teacher sees mastery, NEVER raw events) ---

export interface ClassroomStudent {
  profileId: string;
  name: string;
  masteryTier: MasteryTier;
  joinedAt: string;
  groupId: string | null;
}

export interface StudentGroup {
  id: string;
  name: string;
  studentIds: string[];
}

// --- Assignments ---

export interface QuestAssignment {
  id: string;
  classroomId: string;
  questId: string;
  groupId: string | null;
  assignedAt: string;
}

export interface FocusAssignment {
  id: string;
  classroomId: string;
  skills: string[];
  groupId: string | null;
  assignedAt: string;
}

// --- Progress (aggregated, never individual struggles in real-time) ---

export interface SubjectProgress {
  subject: string;
  averageMastery: number;
  studentsAtOrAbove: number;
  studentsBelow: number;
  totalStudents: number;
}

export interface ClassProgress {
  totalStudents: number;
  activeStudents: number;
  masteryBySubject: Map<string, SubjectProgress>;
  commonGaps: string[];
  topStrengths: string[];
  recommendations: string[];
}

export interface StudentProgress {
  profileId: string;
  name: string;
  masteryTier: MasteryTier;
  overallMastery: number;
  subjectMastery: Map<string, number>;
  questsCompleted: number;
  activeMinutes: number;
}

// --- Engagement (aggregated for privacy) ---

export type EngagementLevel = 'in_flow' | 'thinking' | 'struggling';

export interface ClassEngagement {
  totalStudents: number;
  inFlow: number;
  thinking: number;
  struggling: number;
}

// --- Reports ---

export interface ClassMasteryReport {
  classroomId: string;
  classroomName: string;
  generatedAt: string;
  totalStudents: number;
  overallMastery: number;
  subjectBreakdown: SubjectProgress[];
  commonGaps: string[];
  topStrengths: string[];
  recommendations: string[];
  screenTimeOverview: ScreenTimeOverview;
}

export interface ScreenTimeOverview {
  averageMinutes: number;
  totalSessions: number;
}

// --- Privacy constraints (enforced at type level) ---

export interface TeacherVisibleData {
  profileId: string;
  name: string;
  masteryTier: MasteryTier;
  overallMastery: number;
  subjectMastery: Map<string, number>;
  questsCompleted: number;
  engagementLevel: EngagementLevel;
}

export interface CreateClassroomInput {
  name: string;
  teacherProfileId: string;
  settings?: Partial<ClassroomSettings>;
}

export interface AssignQuestInput {
  questId: string;
  groupId?: string;
}

export interface AssignFocusInput {
  skills: string[];
  groupId?: string;
}

export interface CreateGroupInput {
  name: string;
  studentIds: string[];
}

export interface UpdateClassroomSettingsInput {
  timeLimitMinutes?: number | null;
  allowFreeExploration?: boolean;
  focusSkills?: string[];
  pauseOnTeacherRequest?: boolean;
}
