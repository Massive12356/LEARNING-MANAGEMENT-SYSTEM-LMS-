export type UserRole = 'student' | 'teacher' | 'admin' | 'superuser';

export type CourseStatus = 'draft' | 'live';
export type ProgramStatus = 'draft' | 'live';
export type OrganizationStatus = 'draft' | 'live' | 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string;
  profileImage?: string;
  birthday?: string;
  country?: string;
  gender?: string;
  levelOfEducation?: string;
  isArchived: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  organizationCode: string | undefined;
  id: string;
  name: string;
  status: OrganizationStatus;
  description: string;
  logo?: string;
  primaryColor: string;
  emailCopyBranding?: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface Course {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  tags: string[];
  status: CourseStatus;
  isTracked: boolean;
  allowSelfPacing: boolean;
  requiresCertificate: boolean;
  isGraded: boolean;
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
  lessonId: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'short-text';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  status: ProgramStatus;
  requiresCertificate: boolean;
  organizationId?: string;
  courseIds: string[];
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
  type: 'welcome' | 'password-reset' | 'course-completion';
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
export type TodoPriority = 'low' | 'medium' | 'high';
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

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  userId?: string; // For user-specific notifications
  role?: UserRole; // For role-based announcements
  courseId?: string; // For course-specific notifications
  organizationId?: string; // For org-wide announcements
  senderId?: string; // Who sent the notification
  senderName?: string; // Display name of sender
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date; // When the notification should be automatically archived
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

export interface ActiveUserStats{
  activeUsers: number,
  totalUsers: number,
  message?:string
}

export interface SystemHealthStats{
message?: string,
readableUptime: string,
systemHealthPercentage:number,
totalUptimeSeconds:number
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

export interface userStats{
totalUsers: number,
activeUsers:number,
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

