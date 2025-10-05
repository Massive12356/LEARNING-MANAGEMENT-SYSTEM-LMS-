import { User } from '../types';
import { notificationService } from './notificationService';

export interface AccessLog {
  id: string;
  userId: string;
  loginTime: Date;
  logoutTime?: Date;
  ipAddress: string;
  userAgent: string;
  duration?: number; // in minutes
}

export interface TestResult {
  id: string;
  userId: string;
  courseId: string;
  quizId: string;
  score: number;
  maxScore: number;
  percentage: number;
  attemptNumber: number;
  submittedAt: Date;
  timeSpent: number; // in minutes
  answers: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
    points: number;
  }>;
}

export interface LearningActivity {
  id: string;
  userId: string;
  type: 'course_start' | 'lesson_complete' | 'quiz_attempt' | 'certificate_earned' | 'login' | 'logout';
  courseId?: string;
  lessonId?: string;
  quizId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface StudentReportData {
  user: User;
  enrolledCourses: Array<{
    id: string;
    title: string;
    description: string;
    instructor: string;
    progress: number;
    completionStatus: 'not-started' | 'in-progress' | 'completed';
    certificateAvailable: boolean;
    timeSpent: number; // in minutes
    lastAccessed?: Date;
    enrolledAt: Date;
    completedAt?: Date;
    grade?: number;
  }>;
  testResults: TestResult[];
  certificates: Array<{
    id: string;
    courseId?: string;
    programId?: string;
    title: string;
    issuedAt: Date;
    downloadUrl: string;
    credentialId: string;
  }>;
  accessLogs: AccessLog[];
  learningActivities: LearningActivity[];
  overallStats: {
    totalEnrolled: number;
    totalCompleted: number;
    totalTimeSpent: number; // in minutes
    certificatesEarned: number;
    averageScore: number;
    totalLogins: number;
    averageSessionDuration: number; // in minutes
    streakDays: number;
    lastLoginDate?: Date;
  };
}

class StudentReportService {
  // Get comprehensive student report
  async getStudentReport(userId: string, dateRange?: { start: Date; end: Date }): Promise<StudentReportData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock data - in real app, this would come from API
    // For now, we'll filter the mock data based on userId and dateRange
    const mockData: StudentReportData = {
      user: {
        id: userId,
        email: 'student@example.com',
        firstName: 'Student',
        lastName: 'User',
        role: 'student',
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      },
      enrolledCourses: [
        {
          id: 'course-1',
          title: 'Complete React Development Course',
          description: 'Master React from basics to advanced concepts',
          instructor: 'Jane Doe',
          progress: 75,
          completionStatus: 'in-progress',
          certificateAvailable: false,
          timeSpent: 180,
          lastAccessed: new Date('2024-01-15'),
          enrolledAt: new Date('2024-01-01'),
          grade: 87
        },
        {
          id: 'course-2',
          title: 'Advanced TypeScript Patterns',
          description: 'Deep dive into TypeScript advanced features',
          instructor: 'Mike Johnson',
          progress: 100,
          completionStatus: 'completed',
          certificateAvailable: true,
          timeSpent: 120,
          lastAccessed: new Date('2024-01-10'),
          enrolledAt: new Date('2023-12-15'),
          completedAt: new Date('2024-01-10'),
          grade: 92
        },
        {
          id: 'course-3',
          title: 'JavaScript Fundamentals',
          description: 'Build a solid foundation in JavaScript',
          instructor: 'Sarah Wilson',
          progress: 45,
          completionStatus: 'in-progress',
          certificateAvailable: false,
          timeSpent: 90,
          lastAccessed: new Date('2024-01-12'),
          enrolledAt: new Date('2024-01-08'),
          grade: 78
        }
      ],
      testResults: [
        {
          id: 'test-1',
          userId,
          courseId: 'course-2',
          quizId: 'quiz-1',
          score: 18,
          maxScore: 20,
          percentage: 90,
          attemptNumber: 1,
          submittedAt: new Date('2024-01-10'),
          timeSpent: 25,
          answers: [
            { questionId: 'q1', answer: 'A', isCorrect: true, points: 2 },
            { questionId: 'q2', answer: 'B', isCorrect: false, points: 0 },
            { questionId: 'q3', answer: 'C', isCorrect: true, points: 2 }
          ]
        },
        {
          id: 'test-2',
          userId,
          courseId: 'course-1',
          quizId: 'quiz-2',
          score: 16,
          maxScore: 20,
          percentage: 80,
          attemptNumber: 2,
          submittedAt: new Date('2024-01-14'),
          timeSpent: 30,
          answers: [
            { questionId: 'q4', answer: 'A', isCorrect: true, points: 2 },
            { questionId: 'q5', answer: 'B', isCorrect: true, points: 2 },
            { questionId: 'q6', answer: 'D', isCorrect: false, points: 0 }
          ]
        }
      ],
      certificates: [
        {
          id: 'cert-1',
          courseId: 'course-2',
          title: 'Advanced TypeScript Patterns',
          issuedAt: new Date('2024-01-10'),
          downloadUrl: '/api/certificates/cert-1/download',
          credentialId: 'CERT-TS-001-2024'
        }
      ],
      accessLogs: [
        {
          id: 'log-1',
          userId,
          loginTime: new Date('2024-01-15T09:00:00'),
          logoutTime: new Date('2024-01-15T11:30:00'),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          duration: 150
        },
        {
          id: 'log-2',
          userId,
          loginTime: new Date('2024-01-14T14:00:00'),
          logoutTime: new Date('2024-01-14T16:45:00'),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          duration: 165
        },
        {
          id: 'log-3',
          userId,
          loginTime: new Date('2024-01-13T10:30:00'),
          logoutTime: new Date('2024-01-13T12:00:00'),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          duration: 90
        }
      ],
      learningActivities: [
        {
          id: 'activity-1',
          userId,
          type: 'certificate_earned',
          courseId: 'course-2',
          timestamp: new Date('2024-01-10T15:30:00'),
          metadata: { courseName: 'Advanced TypeScript Patterns' }
        },
        {
          id: 'activity-2',
          userId,
          type: 'quiz_attempt',
          courseId: 'course-1',
          quizId: 'quiz-2',
          timestamp: new Date('2024-01-14T14:45:00'),
          metadata: { score: 80, attempt: 2 }
        },
        {
          id: 'activity-3',
          userId,
          type: 'lesson_complete',
          courseId: 'course-1',
          lessonId: 'lesson-5',
          timestamp: new Date('2024-01-15T10:15:00'),
          metadata: { lessonTitle: 'React Hooks Deep Dive' }
        }
      ],
      overallStats: {
        totalEnrolled: 3,
        totalCompleted: 1,
        totalTimeSpent: 390,
        certificatesEarned: 1,
        averageScore: 85,
        totalLogins: 15,
        averageSessionDuration: 135,
        streakDays: 7,
        lastLoginDate: new Date('2024-01-15')
      }
    };

    return mockData;
  }

  // Send certificate notification
  sendCertificateNotification(userId: string, courseTitle: string, certificateId: string): void {
    // In a real implementation, this would get the teacher/admin info
    // For demo purposes, we'll use mock data
    notificationService.createCertificateNotification(
      userId,
      certificateId,
      courseTitle,
      'system',
      'System'
    );
  }

  // Download certificate
  async downloadCertificate(certificateId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, this would fetch actual certificate data
    // For now, we'll create a mock download
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, this would make an API call to get the certificate blob
      // For mock purposes, we'll create a downloadable PDF
      const certificateContent = `
        Certificate of Completion
        
        This is to certify that ${certificateId} has been issued.
        
        For verification, visit: ${window.location.origin}/verify/${certificateId}
      `;
      
      // Create a Blob with the certificate content
      const blob = new Blob([certificateContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Certificate download failed:', error);
      throw error;
    }
  }

  // Export report as PDF
  async exportReportAsPDF(userId: string, reportData: StudentReportData): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In real app, this would generate and download a PDF report
    const reportContent = this.generateReportHTML(reportData);
    
    // For mock purposes, we'll create a downloadable HTML file
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `student-report-${userId}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Generate HTML report content
  private generateReportHTML(reportData: StudentReportData): string {
    const { user, enrolledCourses, testResults, certificates, accessLogs, overallStats } = reportData;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Student Learning Report - ${user.firstName} ${user.lastName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #ddd; padding-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; }
        .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
        .course-item { background: #f9fafb; padding: 15px; margin-bottom: 15px; border-radius: 8px; }
        .progress-bar { background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 10px; }
        .progress-fill { background: #10b981; height: 100%; transition: width 0.3s; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; }
        .generated-date { text-align: center; color: #6b7280; margin-top: 40px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Student Learning Report</h1>
        <h2>${user.firstName} ${user.lastName} (${user.email})</h2>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h2>Overview Statistics</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${overallStats.totalEnrolled}</div>
                <div class="stat-label">Enrolled Courses</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${overallStats.totalCompleted}</div>
                <div class="stat-label">Completed Courses</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Math.round(overallStats.totalTimeSpent / 60)}h</div>
                <div class="stat-label">Total Time Spent</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${overallStats.certificatesEarned}</div>
                <div class="stat-label">Certificates Earned</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Course Progress</h2>
        ${enrolledCourses.map(course => `
        <div class="course-item">
            <h3>${course.title}</h3>
            <p><strong>Instructor:</strong> ${course.instructor}</p>
            <p><strong>Status:</strong> ${course.completionStatus.replace('-', ' ').toUpperCase()}</p>
            <p><strong>Progress:</strong> ${course.progress}%</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${course.progress}%"></div>
            </div>
            <p><strong>Time Spent:</strong> ${Math.round(course.timeSpent / 60)}h</p>
            ${course.grade ? `<p><strong>Grade:</strong> ${course.grade}%</p>` : ''}
        </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Test Results</h2>
        <table>
            <thead>
                <tr>
                    <th>Course</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Attempt</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                ${testResults.map(test => {
                  const course = enrolledCourses.find(c => c.id === test.courseId);
                  return `
                <tr>
                    <td>${course?.title || 'Unknown Course'}</td>
                    <td>${test.score}/${test.maxScore}</td>
                    <td>${test.percentage}%</td>
                    <td>${test.attemptNumber}</td>
                    <td>${test.submittedAt.toLocaleDateString()}</td>
                </tr>
                `;
                }).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Access Logs</h2>
        <table>
            <thead>
                <tr>
                    <th>Login Time</th>
                    <th>Logout Time</th>
                    <th>Duration</th>
                    <th>IP Address</th>
                </tr>
            </thead>
            <tbody>
                ${accessLogs.slice(0, 10).map(log => `
                <tr>
                    <td>${log.loginTime.toLocaleString()}</td>
                    <td>${log.logoutTime ? log.logoutTime.toLocaleString() : 'Active'}</td>
                    <td>${log.duration ? `${log.duration} min` : '-'}</td>
                    <td>${log.ipAddress}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Certificates</h2>
        ${certificates.length > 0 ? certificates.map(cert => `
        <div class="course-item">
            <h3>${cert.title}</h3>
            <p><strong>Credential ID:</strong> ${cert.credentialId}</p>
            <p><strong>Issued:</strong> ${cert.issuedAt.toLocaleDateString()}</p>
        </div>
        `).join('') : '<p>No certificates earned yet.</p>'}
    </div>

    <div class="generated-date">
        Report generated on ${new Date().toLocaleString()}
    </div>
</body>
</html>
    `;
  }

  // Get date range options
  getDateRangeOptions(): Array<{ value: string; label: string }> {
    return [
      { value: '7', label: 'Last 7 days' },
      { value: '30', label: 'Last 30 days' },
      { value: '90', label: 'Last 90 days' },
      { value: '365', label: 'Last year' },
      { value: 'all', label: 'All time' }
    ];
  }
}

export const studentReportService = new StudentReportService();