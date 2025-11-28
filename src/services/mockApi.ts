import { 
  User, 
  Course, 
  Program, 
  Organization, 
  Enrollment, 
  Certificate,
  EmailTemplate,
  LoginForm,
  RegisterForm,
  ApiResponse,
  PaginatedResponse,
  Quiz,
  LessonProgress,
  ReflectionSubmission,
  OrganizationCode
} from '../types';
import { mockUsers, mockCourses, mockPrograms, mockOrganizations } from './mockData';
import { authService } from './authService';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock JWT token generation
const generateToken = (userId: string) => `mock-jwt-token-${userId}-${Date.now()}`;

// Mock API service class
class MockApiService {
  private users: User[] = mockUsers;
  private courses: Course[] = mockCourses;
  private programs: Program[] = mockPrograms;
  private organizations: Organization[] = mockOrganizations;
  private organizationCodes: OrganizationCode[] = [];
  private provisionalUsers: any[] = [];
  private enrollments: Enrollment[] = [];
  private certificates: Certificate[] = [];
  private emailTemplates: EmailTemplate[] = [
    {
      id: '1',
      type: 'welcome',
      subject: 'Welcome to {{organizationName}}!',
      body: 'Hi {{firstName}},\n\nWelcome to our learning platform! We\'re excited to have you join us.\n\nBest regards,\nThe {{organizationName}} Team',
      variables: ['firstName', 'organizationName']
    },
    {
      id: '2',
      type: 'password-reset',
      subject: 'Reset Your Password for {{organizationName}}',
      body: 'Hi {{firstName}},\n\nWe received a request to reset your password for {{organizationName}}. Click the link below to reset your password:\n\n{{resetLink}}\n\nThis link will expire in 24 hours.\n\nIf you didn\'t request this, please ignore this email.\n\nBest regards,\nThe {{organizationName}} Team',
      variables: ['firstName', 'organizationName', 'resetLink']
    },
    {
      id: '3',
      type: 'course-completion',
      subject: 'Congratulations on Completing {{courseName}}!',
      body: 'Hi {{firstName}},\n\nCongratulations on successfully completing {{courseName}}!\n\n{{certificateAvailable}}\n\nWe hope you enjoyed the course and found it valuable.\n\nBest regards,\nThe {{organizationName}} Team',
      variables: ['firstName', 'courseName', 'organizationName', 'certificateAvailable']
    }
  ];

  // Password Reset with Verification Code
  private verificationCodes: Map<string, { code: string; expiresAt: Date }> = new Map();

  async sendVerificationCode(email: string): Promise<void> {
    await delay();
    
    // Check if user exists
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    // For demo purposes, use a fixed code for John Student
    // In production, generate a random 4-digit code
    let code = '1234'; // Default demo code
    
    // If it's not the demo user, generate a random code
    if (email !== 'john.student@example.com') {
      code = Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    // Store code with 10-minute expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    this.verificationCodes.set(email, { code, expiresAt });
    
    // Debug logging
    console.log(`[SEND] Stored verification code for ${email}: ${code}`);
    console.log(`[SEND] Current verification codes map size:`, this.verificationCodes.size);
    console.log(`[SEND] All stored codes:`, Array.from(this.verificationCodes.entries()));
    
    // In a real implementation, you would send the code via email
    console.log(`Verification code for ${email}: ${code}`);
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    await delay();
    
    console.log(`[VERIFY] Attempting to verify code ${code} for email ${email}`);
    console.log(`[VERIFY] Email length:`, email.length);
    console.log(`[VERIFY] Email type:`, typeof email);
    console.log(`[VERIFY] Code length:`, code.length);
    console.log(`[VERIFY] Code type:`, typeof code);
    console.log(`[VERIFY] Current verification codes map size:`, this.verificationCodes.size);
    console.log(`[VERIFY] All stored codes:`, Array.from(this.verificationCodes.entries()));
    
    // Special handling for demo user
    if (email === 'john.student@example.com' && code === '1234') {
      console.log(`[VERIFY] Demo user with correct code, bypassing normal verification`);
      // Remove the stored code if it exists
      if (this.verificationCodes.has(email)) {
        this.verificationCodes.delete(email);
      }
      return true;
    }
    
    // Normalize email (trim whitespace)
    const normalizedEmail = email.trim();
    console.log(`[VERIFY] Normalized email: ${normalizedEmail}`);
    
    // Check if we have any codes stored
    if (this.verificationCodes.size === 0) {
      console.log(`[VERIFY] No verification codes stored at all`);
      throw new Error('No verification codes stored');
    }
    
    // Check if we have this specific email
    console.log(`[VERIFY] Looking for email: ${normalizedEmail}`);
    console.log(`[VERIFY] Available emails in store:`, Array.from(this.verificationCodes.keys()));
    
    // Try exact match first
    let lookupEmail = normalizedEmail;
    if (!this.verificationCodes.has(normalizedEmail)) {
      // Try to find a close match
      let foundKey = null;
      const keys = Array.from(this.verificationCodes.keys());
      for (const key of keys) {
        if (key.trim() === normalizedEmail) {
          console.log(`[VERIFY] Found close match with trimmed emails: ${key}`);
          foundKey = key;
          break;
        }
      }
      
      if (foundKey) {
        // Use the found key instead
        lookupEmail = foundKey;
      } else {
        console.log(`[VERIFY] No verification code found for email: ${normalizedEmail}`);
        console.log(`[VERIFY] Available emails in store:`, Array.from(this.verificationCodes.keys()));
        throw new Error('No verification code found for this email');
      }
    }
    
    const stored = this.verificationCodes.get(lookupEmail);
    
    if (!stored) {
      console.log(`[VERIFY] No verification code found for email: ${lookupEmail}`);
      throw new Error('No verification code found for this email');
    }
    
    console.log(`[VERIFY] Found stored code for ${lookupEmail}:`, stored);
    
    // Check if code is expired
    if (new Date() > stored.expiresAt) {
      this.verificationCodes.delete(lookupEmail);
      console.log(`[VERIFY] Verification code for ${lookupEmail} has expired`);
      throw new Error('Verification code has expired');
    }
    
    // Check if code matches
    if (stored.code !== code) {
      console.log(`[VERIFY] Verification code mismatch for ${lookupEmail}. Expected: ${stored.code}, Got: ${code}`);
      throw new Error('Invalid verification code');
    }
    
    // Code is valid, remove it
    this.verificationCodes.delete(lookupEmail);
    console.log(`[VERIFY] Verification code for ${lookupEmail} verified successfully`);
    return true;
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    await delay();
    
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }
    
    // In a real implementation, you would hash the password
    // For mock purposes, we'll just log it
    console.log(`Password reset for ${email}: ${newPassword}`);
  }

  // Authentication
  async login(credentials: LoginForm): Promise<{ user: User; token: string }> {
    await delay();
    
    const user = this.users.find(u => u.email === credentials.email && !u.isArchived);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    
    return {
      user,
      token: generateToken(user.id)
    };
  }

  async register(userData: RegisterForm): Promise<{ user: User; token: string }> {
    await delay();
    
    const existingUser = this.users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      isArchived: false,
      newStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.push(newUser);
    
    return {
      user: newUser,
      token: generateToken(newUser.id)
    };
  }

  async getCurrentUser(): Promise<User> {
    await delay(200);
    // Get current user from auth service
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      return currentUser;
    }
    
    // Fallback to demo user if auth service doesn't have a user
    return this.users.find(u => u.email === 'john.student@example.com')!;
  }

  // Users Management
  async getUsers(filters?: { role?: string; organizationId?: string; search?: string }): Promise<PaginatedResponse<User>> {
    await delay();
    
    let filteredUsers = this.users.filter(u => !u.isArchived);
    
    if (filters?.role) {
      filteredUsers = filteredUsers.filter(u => u.role === filters.role);
    }
    
    if (filters?.organizationId) {
      filteredUsers = filteredUsers.filter(u => u.organizationId === filters.organizationId);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.firstName.toLowerCase().includes(search) ||
        u.lastName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }

    return {
      data: filteredUsers,
      pagination: {
        page: 1,
        limit: 50,
        total: filteredUsers.length,
        totalPages: 1
      }
    };
  }

  async getUserById(id: string): Promise<User> {
    await delay();
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    await delay();
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date()
    };

    return this.users[userIndex];
  }

  async archiveUser(id: string): Promise<void> {
    await delay();
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    user.isArchived = true;
    user.updatedAt = new Date();
  }

  async unarchiveUser(id: string): Promise<void> {
    await delay();
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    user.isArchived = false;
    user.updatedAt = new Date();
  }

  async deleteUser(id: string): Promise<void> {
    await delay();
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    this.users.splice(userIndex, 1);
  }

  // Courses Management
  async getCourses(filters?: { status?: string; teacherId?: string; organizationId?: string }): Promise<Course[]> {
    await delay();
    
    let filteredCourses = [...this.courses];
    
    if (filters?.status) {
      filteredCourses = filteredCourses.filter(c => c.status === filters.status);
    }
    
    if (filters?.teacherId) {
      filteredCourses = filteredCourses.filter(c => c.teacherId === filters.teacherId);
    }
    
    if (filters?.organizationId) {
      filteredCourses = filteredCourses.filter(c => c.organizationId === filters.organizationId);
    }

    return filteredCourses;
  }

  async getCourseById(id: string): Promise<Course> {
    await delay();
    const course = this.courses.find(c => c.id === id);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  }

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    await delay();
    
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: courseData.title || '',
      description: courseData.description || '',
      coverImage: courseData.coverImage,
      tags: courseData.tags || [],
      status: courseData.status || 'draft',
      isTracked: courseData.isTracked || true,
      allowSelfPacing: courseData.allowSelfPacing || true,
      requiresCertificate: courseData.requiresCertificate || false,
      isGraded: courseData.isGraded || false,
      organizationId: courseData.organizationId,
      teacherId: courseData.teacherId || '',
      modules: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.courses.push(newCourse);
    return newCourse;
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    await delay();
    const courseIndex = this.courses.findIndex(c => c.id === id);
    if (courseIndex === -1) {
      throw new Error('Course not found');
    }

    this.courses[courseIndex] = {
      ...this.courses[courseIndex],
      ...courseData,
      updatedAt: new Date()
    };

    return this.courses[courseIndex];
  }

  async deleteCourse(id: string): Promise<void> {
    await delay();
    const courseIndex = this.courses.findIndex(c => c.id === id);
    if (courseIndex === -1) {
      throw new Error('Course not found');
    }
    this.courses.splice(courseIndex, 1);
  }

  async duplicateCourse(id: string): Promise<Course> {
    await delay();
    const originalCourse = this.courses.find(c => c.id === id);
    if (!originalCourse) {
      throw new Error('Course not found');
    }

    const duplicatedCourse: Course = {
      ...originalCourse,
      id: `course-${Date.now()}`,
      title: `${originalCourse.title} (Copy)`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.courses.push(duplicatedCourse);
    return duplicatedCourse;
  }

  // Programs Management
  async getPrograms(filters?: { status?: string; organizationId?: string }): Promise<Program[]> {
    await delay();
    
    let filteredPrograms = [...this.programs];
    
    if (filters?.status) {
      filteredPrograms = filteredPrograms.filter(p => p.status === filters.status);
    }
    
    if (filters?.organizationId) {
      filteredPrograms = filteredPrograms.filter(p => p.organizationId === filters.organizationId);
    }

    return filteredPrograms;
  }

  async getProgramById(id: string): Promise<Program> {
    await delay();
    const program = this.programs.find(p => p.id === id);
    if (!program) {
      throw new Error('Program not found');
    }
    return program;
  }

  async createProgram(programData: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<Program> {
    await delay();
    const newProgram: Program = {
      id: `program-${Date.now()}`,
      ...programData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.programs.push(newProgram);
    return newProgram;
  }

  async updateProgram(id: string, programData: Partial<Program>): Promise<Program> {
    await delay();
    const programIndex = this.programs.findIndex(p => p.id === id);
    if (programIndex === -1) {
      throw new Error('Program not found');
    }

    this.programs[programIndex] = {
      ...this.programs[programIndex],
      ...programData,
      updatedAt: new Date()
    };

    return this.programs[programIndex];
  }

  async deleteProgram(id: string): Promise<void> {
    await delay();
    const programIndex = this.programs.findIndex(p => p.id === id);
    if (programIndex === -1) {
      throw new Error('Program not found');
    }
    this.programs.splice(programIndex, 1);
  }

  // Organizations Management
  async getOrganizations(): Promise<Organization[]> {
    await delay();
    return [...this.organizations];
  }

  async getOrganizationById(id: string): Promise<Organization> {
    await delay();
    const organization = this.organizations.find(o => o.id === id);
    if (!organization) {
      throw new Error('Organization not found');
    }
    return organization;
  }

  // Add a method to add organizations to the mock data
  addOrganization(organization: Organization): void {
    this.organizations.push(organization);
  }


  // Enrollments Management
  async enrollUser(userId: string, courseId?: string, programId?: string): Promise<Enrollment> {
    await delay();
    
    // Validate that user and course/program are from the same organization
    const user = await this.getUserById(userId);
    
    if (courseId) {
      const course = await this.getCourseById(courseId);
      if (user.organizationId !== course.organizationId) {
        throw new Error('User and course must be from the same organization');
      }
    }
    
    if (programId) {
      const program = await this.getProgramById(programId);
      if (user.organizationId !== program.organizationId) {
        throw new Error('User and program must be from the same organization');
      }
    }
    
    const enrollment: Enrollment = {
      id: `enrollment-${Date.now()}`,
      userId,
      courseId,
      programId,
      enrolledAt: new Date(),
      progress: 0,
      timeSpent: 0
    };

    this.enrollments.push(enrollment);
    return enrollment;
  }

  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    await delay();
    return this.enrollments.filter(e => e.userId === userId);
  }

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    await delay();
    return this.enrollments.filter(e => e.courseId === courseId);
  }

  async removeEnrollment(enrollmentId: string): Promise<void> {
    await delay();
    const index = this.enrollments.findIndex(e => e.id === enrollmentId);
    if (index !== -1) {
      this.enrollments.splice(index, 1);
    }
  }

  async getStudentProgress(userId: string, courseId: string): Promise<LessonProgress[]> {
    await delay();
    // Mock progress data
    return [
      {
        id: 'progress-1',
        userId,
        lessonId: 'lesson-1',
        completed: true,
        timeSpent: 15,
        completedAt: new Date(),
        score: 85
      }
    ];
  }

  async getCertificates(userId: string): Promise<Certificate[]> {
    await delay();
    // Mock certificates
    return [
      {
        id: 'cert-1',
        userId,
        courseId: 'course-2',
        templateData: {
          name: 'John Student',
          course: 'Advanced TypeScript Patterns',
          completionDate: new Date().toLocaleDateString(),
          organization: 'TechEd Academy',
          variables: {}
        },
        generatedAt: new Date(),
        downloadUrl: 'https://example.com/certificates/cert-1.pdf'
      }
    ];
  }

  async getCertificateTemplates(teacherId: string): Promise<any[]> {
    await delay();
    // Mock certificate templates
    return [
      {
        id: 'template-1',
        courseId: 'course-1',
        name: 'React Course Certificate',
        backgroundColor: '#ffffff',
        primaryColor: '#3B82F6',
        customText: 'has successfully completed the course'
      }
    ];
  }

  // Feedback Surveys
  async submitFeedback(courseId: string, responses: Record<string, any>): Promise<void> {
    await delay();
    console.log('Feedback submitted:', { courseId, responses });
  }

  async getFeedbackSurvey(courseId: string): Promise<any> {
    await delay();
    return {
      id: 'survey-1',
      courseId,
      questions: [
        {
          id: 'overall_rating',
          type: 'rating',
          question: 'How would you rate this course overall?',
          required: true
        }
      ]
    };
  }

  // Reflection Submissions
  private reflectionSubmissions: ReflectionSubmission[] = [];

  async submitReflection(lessonId: string, submission: any): Promise<void> {
    await delay();
    console.log('Reflection submitted:', { lessonId, submission });
  }

  async getReflectionSubmission(lessonId: string, studentId: string): Promise<any> {
    await delay();
    return null; // No existing submission
  }

  async getReflectionSubmissionsForLesson(lessonId: string): Promise<ReflectionSubmission[]> {
    await delay();
    // Mock implementation - in a real app, you'd filter by lessonId
    return this.reflectionSubmissions.filter(sub => sub.lessonId === lessonId);
  }

  async getReflectionSubmissionsForCourse(courseId: string): Promise<ReflectionSubmission[]> {
    await delay();
    // Mock implementation - in a real app, you'd filter by courseId
    return this.reflectionSubmissions.filter(sub => 
      this.courses.some(course => 
        course.modules.some(module => 
          module.lessons.some(lesson => lesson.id === sub.lessonId)
        )
      )
    );
  }

  async addReflectionSubmission(submission: ReflectionSubmission): Promise<void> {
    await delay();
    this.reflectionSubmissions.push(submission);
  }

  async updateReflectionSubmission(id: string, updates: Partial<ReflectionSubmission>): Promise<ReflectionSubmission> {
    await delay();
    const index = this.reflectionSubmissions.findIndex(sub => sub.id === id);
    if (index === -1) {
      throw new Error('Reflection submission not found');
    }
    
    this.reflectionSubmissions[index] = {
      ...this.reflectionSubmissions[index],
      ...updates,
      reviewedAt: new Date()
    };
    
    return this.reflectionSubmissions[index];
  }

  // Organization Codes
  async createOrganizationCode(codeData: OrganizationCode): Promise<OrganizationCode> {
    await delay();
    this.organizationCodes.push(codeData);
    return codeData;
  }

  async getOrganizationCodes(orgId?: string): Promise<OrganizationCode[]> {
    await delay();
    if (orgId) {
      return this.organizationCodes.filter(code => code.orgId === orgId);
    }
    return [...this.organizationCodes];
  }

  async validateOrganizationCode(code: string): Promise<{ valid: boolean; orgId?: string; orgName?: string }> {
    await delay();
    const orgCode = this.organizationCodes.find(c => c.code === code);
    
    if (!orgCode) {
      return { valid: false };
    }
    
    // Check if expired
    if (new Date() > orgCode.expiry) {
      return { valid: false };
    }
    
    // Check if max uses reached
    if (orgCode.usedCount >= orgCode.maxUses) {
      return { valid: false };
    }
    
    // Find organization
    const organization = this.organizations.find(org => org.id === orgCode.orgId);
    if (!organization) {
      return { valid: false };
    }
    
    return { 
      valid: true, 
      orgId: orgCode.orgId, 
      orgName: organization.name 
    };
  }

  async incrementOrganizationCodeUsage(code: string): Promise<void> {
    await delay();
    const orgCode = this.organizationCodes.find(c => c.code === code);
    if (orgCode) {
      orgCode.usedCount += 1;
    }
  }

  // Provisional Users
  async createProvisionalUser(userData: any): Promise<any> {
    await delay();
    const provisionalUser = {
      id: `provisional-${Date.now()}`,
      ...userData
    };
    this.provisionalUsers.push(provisionalUser);
    return provisionalUser;
  }

  async getProvisionalUsers(orgId?: string): Promise<any[]> {
    await delay();
    if (orgId) {
      return this.provisionalUsers.filter(user => user.tempOrgId === orgId);
    }
    return [...this.provisionalUsers];
  }

  async approveProvisionalUser(userId: string, orgId: string, role: string): Promise<User> {
    await delay();
    
    // Find provisional user
    const provisionalIndex = this.provisionalUsers.findIndex(u => u.id === userId);
    if (provisionalIndex === -1) {
      throw new Error('Provisional user not found');
    }
    
    const provisionalUser = this.provisionalUsers[provisionalIndex];
    
    // Create real user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: provisionalUser.email,
      firstName: provisionalUser.firstName,
      lastName: provisionalUser.lastName,
      role: role as any,
      organizationId: orgId,
      isArchived: false,
      newStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to users
    this.users.push(newUser);
    
    // Remove from provisional users
    this.provisionalUsers.splice(provisionalIndex, 1);
    
    return newUser;
  }

  async rejectProvisionalUser(userId: string): Promise<void> {
    await delay();
    const index = this.provisionalUsers.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.provisionalUsers.splice(index, 1);
    }
  }

  // Progress Tracking
  async updateProgress(userId: string, lessonId: string, data: Partial<LessonProgress>): Promise<void> {
    await delay();
    // TODO: Implement progress tracking
    console.log('Progress updated:', { userId, lessonId, data });
  }

  // File Upload (Mock)
  async uploadFile(file: File, path?: string): Promise<{ url: string; filename: string }> {
    await delay(1000);
    
    // TODO: Replace with real file upload service (S3, Cloudinary, etc.)
    const mockUrl = `https://picsum.photos/800/600?random=${Date.now()}`;
    
    return {
      url: mockUrl,
      filename: file.name
    };
  }

  // Email Templates
  async getEmailTemplates(type?: string): Promise<EmailTemplate[]> {
    await delay();
    
    if (type) {
      return this.emailTemplates.filter(t => t.type === type);
    }
    
    return [...this.emailTemplates];
  }

  async updateEmailTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    await delay();
    
    const templateIndex = this.emailTemplates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      throw new Error('Template not found');
    }

    this.emailTemplates[templateIndex] = {
      ...this.emailTemplates[templateIndex],
      ...data
    };

    return this.emailTemplates[templateIndex];
  }

  // Bulk User Import
  async importUsers(csvData: string): Promise<{ imported: number; errors: string[] }> {
    await delay(2000);
    
    // TODO: Implement real CSV parsing and user creation
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    const dataRows = lines.slice(1);
    
    let imported = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < dataRows.length; i++) {
      try {
        const row = dataRows[i].split(',');
        if (row.length < 4) {
          errors.push(`Row ${i + 2}: Insufficient data`);
          continue;
        }
        
        // Mock user creation
        imported++;
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error}`);
      }
    }
    
    return { imported, errors };
  }

  // Certificate Generation
  async generateCertificate(userId: string, courseId?: string, programId?: string): Promise<Certificate> {
    await delay(1000);
    
    // Get user details
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get course details if provided
    let courseTitle = 'Sample Course';
    if (courseId) {
      const course = this.courses.find(c => c.id === courseId);
      if (course) {
        courseTitle = course.title;
      }
    }
    
    // TODO: Replace with real certificate generation (pdf-lib, html2pdf, etc.)
    const certificate: Certificate = {
      id: `cert-${Date.now()}`,
      userId,
      courseId,
      programId,
      templateData: {
        name: `${user.firstName} ${user.lastName}`,
        course: courseTitle,
        completionDate: new Date().toLocaleDateString(),
        organization: 'LMS Platform',
        variables: {}
      },
      generatedAt: new Date(),
      downloadUrl: `https://example.com/certificates/cert-${Date.now()}.pdf`
    };

    this.certificates.push(certificate);
    return certificate;
  }

  // Analytics/Reporting
  async getAnalytics(type: 'user' | 'course' | 'organization' | 'system', id?: string): Promise<any> {
    await delay();
    
    // TODO: Implement real analytics
    return {
      totalUsers: this.users.length,
      totalCourses: this.courses.length,
      totalPrograms: this.programs.length,
      enrollments: this.enrollments.length,
      completionRate: 0.75,
      averageTimeSpent: 120,
      activeUsers: this.users.filter(u => u.lastLogin && 
        new Date().getTime() - u.lastLogin.getTime() < 7 * 24 * 60 * 60 * 1000
      ).length
    };
  }
}

export const mockApi = new MockApiService();

// Export utility functions for integration
export const apiEndpoints = {
  // TODO: Replace these with real API endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout'
  },
  users: {
    list: '/users',
    detail: '/users/:id',
    create: '/users',
    update: '/users/:id',
    delete: '/users/:id',
    import: '/users/import'
  },
  courses: {
    list: '/courses',
    detail: '/courses/:id',
    create: '/courses',
    update: '/courses/:id',
    delete: '/courses/:id',
    duplicate: '/courses/:id/duplicate'
  },
  programs: {
    list: '/programs',
    detail: '/programs/:id',
    create: '/programs',
    update: '/programs/:id',
    delete: '/programs/:id'
  },
  files: {
    upload: '/files/upload'
  },
  analytics: {
    dashboard: '/analytics/dashboard',
    reports: '/analytics/reports'
  }
};