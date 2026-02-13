export type UserRole = 'student' | 'teacher' | 'admin' | 'superuser';
export type UserStatus = 'active' | 'pending';

export type CourseStatus = 'draft' | 'published' ;
export type ProgramStatus = 'draft' | 'live';
export type OrganizationStatus = 'active' | 'suspended' ;

export interface courseSettings {
  courseStatus: CourseStatus;
  trackingProgress: boolean;
  selfPacedLearning: boolean;
  certificateOnCompletion: boolean;
  gradedCourse: boolean;
}

export interface createCoursePayload {
  programIds?: number;
  courseId: number;
  courseSettingsId: number;
  courseModuleId:number[]
}

export interface teacherDashboardData{
  totalPrograms: number;
  totalCourses: number;
  totalLiveCourses: number;
  totalStudents: number;
  averageCompletions: number
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string;
  images?: string | null;
  birthday?: string | null;
  country?: string | null;
  gender?: string | null;
  levelOfEducation?: string | null;
  isArchived: boolean;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  organizationDetails?: OrganizationDetails;
  newStatus: UserStatus;

  emailNotificationEnabler?: boolean;
  smsNotificationEnabler?: boolean;
  pushNotificationEnabler?: boolean;

  // Optional backend-only fields
  password?: string;
  otp?: string;
  otpExpiresAt?: string;
  status?: 'pending' | 'active' | 'suspended';
  isVerified?: boolean;
  isDeleted?: boolean;
}

export interface OrganizationDetails {
  id: number;
  code: string;
  name: string;
}

export interface Organization {
  id: string;
  adminUserId: string;
  organizationCode: string | undefined;
  name: string;
  status: OrganizationStatus;
  description: string;
  logo?: string;
  primaryColor: string;
  emailCopyBranding?: string;
  createdAt: Date;
  updatedAt: Date;
  maxUsers: number;
  expiryDay: Date;
  organizationDetails: OrganizationDetails;
}

export interface CreateOrganizationResponse {
  message: string;
  Organization: Organization; // using your existing global Organization type
}

export interface GetOrganizationsResponse {
  message?: string;
  organizations: Organization[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  totalOrganizations: number;
}

export interface OrganizationSearchQuery {
  name?: string;
  organizationCode?: string;
}

export interface Course {
  id: string;
  courseId:string
  title: string;
  description: string;
  coverImage?: string;
  tags: string[];
  status: CourseStatus;
  trackingProgress: boolean;
  selfPacedLearning: boolean;
  certificateOnCompletion: boolean;
  gradedCourse: boolean;
  organizationId?: string;
  teacherId: string;
  modules: Module[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  courseId: string;
  lessons: Lesson[];
}

export type LessonType = 'video' | 'text' | 'pdf' | 'attachment' | 'quiz' | 'reflection';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  content: any; // Flexible content based on type
  order: number;
  moduleId: string;
  duration?: number; // in minutes
  isRequired: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  isGraded: boolean;
  passingScore?: number;
  duration?: number; // in minutes
  maxAttempts?: number;
  lessonId: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'short-text';
  options?: string[];
  correctAnswers: string[];
  explanation?: string;
  points?: number
}

export interface Program {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  status: ProgramStatus;
  requiresCertificate: boolean;
  organizationId?: string;
  courseGeneralIds: string[];
  requiredOrder: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId?: string;
  programId?: string;
  enrolledAt: Date;
  completedAt?: Date;
  progress: number;
  timeSpent: number; // in minutes
  lastAccessedAt?: Date;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  timeSpent: number;
  completedAt?: Date;
  score?: number;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId?: string;
  programId?: string;
  templateData: CertificateTemplate;
  generatedAt: Date;
  downloadUrl?: string;
}

export interface CertificateTemplate {
  name: string;
  course?: string;
  program?: string;
  completionDate: string;
  organization: string;
  variables: Record<string, string>;
}

export interface EmailTemplate {
  id: string;
  type: 'welcome' | 'password-reset' | 'account-verification' | 'account-deactivation' | 'course-completion';
  subject: string;
  body: string;
  variables: string[];
  organizationId?: string;
}

// Feedback and Survey Types
export interface FeedbackSurvey {
  id: string;
  courseId: string;
  questions: FeedbackQuestion[];
  isActive: boolean;
  createdAt: Date;
}

export interface FeedbackQuestion {
  id: string;
  type: 'rating' | 'text' | 'multiple-choice';
  question: string;
  options?: string[];
  required: boolean;
  order: number;
}

export interface FeedbackResponse {
  id: string;
  surveyId: string;
  userId: string;
  responses: Record<string, any>;
  submittedAt: Date;
}

// Reflection Types
export interface ReflectionSubmission {
  id: string;
  lessonId: string;
  userId: string;
  type: 'text' | 'file' | 'link';
  content: string;
  attachments?: string[];
  submittedAt: Date;
  feedback?: string;
  grade?: number;
  reviewedAt?: Date;
  reviewedBy?: string;
}

// Todo Types
export type TodoPriority = 'Low Priority' | 'Medium Priority' | 'High Priority';
export type TodoStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  tags?: string[];
  courseId?: string;
  lessonId?: string;
}

export interface TodoList {
  id: string;
  name: string;
  description?: string;
  items: TodoItem[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface CourseAnalytics {
  courseId: string;
  enrollments: number;
  completions: number;
  completionRate: number;
  averageScore: number;
  totalTimeSpent: number;
  studentEngagement: number;
  dropoffPoints: Array<{
    lesson: string;
    dropoffRate: number;
  }>;
  weeklyProgress: Array<{
    week: string;
    completions: number;
  }>;
}

export interface ProgramAnalytics {
  programId: string;
  enrollments: number;
  completions: number;
  completionRate: number;
  averageTimeToComplete: number;
  certificatesIssued: number;
  courseCompletionRates: Array<{
    course: string;
    rate: number;
  }>;
  studentProgression: Array<{
    stage: string;
    students: number;
  }>;
}

// Notification Types
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'announcement';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationStatus = 'unread' | 'read' | 'archived';
export interface NotificationPayload {
  enable: boolean
}


export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  userId?: string; // For user-specific notifications
  roles?: UserRole[]; // For role-based announcements
  courseId?: string; // For course-specific notifications
  organizationId?: string; // For org-wide announcements
  senderId?: string; // Who sent the notification
  senderName?: string; // Display name of sender
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date; // When the notification should be automatically archived
  recipientType?: 'All Users' | 'By Role' | 'By Course' | 'By User' | 'certificate';
}

export interface CreateNotificationResponse {
  success: boolean;
  data?: Notification;
  error?: string;
}

export interface NotificationPreferences {
  emailNotificationEnabler: boolean;
  pushNotificationEnabler: boolean;
  smsNotificationEnabler: boolean;
}

// Student Report Data Type
export interface StudentReportData {
  overallStats: {
    totalEnrolled: number;
    totalCompleted: number;
    totalTimeSpent: number;
    certificatesEarned: number;
    averageScore: number;
    totalLogins: number;
    averageSessionDuration: number;
    streakDays: number;
  };
  enrolledCourses: Array<{
    id: string;
    title: string;
    description: string;
    completionStatus: string;
    instructor: string;
    timeSpent: number;
    lastAccessed?: Date;
    grade?: number;
    certificateAvailable: boolean;
    progress: number;
  }>;
  certificates: Certificate[];
  testResults: Array<{
    id: string;
    courseId: string;
    score: number;
    maxScore: number;
    percentage: number;
    attemptNumber: number;
    submittedAt: Date;
  }>;
  learningActivities: Array<{
    id: string;
    type: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  accessLogs: Array<{
    id: string;
    loginTime: Date;
    logoutTime?: Date;
    duration?: number;
    ipAddress: string;
    userAgent: string;
  }>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string;
}
export interface RegisterForm extends RegisterPayload {
  confirmPassword: string;
}
export interface CourseForm {
  title: string;
  description: string;
  tags: string[];
  status: CourseStatus;
  isTracked: boolean;
  allowSelfPacing: boolean;
  requiresCertificate: boolean;
  isGraded: boolean;
  coverImage?: File | string;
}

// Organization Code Types
export interface OrganizationCode {
  id: string;
  orgId: string;
  code: string;
  expiry: Date;
  maxUses: number;
  usedCount: number;
  createdAt: Date;
  createdBy: string;
}

// UI State Types
export interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  loading: boolean;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  viewAsUser: (userId: string) => Promise<void>;
  exitViewAs: () => void;
  isViewingAs: boolean;
  originalUser: User | null;
}

export interface ActiveOrganizationStats {
  totalOrganizations: number;
  activeOrganizations: number;
  message?: string;
}

export interface ActiveUserStats {
  activeUsers: number;
  totalUsers: number;
  message?: string;
}

export interface SystemHealthStats {
  message?: string;
  readableUptime: string;
  systemHealthPercentage: number;
  totalUptimeSeconds: number;
}

export interface OrganizationSummary {
  id: number;
  name: string;
  registeredUsers: number;
  createdAt: string;
  CreatorDetails: {
    id: number;
    name: string;
    email: string;
  };
}

export interface RecentOrganizationStats {
  count: number;
  message?: string;
  recentOrganizations: OrganizationSummary[];
}

export interface userStats {
  totalUsers: number;
  activeUsers: number;

}

export interface PlatformStatsResponse {
  message: string;
  systemHealth: SystemHealth;
  responseTime: ResponseTime;
  userStatistics: userStats;
  storage: StorageStats;
}
export interface SystemHealth {
  percentage: number;
  readableUptime: string;
}

export interface ResponseTime {
  value: number; // numeric, e.g., 0.12
  unit: string; // e.g., "ms"
}

export interface StorageStats {
  nodeProcessMemory: NodeProcessMemory;
  systemMemory: SystemMemory;
}

export interface NodeProcessMemory {
  totalHeap: string; // e.g., "32.25 MB"
  usedHeap: string; // e.g., "30.26 MB"
}

export interface SystemMemory {
  freeSystemMemory: string; // e.g., "14.2 GB"
  totalSystemMemory: string; // e.g., "30.65 GB"
}

export interface ResourceUsage {
  storageUsed: string;
  totalStorage: string;
  bandwidthUsed: string;
  totalBandwidth: string;
  databaseSize: string;
  totalDatabaseCapacity: string;
  backupStatus: string;
}

export interface UsagePatterns {
  peakHours: string;
  mostActiveDay: string;
  avgSessionDuration: string;
  mobileUsage: string;
  peakConcurrentUsers: number;
}

export interface SystemUsageResponse {
  resourceUsage: ResourceUsage;
  usagePatterns: UsagePatterns;
}
export interface UserSearchQuery {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'admin' | 'student' | 'teacher' | 'superuser';
}

export  interface adminSearchQuery {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  accountNumber?: string;
}

export interface ActiveUsersResponse {
  message?: string;
  totalUsersInOrg: number;
  totalActiveUsers: number;
  totalPages: number;
  currentPage: number;
  users: User[];
}

export interface PendingUsersResponse {
  message?: string;
  totalUsersInOrg: number;
  totalPendingUsers: number;
  totalPages: number;
  currentPage: number;
  users: User[];
}

export interface SuspendedUsersResponse {
  message: string;
  totalUsersInOrg: number;
  totalPendingUsers: number;
  totalPages: number;
  currentPage: number;
  users: User[];
}

export interface DeletedUsersResponse {
  message: string;
  totalUsersInOrg: number;
  totalDeletedUsers: number;
  totalPages: number;
  currentPage: number;
  users: User[];
}

export type ActivityType = "user_registration" | "user_login" | "user_profileUpdate"

export interface UserRegistrationData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role:string;
  createdAt: string
}

export interface Activity<T = any>{
  type: ActivityType;
  data: T;
  createdAt: string
}

export interface RecentActivitiesResponse{
  message: string;
  activities: Activity<UserRegistrationData>[];
}

export interface RecentUser{
  id:number;
  firstName: string;
  lastName: string;
  email: string;
  role:UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface RecentUserResponse{
  message: string;
  users:RecentUser[];
}

export interface OrganizationStats {
  totalUsers: number;
  totalCourses: number;
  totalPrograms: number;
  activeEnrollments: number;
}

export interface OrganizationStatsResponse{
  message: string;
  stats: OrganizationStats;
}

// types for fetching course details on teacher dashboard
export interface CourseResponse {
  id: number;
  program: Program | null;
  course: Courses;
  settings: CourseSettings;
  modules: CourseModule[];
  enrollmentStats: EnrollmentStats;
  enrolledStudents: EnrolledStudent[];
  teacher: Teacher;
  organization: Organization;
  createdAt: string;
  updatedAt: string;
}
export interface CourseListItem {
  id: number;
  title: string;
  description: string;
  tags: string[];
  coverImage: string | null;
  status: CourseStatus;
  modulesCount: number;
  programCertificate: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface Courses {
  id: number;
  title: string;
  description: string; // HTML string
  tags: string[];
  images: string[];
}

export interface CourseSettings {
  id: number;
  courseStatus: CourseStatus
  trackingProgress: boolean;
  selfPacedLearning: boolean;
  certificateOnCompletion: boolean;
  gradedCourse: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: number;
  moduleNumber: number;
  title: string;
  description: string; // HTML string
  contents: CourseLesson[];
  createdAt: string;
}

export interface CourseLesson {
  id: number;
  lessonNumber: number;
  title: string;
  lessonDescription: string;
  lessonType: LessonType;

  videoUrl: string | null;
  videoDuration: number | null;

  textContent: string | null;
  pdfUrl: string | null;
  fileAttachmentURL: string | null;

  quizPassingScore: number | null;
  quizDuration: number | null;
  quizMaxAttempts: number | null;

  reflectionPrompt: string | null;
  images: string[];

  createdAt: string;
}

export interface EnrollmentStats {
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
}

export interface EnrolledStudent {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  progress?: number;
  completed?: boolean;
}

export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  role: 'teacher' | 'admin';
  organizationId: string;
}

export interface programStats {
  totalPrograms: number;
  totalLivePrograms: number;
  programsWithCertificates: number;
  availableCourses: number;
}

export interface teacherAnalyticsStats {
  totalCourses: number;
  totalStudents: number;
  averageCompletionRate: number;
  totalCertificatesIssued: number;
}

export interface coursePerformanceAnalytics {
  id:string;
  courseName: string;
  courseStatus: CourseStatus;
  studentCount: number;
  completionRate: number;
  averageScore: number;
}

export interface dashboardAnalyticsResponse {
  totalStudents: number;
  completionRate: number;
  averageTimeSpentHours?: number;
}

export interface programPayload{
  title: string
  description: string
  images:string
  programStatus: CourseStatus
  requiredCourseOrder: boolean
  programCertificate: boolean;
  courseGeneralIds: number[]
}

export interface AnalyticsMetrics {
  activeUsers: number;
  newEnrollments: number;
  completions: number;
}
export interface AnalyticsSummary extends AnalyticsMetrics {}
export interface DailyAnalyticsBreakdown extends AnalyticsMetrics {
  date: string;
}
export interface AnalyticsPeriod {
  startDate: string; 
  endDate: string;
}

export interface DashboardAnalyticsData {
  summary: AnalyticsSummary;
  dailyBreakdown: DailyAnalyticsBreakdown[];
  period: AnalyticsPeriod;
}
export interface DashboardAnalyticsResponse {
  data: DashboardAnalyticsData;
}

export interface PopularCourse {
  courseId: number;
  courseName: string;
  courseDescription: string;
  courseStatus: 'draft' | 'published';
  enrolledStudents: number;
  completionRate: number;
  totalContent: number;
  createdAt: string;
}

export interface EditModulePayload{
   moduleNumber: number;    
   title: string;
    description: string
  courseContentId: number[];
}
export interface studentOverviewStats {
  totalEnrolledCourses: number;
  totalCompletedCourses: number;
  totalTimeSpent: string;
  certificatesEarned: number;
  averageScore: string;
  totalLogins: number;
  averageSessionTime: string;
  totalDayStreak: number;
}

export type SessionStatusText = 'Session still active' | 'Session in progress';

export interface StudentLoginHistorySession {
  sessionId: number;
  loginTime: string;
  logoutTime: string | SessionStatusText;
  duration: string | SessionStatusText;
  ipAddress: string;
  device: string;
}

export interface StudentLoginHistoryResponse {
  message: string;
  totalSessions: number;
  totalPages: number;
  currentPage: number;
  sessions: StudentLoginHistorySession[];
}

export type QuizAnswerValue = string | string[];

export interface SubmitQuizPayload {
  submissionId: string;
  answers: Record<string, QuizAnswerValue>;
}



interface Enrolledstudent {
  id: number;
  firstName: string;
  lastName: string;
}

export interface CourseItem {
  id: string;
  course: {
    title: string;
    description: string;
    images: string;
  };
  enrolledStudents: Enrolledstudent[];
  modules?: any[];
  settings?: {
    courseStatus?: string;
    selfPacedLearning?: boolean;
    certificateOnCompletion?: boolean;
  };
}

export interface ProgressModule {
  id: number;
  title: string;
  moduleNumber: number;
  description: string;
}
export interface StudentProgressRecord {
  id: number;
  studentId: number;
  moduleId: number;
  courseId: number;
  isCompleted: boolean;
  completedAt: string | null; // ISO date string
  createdAt: string;
  updatedAt: string;
  ProgressModule: ProgressModule;
}

export interface StudentCourseProgressData {
  courseId: number;
  totalContent: number;
  completedContent: number;
  progressPercentage: number;
  progressRecords: StudentProgressRecord[];
}

export interface StudentCourseProgressResponse {
  message: string;
  data: StudentCourseProgressData;
}

export interface ProgressRecord {
  trackContentId: string | null;
  trackModuleId: string | null;
  trackCourseId: string | null;
}

export interface StudentOverview {
  enrolledCourses: number;
  programs: number;
  hoursLearned: string;
  certificates: number;
}

export interface CertificateElementDTO {
  certificateId: string;
  textSource: string;
  textColor: string | null;
  fontSize: number;
  width: number;
  height: number;
  positionX: number;
  positionY: number;
}
   
export interface courseDescription {
  id:string;
  courseTitle: string;
  description: string;
}

export interface CreateCertificateTemplateDTO {
  CourseDescription: courseDescription;
  templateName: string;
  courseId: string;
  accentColor: string;
  defaultTextColor: string;
  borderStyle: 'Simple' | 'Modern' | 'Ornate';
  fontFamily: string;
  customText: string;
  content: CertificateElementDTO[];

  backgroundImage?: File;
  logoUpload?: File;
}







