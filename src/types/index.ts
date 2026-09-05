export type Priority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  subject: string;
  topic: string;
  deadline: string;
  priority: Priority;
  estimatedMinutes: number;
  isCompleted: boolean;
  createdAt: number;
}

export interface Subject {
  id: string;
  name: string;
  colorHex: string;
  icon?: string;
}

export interface Topic {
  id: string;
  name: string;
  subjectName: string;
  targetMinutes: number;
  studiedMinutes: number;
  confidenceScore?: number; // 0 - 100
}

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  timestamp: number;
  qualityRating: number; // 1 to 5
  questionsAttempted: number;
  questionsCorrect: number;
  notes: string;
}

export interface UserProfile {
  name: string;
  major: string;
  dailyGoalMinutes: number;
  streakDays: number;
  lastStudyDate: string; // YYYY-MM-DD
  soundEnabled: boolean;
  autoStartBreaks: boolean;
}

export interface WeeklyStudyDay {
  dayLabel: string;
  dateString: string;
  minutes: number;
}

export type ScreenId = 'dashboard' | 'planner' | 'study' | 'analytics' | 'topics' | 'settings' | 'landing';
