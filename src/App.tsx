import React, { useState, useEffect } from 'react';
import { ScreenId, Task, Subject, Topic, StudySession, UserProfile, AuthUser } from './types';
import { storageService } from './services/storage';
import { authService } from './services/firebase';
import { Sidebar } from './components/navigation/Sidebar';
import { BottomNav } from './components/navigation/BottomNav';
import { SplashScreen } from './components/common/SplashScreen';
import { AuthModal } from './components/auth/AuthModal';

// Screens
import { DashboardScreen } from './components/screens/DashboardScreen';
import { StudyTimerScreen } from './components/screens/StudyTimerScreen';
import { PlannerScreen } from './components/screens/PlannerScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { TopicsScreen } from './components/screens/TopicsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { LandingScreen } from './components/screens/LandingScreen';

export const App: React.FC = () => {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initialize storage once
  useEffect(() => {
    storageService.init();

    // Listen to Firebase auth changes
    const unsubscribeAuth = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const [currentScreen, setCurrentScreen] = useState<ScreenId>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(() => storageService.getTasks());
  const [subjects, setSubjects] = useState<Subject[]>(() => storageService.getSubjects());
  const [topics, setTopics] = useState<Topic[]>(() => storageService.getTopics());
  const [sessions, setSessions] = useState<StudySession[]>(() => storageService.getSessions());
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getUserProfile());

  // Timer focus target
  const [timerSubject, setTimerSubject] = useState<string | undefined>(undefined);
  const [timerTopic, setTimerTopic] = useState<string | undefined>(undefined);

  // Refresh helper
  const reloadData = () => {
    setTasks(storageService.getTasks());
    setSubjects(storageService.getSubjects());
    setTopics(storageService.getTopics());
    setSessions(storageService.getSessions());
    setProfile(storageService.getUserProfile());
  };

  // Derived today stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(
    s => new Date(s.timestamp).toISOString().split('T')[0] === todayStr
  );
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const todaySessionsCount = todaySessions.length;
  const weeklyData = storageService.getWeeklyStudyData();

  // Task actions
  const handleToggleTask = (taskId: string) => {
    storageService.toggleTaskCompletion(taskId);
    reloadData();
  };

  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    storageService.saveTask(newTask);
    reloadData();
  };

  const handleEditTask = (updatedTask: Task) => {
    storageService.updateTask(updatedTask);
    reloadData();
  };

  const handleDeleteTask = (taskId: string) => {
    storageService.deleteTask(taskId);
    reloadData();
  };

  const handleStartStudyForTask = (task: Task) => {
    setTimerSubject(task.subject);
    setTimerTopic(task.topic);
    setCurrentScreen('study');
  };

  const handleStartStudyForTopic = (subjectName: string, topicName: string) => {
    setTimerSubject(subjectName);
    setTimerTopic(topicName);
    setCurrentScreen('study');
  };

  // Session complete
  const handleSessionComplete = (session: Omit<StudySession, 'id' | 'timestamp'>) => {
    storageService.logSession(session);
    reloadData();
  };

  const handleDeleteSession = (sessionId: string) => {
    storageService.deleteSession(sessionId);
    reloadData();
  };

  // Subject actions
  const handleAddSubject = (name: string, colorHex: string) => {
    storageService.saveSubject(name, colorHex);
    reloadData();
  };

  const handleDeleteSubject = (id: string) => {
    storageService.deleteSubject(id);
    reloadData();
  };

  // Topic actions
  const handleAddTopic = (newTopic: Omit<Topic, 'id' | 'studiedMinutes'>) => {
    storageService.saveTopic(newTopic);
    reloadData();
  };

  const handleDeleteTopic = (id: string) => {
    storageService.deleteTopic(id);
    reloadData();
  };

  // Profile actions
  const handleUpdateProfile = (newProfile: UserProfile) => {
    storageService.saveUserProfile(newProfile);
    setProfile(newProfile);
  };

  const handleResetDemoData = () => {
    storageService.resetDemoData();
    reloadData();
  };

  const handleClearAllData = () => {
    storageService.clearAllData();
    reloadData();
  };

  if (currentScreen === 'landing') {
    return <LandingScreen onNavigate={setCurrentScreen} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row antialiased selection:bg-purple-600/30 selection:text-purple-200">
      {/* Starting Splash Screen with "Made by Sunny" */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* User Login & Profile Modal (Google + Phone OTP) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Desktop Navigation Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        streakDays={profile.streakDays}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            profile={profile}
            tasks={tasks}
            todayMinutes={todayMinutes}
            todaySessionsCount={todaySessionsCount}
            weeklyData={weeklyData}
            onToggleTask={handleToggleTask}
            onStartStudyForTask={handleStartStudyForTask}
            onNavigate={setCurrentScreen}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
          />
        )}

        {currentScreen === 'study' && (
          <StudyTimerScreen
            subjects={subjects}
            topics={topics}
            activeSubject={timerSubject}
            activeTopic={timerTopic}
            soundEnabled={profile.soundEnabled}
            onSessionComplete={handleSessionComplete}
          />
        )}

        {currentScreen === 'planner' && (
          <PlannerScreen
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onStartStudyForTask={handleStartStudyForTask}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {currentScreen === 'analytics' && (
          <AnalyticsScreen
            sessions={sessions}
            subjects={subjects}
            topics={topics}
            weeklyData={weeklyData}
            todayMinutes={todayMinutes}
            dailyGoalMinutes={profile.dailyGoalMinutes}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {currentScreen === 'topics' && (
          <TopicsScreen
            subjects={subjects}
            topics={topics}
            onStartStudyForTopic={handleStartStudyForTopic}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
            onAddTopic={handleAddTopic}
            onDeleteTopic={handleDeleteTopic}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onResetDemoData={handleResetDemoData}
            onClearAllData={handleClearAllData}
            onNavigate={setCurrentScreen}
            currentUser={currentUser}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
      />
    </div>
  );
};
export default App;
