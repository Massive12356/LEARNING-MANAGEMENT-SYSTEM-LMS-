import { mockApi } from './mockApi';
import { User, UserRole } from '../types';

interface OrganizationStats {
  users: number;
  teachers: number;
  students: number;
  courses: number;
  programs: number;
}

class AnalyticsService {
  async getOrganizationStats(organizationId: string): Promise<OrganizationStats> {
    try {
      // Get all users for this organization
      const usersResponse = await mockApi.getUsers({ organizationId });
      const users = usersResponse.data;
      
      // Count users by role
      const teachers = users.filter((user: User) => user.role === 'teacher').length;
      const students = users.filter((user: User) => user.role === 'student').length;
      
      // Get courses for this organization
      const courses = await mockApi.getCourses({ organizationId });
      
      // Get programs for this organization
      const programs = await mockApi.getPrograms({ organizationId });
      
      return {
        users: users.length,
        teachers,
        students,
        courses: courses.length,
        programs: programs.length
      };
    } catch (error) {
      console.error('Failed to fetch organization stats:', error);
      // Return default stats if there's an error
      return {
        users: 0,
        teachers: 0,
        students: 0,
        courses: 0,
        programs: 0
      };
    }
  }
}

export const analyticsService = new AnalyticsService();