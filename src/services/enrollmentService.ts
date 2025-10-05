import { mockApi } from './mockApi';
import { Enrollment, Course } from '../types';

class EnrollmentService {
  async enrollUser(userId: string, courseId?: string, programId?: string): Promise<Enrollment> {
    return mockApi.enrollUser(userId, courseId, programId);
  }

  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    return mockApi.getUserEnrollments(userId);
  }

  async getEnrolledCourses(userId: string): Promise<Course[]> {
    try {
      // First get the user to determine their organization
      const user = await mockApi.getCurrentUser();
      
      const [enrollments, allCourses] = await Promise.all([
        this.getUserEnrollments(userId),
        mockApi.getCourses({ 
          status: 'live',
          organizationId: user.organizationId // Only get courses from user's organization
        })
      ]);

      // Filter courses that the user is enrolled in
      const enrolledCourseIds = enrollments
        .filter(e => e.courseId)
        .map(e => e.courseId!);

      return allCourses.filter(course => 
        enrolledCourseIds.includes(course.id)
      );
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
      return [];
    }
  }

  async getAvailableCourses(userId: string): Promise<Course[]> {
    try {
      // First get the user to determine their organization
      const user = await mockApi.getCurrentUser();
      
      const [enrollments, allCourses] = await Promise.all([
        this.getUserEnrollments(userId),
        mockApi.getCourses({ 
          status: 'live',
          organizationId: user.organizationId // Only get courses from user's organization
        })
      ]);

      // Filter courses that the user is NOT enrolled in
      const enrolledCourseIds = enrollments
        .filter(e => e.courseId)
        .map(e => e.courseId!);

      return allCourses.filter(course => 
        !enrolledCourseIds.includes(course.id)
      );
    } catch (error) {
      console.error('Failed to fetch available courses:', error);
      return [];
    }
  }
}

export const enrollmentService = new EnrollmentService();