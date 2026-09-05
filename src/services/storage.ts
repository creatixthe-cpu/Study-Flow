import { Task, Subject, Topic, StudySession, UserProfile, WeeklyStudyDay } from '../types';

const STORAGE_KEYS = {
  TASKS: 'studyflow_tasks',
  SUBJECTS: 'studyflow_subjects',
  TOPICS: 'studyflow_topics',
  SESSIONS: 'studyflow_sessions',
  PROFILE: 'studyflow_profile',
};

const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub_1', name: 'Physics', colorHex: '#3B82F6', icon: '⚛️' },
  { id: 'sub_2', name: 'Mathematics', colorHex: '#A855F7', icon: '∫' },
  { id: 'sub_3', name: 'Chemistry', colorHex: '#EAB308', icon: '🧪' },
  { id: 'sub_4', name: 'Computer Science', colorHex: '#10B981', icon: '💻' },
];

const DEFAULT_TOPICS: Topic[] = [
  { id: 'top_1', name: 'Electromagnetism', subjectName: 'Physics', targetMinutes: 180, studiedMinutes: 120, confidenceScore: 82 },
  { id: 'top_2', name: 'Quantum Mechanics', subjectName: 'Physics', targetMinutes: 150, studiedMinutes: 45, confidenceScore: 65 },
  { id: 'top_3', name: 'Multivariable Calculus', subjectName: 'Mathematics', targetMinutes: 200, studiedMinutes: 165, confidenceScore: 88 },
  { id: 'top_4', name: 'Linear Algebra', subjectName: 'Mathematics', targetMinutes: 160, studiedMinutes: 90, confidenceScore: 74 },
  { id: 'top_5', name: 'Organic Synthesis', subjectName: 'Chemistry', targetMinutes: 180, studiedMinutes: 60, confidenceScore: 58 },
  { id: 'top_6', name: 'Thermodynamics', subjectName: 'Chemistry', targetMinutes: 120, studiedMinutes: 90, confidenceScore: 79 },
  { id: 'top_7', name: 'Data Structures & Algorithms', subjectName: 'Computer Science', targetMinutes: 240, studiedMinutes: 210, confidenceScore: 92 },
  { id: 'top_8', name: 'Computer Architecture', subjectName: 'Computer Science', targetMinutes: 140, studiedMinutes: 50, confidenceScore: 62 },
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task_1',
    title: 'Solve Gauss Law & Flux Problems',
    subject: 'Physics',
    topic: 'Electromagnetism',
    deadline: 'Today, 8:00 PM',
    priority: 'High',
    estimatedMinutes: 45,
    isCompleted: false,
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'task_2',
    title: 'Review Eigenvalues and Diagonalization',
    subject: 'Mathematics',
    topic: 'Linear Algebra',
    deadline: 'Today, 10:30 PM',
    priority: 'Medium',
    estimatedMinutes: 30,
    isCompleted: false,
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'task_3',
    title: 'Memorize Electrophilic Aromatic Substitution',
    subject: 'Chemistry',
    topic: 'Organic Synthesis',
    deadline: 'Tomorrow, 5:00 PM',
    priority: 'High',
    estimatedMinutes: 50,
    isCompleted: false,
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'task_4',
    title: 'Implement AVL Tree Rotations in TypeScript',
    subject: 'Computer Science',
    topic: 'Data Structures & Algorithms',
    deadline: 'Tomorrow, 9:00 PM',
    priority: 'Medium',
    estimatedMinutes: 60,
    isCompleted: true,
    createdAt: Date.now() - 3600000 * 6,
  },
  {
    id: 'task_5',
    title: 'Derive Wave Equation for Free Particle',
    subject: 'Physics',
    topic: 'Quantum Mechanics',
    deadline: 'Next Monday',
    priority: 'Low',
    estimatedMinutes: 40,
    isCompleted: true,
    createdAt: Date.now() - 3600000 * 12,
  }
];

const DEFAULT_SESSIONS: StudySession[] = [
  {
    id: 'sess_1',
    subject: 'Physics',
    topic: 'Electromagnetism',
    durationMinutes: 45,
    timestamp: Date.now() - 3600000 * 2,
    qualityRating: 5,
    questionsAttempted: 12,
    questionsCorrect: 11,
    notes: 'Derived electric field inside and outside cylindrical conductor.',
  },
  {
    id: 'sess_2',
    subject: 'Mathematics',
    topic: 'Multivariable Calculus',
    durationMinutes: 30,
    timestamp: Date.now() - 3600000 * 26,
    qualityRating: 4,
    questionsAttempted: 8,
    questionsCorrect: 7,
    notes: 'Green\'s theorem contour integrals evaluated successfully.',
  },
  {
    id: 'sess_3',
    subject: 'Computer Science',
    topic: 'Data Structures & Algorithms',
    durationMinutes: 50,
    timestamp: Date.now() - 3600000 * 52,
    qualityRating: 5,
    questionsAttempted: 15,
    questionsCorrect: 14,
    notes: 'Mastered dynamic programming knapsack optimizations.',
  },
  {
    id: 'sess_4',
    subject: 'Chemistry',
    topic: 'Thermodynamics',
    durationMinutes: 35,
    timestamp: Date.now() - 3600000 * 75,
    qualityRating: 4,
    questionsAttempted: 10,
    questionsCorrect: 8,
    notes: 'Gibbs free energy calculations for non-standard temperatures.',
  }
];

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  major: 'B.S. Electrical Engineering & CS',
  dailyGoalMinutes: 120,
  streakDays: 5,
  lastStudyDate: new Date().toISOString().split('T')[0],
  soundEnabled: true,
  autoStartBreaks: false,
};

class StorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // Initializer
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
      this.setItem(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOPICS)) {
      this.setItem(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      this.setItem(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
      this.setItem(STORAGE_KEYS.SESSIONS, DEFAULT_SESSIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      this.setItem(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    }
  }

  // Tasks
  getTasks(): Task[] {
    return this.getItem<Task[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
  }

  saveTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...task,
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now(),
    };
    tasks.unshift(newTask);
    this.setItem(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  }

  updateTask(updatedTask: Task): void {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      this.setItem(STORAGE_KEYS.TASKS, tasks);
    }
  }

  deleteTask(id: string): void {
    const tasks = this.getTasks().filter(t => t.id !== id);
    this.setItem(STORAGE_KEYS.TASKS, tasks);
  }

  toggleTaskCompletion(id: string): Task | null {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.isCompleted = !task.isCompleted;
      this.setItem(STORAGE_KEYS.TASKS, tasks);
      return task;
    }
    return null;
  }

  // Subjects
  getSubjects(): Subject[] {
    return this.getItem<Subject[]>(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
  }

  saveSubject(name: string, colorHex: string, icon: string = '📖'): Subject {
    const subjects = this.getSubjects();
    const newSubject: Subject = {
      id: 'sub_' + Date.now(),
      name,
      colorHex,
      icon,
    };
    subjects.push(newSubject);
    this.setItem(STORAGE_KEYS.SUBJECTS, subjects);
    return newSubject;
  }

  deleteSubject(id: string): void {
    const subjects = this.getSubjects().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.SUBJECTS, subjects);
  }

  // Topics
  getTopics(): Topic[] {
    return this.getItem<Topic[]>(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
  }

  saveTopic(topic: Omit<Topic, 'id' | 'studiedMinutes'>): Topic {
    const topics = this.getTopics();
    const newTopic: Topic = {
      ...topic,
      id: 'top_' + Date.now(),
      studiedMinutes: 0,
      confidenceScore: 50,
    };
    topics.push(newTopic);
    this.setItem(STORAGE_KEYS.TOPICS, topics);
    return newTopic;
  }

  updateTopic(updatedTopic: Topic): void {
    const topics = this.getTopics();
    const index = topics.findIndex(t => t.id === updatedTopic.id);
    if (index !== -1) {
      topics[index] = updatedTopic;
      this.setItem(STORAGE_KEYS.TOPICS, topics);
    }
  }

  deleteTopic(id: string): void {
    const topics = this.getTopics().filter(t => t.id !== id);
    this.setItem(STORAGE_KEYS.TOPICS, topics);
  }

  incrementTopicMinutes(subjectName: string, topicName: string, minutes: number): void {
    const topics = this.getTopics();
    const topic = topics.find(t => 
      t.subjectName.toLowerCase() === subjectName.toLowerCase() && 
      t.name.toLowerCase() === topicName.toLowerCase()
    );
    if (topic) {
      topic.studiedMinutes += minutes;
      this.setItem(STORAGE_KEYS.TOPICS, topics);
    }
  }

  // Sessions
  getSessions(): StudySession[] {
    return this.getItem<StudySession[]>(STORAGE_KEYS.SESSIONS, DEFAULT_SESSIONS);
  }

  logSession(session: Omit<StudySession, 'id' | 'timestamp'>): StudySession {
    const sessions = this.getSessions();
    const newSession: StudySession = {
      ...session,
      id: 'sess_' + Date.now(),
      timestamp: Date.now(),
    };
    sessions.unshift(newSession);
    this.setItem(STORAGE_KEYS.SESSIONS, sessions);

    // Increment topic studied time
    this.incrementTopicMinutes(session.subject, session.topic, session.durationMinutes);

    // Update streak logic
    this.updateDailyStreak();

    return newSession;
  }

  deleteSession(id: string): void {
    const sessions = this.getSessions().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.SESSIONS, sessions);
  }

  // Profile & Streak
  getUserProfile(): UserProfile {
    return this.getItem<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  }

  saveUserProfile(profile: UserProfile): void {
    this.setItem(STORAGE_KEYS.PROFILE, profile);
  }

  private updateDailyStreak(): void {
    const profile = this.getUserProfile();
    const today = new Date().toISOString().split('T')[0];

    if (profile.lastStudyDate === today) {
      return;
    }

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    if (profile.lastStudyDate === yesterday) {
      profile.streakDays += 1;
    } else if (profile.lastStudyDate !== today) {
      profile.streakDays = 1;
    }

    profile.lastStudyDate = today;
    this.saveUserProfile(profile);
  }

  // Weekly study data generator
  getWeeklyStudyData(): WeeklyStudyDay[] {
    const sessions = this.getSessions();
    const days: WeeklyStudyDay[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = dayNames[d.getDay()];

      const dayMinutes = sessions
        .filter(s => new Date(s.timestamp).toISOString().split('T')[0] === dateStr)
        .reduce((sum, s) => sum + s.durationMinutes, 0);

      days.push({
        dayLabel,
        dateString: dateStr,
        minutes: dayMinutes,
      });
    }

    return days;
  }

  // Reset demo data
  resetDemoData(): void {
    this.setItem(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
    this.setItem(STORAGE_KEYS.TOPICS, DEFAULT_TOPICS);
    this.setItem(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    this.setItem(STORAGE_KEYS.SESSIONS, DEFAULT_SESSIONS);
    this.setItem(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  }

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.TOPICS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    this.init();
  }
}

export const storageService = new StorageService();
