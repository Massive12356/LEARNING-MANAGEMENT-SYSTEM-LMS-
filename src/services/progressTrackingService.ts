import { LessonProgress, Enrollment, User, Course, Module, Lesson } from '../types';

export interface DetailedProgress {
  userId: string;
  courseId: string;
  lessonId: string;
  moduleId: string;
  completed: boolean;
  timeSpent: number; // in minutes
  attempts: number;
  score?: number;
  lastAttemptScore?: number;
  bestScore?: number;
  startedAt: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  bookmarked: boolean;
  notes?: string;
  sessionData?: {
    startTime: Date;
    endTime?: Date;
    interactions: number;
    pausedDuration: number;
  };
}

export interface ProgressSummary {
  userId: string;
  courseId: string;
  overallProgress: number; // 0-100
  completedLessons: number;
  totalLessons: number;
  completedModules: number;
  totalModules: number;
  totalTimeSpent: number; // in minutes
  averageScore?: number;
  lastAccessedAt: Date;
  estimatedTimeToComplete?: number; // in minutes
  streak: number; // consecutive days
  achievements: string[];
}

export interface LearningSession {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  startTime: Date;
  endTime?: Date;
  timeSpent: number;
  completed: boolean;
  score?: number;
  interactionCount: number;
  pausedTime: number;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  location?: string;
}

export interface ProgressMilestone {
  id: string;
  type: 'lesson_complete' | 'module_complete' | 'course_complete' | 'quiz_passed' | 'streak_achieved' | 'time_spent';
  title: string;
  description: string;
  achievedAt: Date;
  points?: number;
  badge?: string;
}

class ProgressTrackingService {
  private sessions: Map<string, LearningSession> = new Map();
  private progressData: Map<string, DetailedProgress[]> = new Map();
  private sessionTimeouts: Map<string, NodeJS.Timeout> = new Map();
  
  // Session Management
  startLearningSession(userId: string, courseId: string, lessonId: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: LearningSession = {
      id: sessionId,
      userId,
      courseId,
      lessonId,
      startTime: new Date(),
      timeSpent: 0,
      completed: false,
      interactionCount: 0,
      pausedTime: 0,
      deviceType: this.detectDeviceType(),
      location: this.detectUserLocation()
    };
    
    this.sessions.set(sessionId, session);
    
    // Set up auto-save interval
    const timeout = setInterval(() => {
      this.updateSessionProgress(sessionId);
    }, 30000); // Update every 30 seconds
    
    this.sessionTimeouts.set(sessionId, timeout);
    
    return sessionId;
  }

  endLearningSession(sessionId: string, completed: boolean = false, score?: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.endTime = new Date();
    session.completed = completed;
    if (score !== undefined) session.score = score;
    
    // Clear auto-save interval
    const timeout = this.sessionTimeouts.get(sessionId);
    if (timeout) {
      clearInterval(timeout);
      this.sessionTimeouts.delete(sessionId);
    }

    // Save final progress
    this.updateSessionProgress(sessionId);
    this.sessions.delete(sessionId);
  }

  pauseLearningSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.pausedTime += Date.now() - session.startTime.getTime();
    // In a real implementation, you'd track actual pause/resume times
  }

  recordInteraction(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.interactionCount++;
    }
  }

  // Progress Updates
  private updateSessionProgress(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const now = new Date();
    session.timeSpent = Math.floor((now.getTime() - session.startTime.getTime() - session.pausedTime) / 60000);

    // Update detailed progress
    this.updateDetailedProgress({
      userId: session.userId,
      courseId: session.courseId,
      lessonId: session.lessonId,
      moduleId: 'mock-module', // In real app, derive from lesson
      completed: session.completed,
      timeSpent: session.timeSpent,
      attempts: 1, // Track actual attempts
      score: session.score,
      startedAt: session.startTime,
      completedAt: session.completed ? now : undefined,
      lastAccessedAt: now,
      bookmarked: false
    });
  }

  updateDetailedProgress(progress: Partial<DetailedProgress> & { userId: string; courseId: string; lessonId: string }): void {
    const key = `${progress.userId}_${progress.courseId}`;
    const existingProgress = this.progressData.get(key) || [];
    
    const lessonProgressIndex = existingProgress.findIndex(p => p.lessonId === progress.lessonId);
    
    if (lessonProgressIndex >= 0) {
      // Update existing progress
      existingProgress[lessonProgressIndex] = {
        ...existingProgress[lessonProgressIndex],
        ...progress,
        lastAccessedAt: new Date()
      };
    } else {
      // Create new progress entry
      const newProgress: DetailedProgress = {
        userId: progress.userId,
        courseId: progress.courseId,
        lessonId: progress.lessonId,
        moduleId: progress.moduleId || 'mock-module',
        completed: progress.completed || false,
        timeSpent: progress.timeSpent || 0,
        attempts: progress.attempts || 1,
        score: progress.score,
        startedAt: progress.startedAt || new Date(),
        lastAccessedAt: new Date(),
        bookmarked: progress.bookmarked || false,
        notes: progress.notes
      };
      existingProgress.push(newProgress);
    }
    
    this.progressData.set(key, existingProgress);
    
    // Check for milestones
    this.checkMilestones(progress.userId, progress.courseId);
  }

  // Progress Retrieval
  async getDetailedProgress(userId: string, courseId: string): Promise<DetailedProgress[]> {
    const key = `${userId}_${courseId}`;
    return this.progressData.get(key) || [];
  }

  async getProgressSummary(userId: string, courseId: string): Promise<ProgressSummary> {
    const detailedProgress = await this.getDetailedProgress(userId, courseId);
    
    const completedLessons = detailedProgress.filter(p => p.completed).length;
    const totalLessons = await this.getTotalLessons(courseId);
    const totalTimeSpent = detailedProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    
    const scoresWithValues = detailedProgress.filter(p => p.score !== undefined);
    const averageScore = scoresWithValues.length > 0 
      ? scoresWithValues.reduce((sum, p) => sum + (p.score || 0), 0) / scoresWithValues.length 
      : undefined;

    return {
      userId,
      courseId,
      overallProgress: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
      completedLessons,
      totalLessons,
      completedModules: await this.getCompletedModulesCount(userId, courseId),
      totalModules: await this.getTotalModules(courseId),
      totalTimeSpent,
      averageScore,
      lastAccessedAt: this.getLastAccessedDate(detailedProgress),
      estimatedTimeToComplete: this.calculateEstimatedTime(detailedProgress, totalLessons),
      streak: await this.calculateStreak(userId),
      achievements: await this.getUserAchievements(userId, courseId)
    };
  }

  async getUserProgress(userId: string): Promise<ProgressSummary[]> {
    const allProgress: ProgressSummary[] = [];
    
    // Get all courses for user (mock data)
    const enrolledCourses = await this.getEnrolledCourses(userId);
    
    for (const courseId of enrolledCourses) {
      const summary = await this.getProgressSummary(userId, courseId);
      allProgress.push(summary);
    }
    
    return allProgress;
  }

  // Milestone and Achievement System
  private async checkMilestones(userId: string, courseId: string): Promise<void> {
    const summary = await this.getProgressSummary(userId, courseId);
    const milestones: ProgressMilestone[] = [];

    // Check completion milestones
    if (summary.overallProgress === 100) {
      milestones.push({
        id: `course_complete_${courseId}`,
        type: 'course_complete',
        title: 'Course Completed!',
        description: 'Congratulations on completing the entire course!',
        achievedAt: new Date(),
        points: 100,
        badge: 'completion'
      });
    }

    // Check time spent milestones
    if (summary.totalTimeSpent >= 60) { // 1 hour
      milestones.push({
        id: `time_spent_1h_${courseId}`,
        type: 'time_spent',
        title: 'Dedicated Learner',
        description: 'Spent 1 hour learning!',
        achievedAt: new Date(),
        points: 25,
        badge: 'time'
      });
    }

    // Check streak milestones
    if (summary.streak >= 7) {
      milestones.push({
        id: `streak_7_${userId}`,
        type: 'streak_achieved',
        title: 'Week Warrior',
        description: '7 days learning streak!',
        achievedAt: new Date(),
        points: 50,
        badge: 'streak'
      });
    }

    // Save milestones (in real app, this would be persisted)
    console.log('New milestones achieved:', milestones);
  }

  // Analytics and Reporting
  async generateLearningReport(userId: string, courseId?: string, timeRange?: { start: Date; end: Date }): Promise<any> {
    const userProgress = courseId 
      ? [await this.getProgressSummary(userId, courseId)]
      : await this.getUserProgress(userId);

    const detailedData = courseId 
      ? await this.getDetailedProgress(userId, courseId)
      : [];

    return {
      summary: {
        totalCourses: userProgress.length,
        completedCourses: userProgress.filter(p => p.overallProgress === 100).length,
        totalTimeSpent: userProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0),
        averageProgress: userProgress.reduce((sum, p) => sum + p.overallProgress, 0) / userProgress.length,
        currentStreak: userProgress[0]?.streak || 0
      },
      dailyActivity: this.generateDailyActivity(detailedData, timeRange),
      weakAreas: this.identifyWeakAreas(detailedData),
      recommendations: this.generateRecommendations(userProgress),
      achievements: await this.getUserAchievements(userId, courseId)
    };
  }

  private generateDailyActivity(progress: DetailedProgress[], timeRange?: { start: Date; end: Date }): any[] {
    // Mock daily activity data
    const days: any[] = [];
    const startDate = timeRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = timeRange?.end || new Date();

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayProgress = progress.filter(p => 
        p.lastAccessedAt.toDateString() === date.toDateString()
      );

      days.push({
        date: new Date(date),
        lessonsCompleted: dayProgress.filter(p => p.completed).length,
        timeSpent: dayProgress.reduce((sum, p) => sum + p.timeSpent, 0),
        averageScore: this.calculateAverageScore(dayProgress)
      });
    }

    return days;
  }

  private identifyWeakAreas(progress: DetailedProgress[]): any[] {
    const weakAreas = progress
      .filter(p => p.score && p.score < 70)
      .map(p => ({
        lessonId: p.lessonId,
        score: p.score,
        attempts: p.attempts,
        recommendation: 'Review and practice more'
      }));

    return weakAreas;
  }

  private generateRecommendations(progress: ProgressSummary[]): string[] {
    const recommendations: string[] = [];

    progress.forEach(courseProgress => {
      if (courseProgress.overallProgress < 25) {
        recommendations.push(`Get started with ${courseProgress.courseId} - you're just beginning!`);
      } else if (courseProgress.overallProgress < 75) {
        recommendations.push(`Keep going with ${courseProgress.courseId} - you're making great progress!`);
      } else if (courseProgress.overallProgress < 100) {
        recommendations.push(`Almost there! Finish ${courseProgress.courseId} to earn your certificate.`);
      }
    });

    return recommendations;
  }

  // Utility Methods
  private detectDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private detectUserLocation(): string {
    // Mock location detection - in real app, use geolocation API
    return 'Unknown';
  }

  private async getTotalLessons(courseId: string): Promise<number> {
    // Mock - in real app, fetch from course data
    return 20;
  }

  private async getTotalModules(courseId: string): Promise<number> {
    // Mock - in real app, fetch from course data
    return 5;
  }

  private async getCompletedModulesCount(userId: string, courseId: string): Promise<number> {
    // Mock calculation
    return 3;
  }

  private getLastAccessedDate(progress: DetailedProgress[]): Date {
    return progress.reduce((latest, p) => 
      p.lastAccessedAt > latest ? p.lastAccessedAt : latest, 
      new Date(0)
    );
  }

  private calculateEstimatedTime(progress: DetailedProgress[], totalLessons: number): number {
    if (progress.length === 0) return 0;
    
    const avgTimePerLesson = progress.reduce((sum, p) => sum + p.timeSpent, 0) / progress.length;
    const remainingLessons = totalLessons - progress.filter(p => p.completed).length;
    
    return Math.ceil(avgTimePerLesson * remainingLessons);
  }

  private async calculateStreak(userId: string): Promise<number> {
    // Mock streak calculation
    return Math.floor(Math.random() * 14) + 1;
  }

  private async getUserAchievements(userId: string, courseId?: string): Promise<string[]> {
    // Mock achievements
    return ['First Lesson', 'Quick Learner', 'Consistent Student'];
  }

  private async getEnrolledCourses(userId: string): Promise<string[]> {
    // Mock enrolled courses
    return ['course-1', 'course-2', 'course-3'];
  }

  private calculateAverageScore(progress: DetailedProgress[]): number | undefined {
    const withScores = progress.filter(p => p.score !== undefined);
    if (withScores.length === 0) return undefined;
    
    return withScores.reduce((sum, p) => sum + (p.score || 0), 0) / withScores.length;
  }

  // Bookmarking and Notes
  async toggleBookmark(userId: string, courseId: string, lessonId: string): Promise<void> {
    const key = `${userId}_${courseId}`;
    const progressData = this.progressData.get(key) || [];
    const lessonProgress = progressData.find(p => p.lessonId === lessonId);
    
    if (lessonProgress) {
      lessonProgress.bookmarked = !lessonProgress.bookmarked;
      this.progressData.set(key, progressData);
    }
  }

  async addNote(userId: string, courseId: string, lessonId: string, note: string): Promise<void> {
    const key = `${userId}_${courseId}`;
    const progressData = this.progressData.get(key) || [];
    const lessonProgress = progressData.find(p => p.lessonId === lessonId);
    
    if (lessonProgress) {
      lessonProgress.notes = note;
      this.progressData.set(key, progressData);
    }
  }

  async getBookmarkedLessons(userId: string, courseId: string): Promise<DetailedProgress[]> {
    const progress = await this.getDetailedProgress(userId, courseId);
    return progress.filter(p => p.bookmarked);
  }
}

export const progressTrackingService = new ProgressTrackingService();