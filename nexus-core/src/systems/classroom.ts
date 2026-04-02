// Classroom mode — teacher dashboard + student management (up to 30 students)
// Privacy: teacher sees mastery data, NEVER raw learning events.
// No ranking, no comparison, no "class average" visible to students.

import type { System } from '../ecs/system.js';
import type { World } from '../ecs/world.js';
import type { MasteryTier } from '../types/components.js';
import type {
  Classroom,
  ClassroomSettings,
  ClassroomStudent,
  StudentGroup,
  QuestAssignment,
  FocusAssignment,
  ClassProgress,
  StudentProgress,
  SubjectProgress,
  ClassEngagement,
  EngagementLevel,
  ClassMasteryReport,
  ScreenTimeOverview,
  TeacherVisibleData,
  CreateClassroomInput,
  CreateGroupInput,
} from '../types/classroom.js';
import { DEFAULT_CLASSROOM_SETTINGS } from '../types/classroom.js';

// --- Privacy enforcement ---

function clampMastery(value: number): number {
  return Math.max(0, Math.min(1, Math.round(value * 100) / 100));
}

function extractSubject(skillId: string): string {
  const dot = skillId.indexOf('.');
  return dot > 0 ? skillId.slice(0, dot) : skillId;
}

// --- Engagement computation (aggregated, no individual exposure in real-time) ---

function computeEngagementLevel(
  mastery: number,
  recentAttempts: number,
  recentSuccesses: number,
): EngagementLevel {
  if (recentAttempts === 0) return 'thinking';
  const successRate = recentSuccesses / recentAttempts;
  if (successRate >= 0.6 && mastery >= 0.4) return 'in_flow';
  if (successRate >= 0.3) return 'thinking';
  return 'struggling';
}

// --- Mastery record for internal tracking ---

interface InternalMasteryRecord {
  skillId: string;
  level: number;
  attempts: number;
  successes: number;
}

// --- ClassroomSystem ---

export class ClassroomSystem implements System {
  readonly name = 'classroom';
  readonly priority = 47;

  private classrooms: Map<string, Classroom> = new Map();
  private questAssignments: Map<string, QuestAssignment[]> = new Map();
  private focusAssignments: Map<string, FocusAssignment[]> = new Map();
  private studentMastery: Map<string, InternalMasteryRecord[]> = new Map();
  private studentActivity: Map<string, { activeMinutes: number; questsCompleted: number }> =
    new Map();

  update(_world: World, _dt: number): void {
    // Check time limits and auto-pause if needed
    for (const classroom of this.classrooms.values()) {
      if (classroom.status !== 'active') continue;
      if (classroom.settings.timeLimitMinutes === null) continue;

      const elapsed =
        (Date.now() - new Date(classroom.lastActivity).getTime()) / 60000;
      if (elapsed >= classroom.settings.timeLimitMinutes) {
        classroom.status = 'paused';
      }
    }
  }

  // --- Classroom lifecycle ---

  createClassroom(input: CreateClassroomInput): Classroom {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Classroom name is required');
    }
    if (!input.teacherProfileId) {
      throw new Error('Teacher profile ID is required');
    }

    const id = `classroom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const settings: ClassroomSettings = {
      ...DEFAULT_CLASSROOM_SETTINGS,
      ...(input.settings ?? {}),
    };

    const classroom: Classroom = {
      id,
      name: input.name.trim(),
      teacherProfileId: input.teacherProfileId,
      students: [],
      groups: [],
      settings,
      status: 'active',
      createdAt: now,
      lastActivity: now,
    };

    this.classrooms.set(id, classroom);
    this.questAssignments.set(id, []);
    this.focusAssignments.set(id, []);

    return classroom;
  }

  getClassroom(classroomId: string): Classroom | undefined {
    return this.classrooms.get(classroomId);
  }

  // --- Student management ---

  addStudent(
    classroomId: string,
    profileId: string,
    name: string,
    masteryTier: MasteryTier = 'foundation',
  ): void {
    const classroom = this.requireClassroom(classroomId);

    if (classroom.students.length >= classroom.settings.maxStudents) {
      throw new Error(
        `Classroom is full (max ${classroom.settings.maxStudents} students)`,
      );
    }

    if (classroom.students.some((s) => s.profileId === profileId)) {
      throw new Error('Student already in classroom');
    }

    classroom.students.push({
      profileId,
      name,
      masteryTier,
      joinedAt: new Date().toISOString(),
      groupId: null,
    });

    this.studentMastery.set(profileId, []);
    this.studentActivity.set(profileId, { activeMinutes: 0, questsCompleted: 0 });
    classroom.lastActivity = new Date().toISOString();
  }

  removeStudent(classroomId: string, studentProfileId: string): void {
    const classroom = this.requireClassroom(classroomId);
    const idx = classroom.students.findIndex((s) => s.profileId === studentProfileId);
    if (idx < 0) throw new Error('Student not in classroom');

    classroom.students.splice(idx, 1);

    // Remove from any groups
    for (const group of classroom.groups) {
      const gi = group.studentIds.indexOf(studentProfileId);
      if (gi >= 0) group.studentIds.splice(gi, 1);
    }

    classroom.lastActivity = new Date().toISOString();
  }

  getStudents(classroomId: string): ClassroomStudent[] {
    return this.requireClassroom(classroomId).students;
  }

  // --- Groups ---

  createGroup(classroomId: string, input: CreateGroupInput): StudentGroup {
    const classroom = this.requireClassroom(classroomId);

    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Group name is required');
    }

    // Validate all students exist in classroom
    for (const sid of input.studentIds) {
      if (!classroom.students.some((s) => s.profileId === sid)) {
        throw new Error(`Student ${sid} not in classroom`);
      }
    }

    const group: StudentGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: input.name.trim(),
      studentIds: [...input.studentIds],
    };

    classroom.groups.push(group);

    // Update students' group references
    for (const sid of input.studentIds) {
      const student = classroom.students.find((s) => s.profileId === sid);
      if (student) student.groupId = group.id;
    }

    classroom.lastActivity = new Date().toISOString();
    return group;
  }

  getGroups(classroomId: string): StudentGroup[] {
    return this.requireClassroom(classroomId).groups;
  }

  // --- Assignments ---

  assignQuest(classroomId: string, questId: string, groupId?: string): QuestAssignment {
    const classroom = this.requireClassroom(classroomId);

    if (groupId) {
      if (!classroom.groups.some((g) => g.id === groupId)) {
        throw new Error('Group not found');
      }
    }

    const assignment: QuestAssignment = {
      id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      classroomId,
      questId,
      groupId: groupId ?? null,
      assignedAt: new Date().toISOString(),
    };

    this.questAssignments.get(classroomId)!.push(assignment);
    classroom.lastActivity = new Date().toISOString();
    return assignment;
  }

  assignFocus(classroomId: string, skills: string[], groupId?: string): FocusAssignment {
    const classroom = this.requireClassroom(classroomId);

    if (skills.length === 0) {
      throw new Error('At least one skill is required');
    }

    if (groupId) {
      if (!classroom.groups.some((g) => g.id === groupId)) {
        throw new Error('Group not found');
      }
    }

    const assignment: FocusAssignment = {
      id: `fa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      classroomId,
      skills: [...skills],
      groupId: groupId ?? null,
      assignedAt: new Date().toISOString(),
    };

    this.focusAssignments.get(classroomId)!.push(assignment);
    classroom.lastActivity = new Date().toISOString();
    return assignment;
  }

  getQuestAssignments(classroomId: string): QuestAssignment[] {
    return this.questAssignments.get(classroomId) ?? [];
  }

  getFocusAssignments(classroomId: string): FocusAssignment[] {
    return this.focusAssignments.get(classroomId) ?? [];
  }

  // --- Mastery data ingestion (from server or local DB) ---

  updateStudentMastery(profileId: string, records: InternalMasteryRecord[]): void {
    this.studentMastery.set(profileId, records);
  }

  updateStudentActivity(
    profileId: string,
    activeMinutes: number,
    questsCompleted: number,
  ): void {
    this.studentActivity.set(profileId, { activeMinutes, questsCompleted });
  }

  // --- Progress (aggregated — teacher sees mastery, NEVER raw events) ---

  getClassProgress(classroomId: string): ClassProgress {
    const classroom = this.requireClassroom(classroomId);
    const masteryBySubject = new Map<string, SubjectProgress>();
    const gapCounts = new Map<string, number>();
    const strengthCounts = new Map<string, number>();

    let activeCount = 0;

    for (const student of classroom.students) {
      const records = this.studentMastery.get(student.profileId) ?? [];
      const activity = this.studentActivity.get(student.profileId);
      if (activity && activity.activeMinutes > 0) activeCount++;

      for (const record of records) {
        const subject = extractSubject(record.skillId);
        let sp = masteryBySubject.get(subject);
        if (!sp) {
          sp = { subject, averageMastery: 0, studentsAtOrAbove: 0, studentsBelow: 0, totalStudents: 0 };
          masteryBySubject.set(subject, sp);
        }
        sp.totalStudents++;
        sp.averageMastery += record.level;

        if (record.level >= 0.7) {
          sp.studentsAtOrAbove++;
          strengthCounts.set(subject, (strengthCounts.get(subject) ?? 0) + 1);
        } else {
          sp.studentsBelow++;
          gapCounts.set(subject, (gapCounts.get(subject) ?? 0) + 1);
        }
      }
    }

    // Finalize averages
    for (const sp of masteryBySubject.values()) {
      if (sp.totalStudents > 0) {
        sp.averageMastery = clampMastery(sp.averageMastery / sp.totalStudents);
      }
    }

    // Common gaps: subjects where more than 40% of students are below mastery
    const totalStudents = classroom.students.length;
    const threshold = Math.max(1, Math.floor(totalStudents * 0.4));
    const commonGaps = Array.from(gapCounts.entries())
      .filter(([_, count]) => count >= threshold)
      .sort((a, b) => b[1] - a[1])
      .map(([subject]) => subject);

    // Top strengths: subjects where more than 60% are at mastery
    const strengthThreshold = Math.max(1, Math.floor(totalStudents * 0.6));
    const topStrengths = Array.from(strengthCounts.entries())
      .filter(([_, count]) => count >= strengthThreshold)
      .sort((a, b) => b[1] - a[1])
      .map(([subject]) => subject);

    // Recommendations
    const recommendations: string[] = [];
    if (commonGaps.length > 0) {
      recommendations.push(
        `Consider focusing on ${commonGaps[0]} this week — many students need support.`,
      );
    }
    if (topStrengths.length > 0) {
      recommendations.push(
        `The class excels at ${topStrengths[0]} — consider advancing to more complex challenges.`,
      );
    }
    if (activeCount < totalStudents * 0.8 && totalStudents > 0) {
      recommendations.push(
        `${totalStudents - activeCount} students have low engagement. Consider checking in with them.`,
      );
    }

    return {
      totalStudents,
      activeStudents: activeCount,
      masteryBySubject,
      commonGaps,
      topStrengths,
      recommendations,
    };
  }

  // --- Individual student progress (teacher drill-down) ---

  getStudentProgress(classroomId: string, studentId: string): StudentProgress | null {
    const classroom = this.requireClassroom(classroomId);
    const student = classroom.students.find((s) => s.profileId === studentId);
    if (!student) return null;

    const records = this.studentMastery.get(studentId) ?? [];
    const activity = this.studentActivity.get(studentId) ?? {
      activeMinutes: 0,
      questsCompleted: 0,
    };

    const subjectMastery = new Map<string, number>();
    const subjectCounts = new Map<string, number>();
    let totalLevel = 0;

    for (const r of records) {
      const subject = extractSubject(r.skillId);
      subjectMastery.set(subject, (subjectMastery.get(subject) ?? 0) + r.level);
      subjectCounts.set(subject, (subjectCounts.get(subject) ?? 0) + 1);
      totalLevel += r.level;
    }

    // Average per subject
    for (const [subj, total] of subjectMastery) {
      const count = subjectCounts.get(subj) ?? 1;
      subjectMastery.set(subj, clampMastery(total / count));
    }

    return {
      profileId: studentId,
      name: student.name,
      masteryTier: student.masteryTier,
      overallMastery: records.length > 0 ? clampMastery(totalLevel / records.length) : 0,
      subjectMastery,
      questsCompleted: activity.questsCompleted,
      activeMinutes: activity.activeMinutes,
    };
  }

  // --- Teacher-visible data (privacy-safe) ---

  getTeacherVisibleData(classroomId: string): TeacherVisibleData[] {
    const classroom = this.requireClassroom(classroomId);
    const result: TeacherVisibleData[] = [];

    for (const student of classroom.students) {
      const records = this.studentMastery.get(student.profileId) ?? [];
      const activity = this.studentActivity.get(student.profileId) ?? {
        activeMinutes: 0,
        questsCompleted: 0,
      };

      const subjectMastery = new Map<string, number>();
      const subjectCounts = new Map<string, number>();
      let totalLevel = 0;
      let totalAttempts = 0;
      let totalSuccesses = 0;

      for (const r of records) {
        const subject = extractSubject(r.skillId);
        subjectMastery.set(subject, (subjectMastery.get(subject) ?? 0) + r.level);
        subjectCounts.set(subject, (subjectCounts.get(subject) ?? 0) + 1);
        totalLevel += r.level;
        totalAttempts += r.attempts;
        totalSuccesses += r.successes;
      }

      for (const [subj, total] of subjectMastery) {
        const count = subjectCounts.get(subj) ?? 1;
        subjectMastery.set(subj, clampMastery(total / count));
      }

      const overallMastery = records.length > 0 ? clampMastery(totalLevel / records.length) : 0;
      const engagement = computeEngagementLevel(overallMastery, totalAttempts, totalSuccesses);

      result.push({
        profileId: student.profileId,
        name: student.name,
        masteryTier: student.masteryTier,
        overallMastery,
        subjectMastery,
        questsCompleted: activity.questsCompleted,
        engagementLevel: engagement,
      });
    }

    return result;
  }

  // --- Aggregated engagement (no individual struggles exposed) ---

  getClassEngagement(classroomId: string): ClassEngagement {
    const data = this.getTeacherVisibleData(classroomId);
    let inFlow = 0;
    let thinking = 0;
    let struggling = 0;

    for (const d of data) {
      switch (d.engagementLevel) {
        case 'in_flow':
          inFlow++;
          break;
        case 'thinking':
          thinking++;
          break;
        case 'struggling':
          struggling++;
          break;
      }
    }

    return {
      totalStudents: data.length,
      inFlow,
      thinking,
      struggling,
    };
  }

  // --- Reports ---

  generateMasteryReport(classroomId: string): ClassMasteryReport {
    const classroom = this.requireClassroom(classroomId);
    const progress = this.getClassProgress(classroomId);

    const subjectBreakdown = Array.from(progress.masteryBySubject.values());
    const overallMastery =
      subjectBreakdown.length > 0
        ? clampMastery(
            subjectBreakdown.reduce((acc, s) => acc + s.averageMastery, 0) /
              subjectBreakdown.length,
          )
        : 0;

    // Screen time overview
    let totalMinutes = 0;
    let totalSessions = 0;
    for (const student of classroom.students) {
      const activity = this.studentActivity.get(student.profileId);
      if (activity) {
        totalMinutes += activity.activeMinutes;
        totalSessions++;
      }
    }

    const screenTimeOverview: ScreenTimeOverview = {
      averageMinutes:
        totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
      totalSessions,
    };

    return {
      classroomId,
      classroomName: classroom.name,
      generatedAt: new Date().toISOString(),
      totalStudents: classroom.students.length,
      overallMastery,
      subjectBreakdown,
      commonGaps: progress.commonGaps,
      topStrengths: progress.topStrengths,
      recommendations: progress.recommendations,
      screenTimeOverview,
    };
  }

  // --- Classroom controls ---

  pauseClassroom(classroomId: string): void {
    const classroom = this.requireClassroom(classroomId);
    classroom.status = 'paused';
    classroom.lastActivity = new Date().toISOString();
  }

  resumeClassroom(classroomId: string): void {
    const classroom = this.requireClassroom(classroomId);
    if (classroom.status === 'ended') {
      throw new Error('Cannot resume an ended classroom');
    }
    classroom.status = 'active';
    classroom.lastActivity = new Date().toISOString();
  }

  endClassroom(classroomId: string): void {
    const classroom = this.requireClassroom(classroomId);
    classroom.status = 'ended';
    classroom.lastActivity = new Date().toISOString();
  }

  updateSettings(classroomId: string, updates: Partial<ClassroomSettings>): ClassroomSettings {
    const classroom = this.requireClassroom(classroomId);
    Object.assign(classroom.settings, updates);
    classroom.lastActivity = new Date().toISOString();
    return { ...classroom.settings };
  }

  // --- Internal helpers ---

  private requireClassroom(classroomId: string): Classroom {
    const classroom = this.classrooms.get(classroomId);
    if (!classroom) throw new Error('Classroom not found');
    return classroom;
  }

  // --- Cleanup ---

  reset(): void {
    this.classrooms.clear();
    this.questAssignments.clear();
    this.focusAssignments.clear();
    this.studentMastery.clear();
    this.studentActivity.clear();
  }
}
