import { mockApi } from './mockApi';
import { User, RegisterForm } from '../types';

class AdminService {
  async createAdmin(adminData: Partial<User> & { email: string; firstName: string; lastName: string; password: string }): Promise<User> {
    // In a real implementation, this would be a dedicated endpoint
    // For now, we'll use the mock API register function
    const registerData: RegisterForm = {
      email: adminData.email,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      password: adminData.password,
      confirmPassword: adminData.password,
      role: 'admin'
    };
    
    const response = await mockApi.register(registerData);
    // Update the user's organization if provided
    if (adminData.organizationId) {
      return mockApi.updateUser(response.user.id, { organizationId: adminData.organizationId });
    }
    return response.user;
  }

  async createTeacher(teacherData: Partial<User> & { email: string; firstName: string; lastName: string; password: string }, orgId: string): Promise<User> {
    // In a real implementation, this would be a dedicated endpoint
    // For now, we'll use the mock API register function
    const registerData: RegisterForm = {
      email: teacherData.email,
      firstName: teacherData.firstName,
      lastName: teacherData.lastName,
      password: teacherData.password,
      confirmPassword: teacherData.password,
      role: 'teacher'
    };
    
    const response = await mockApi.register(registerData);
    // Update the user's organization
    return mockApi.updateUser(response.user.id, { organizationId: orgId });
  }

  async createStudent(studentData: Partial<User> & { email: string; firstName: string; lastName: string; password: string }, orgId: string): Promise<User> {
    // In a real implementation, this would be a dedicated endpoint
    // For now, we'll use the mock API register function
    const registerData: RegisterForm = {
      email: studentData.email,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      password: studentData.password,
      confirmPassword: studentData.password,
      role: 'student'
    };
    
    const response = await mockApi.register(registerData);
    // Update the user's organization
    return mockApi.updateUser(response.user.id, { organizationId: orgId });
  }

  async getAdminsByOrganization(orgId: string): Promise<User[]> {
    try {
      const response = await mockApi.getUsers({ 
        role: 'admin',
        organizationId: orgId
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admins:', error);
      return [];
    }
  }

  async getTeachersByOrganization(orgId: string): Promise<User[]> {
    try {
      const response = await mockApi.getUsers({ 
        role: 'teacher',
        organizationId: orgId
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      return [];
    }
  }

  async getStudentsByOrganization(orgId: string): Promise<User[]> {
    try {
      const response = await mockApi.getUsers({ 
        role: 'student',
        organizationId: orgId
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  }

  async assignAdminToOrganization(adminId: string, orgId: string): Promise<User> {
    try {
      // In a real implementation, this would be a dedicated endpoint
      // For now, we'll update the user's organization
      const updatedUser = await mockApi.updateUser(adminId, { organizationId: orgId });
      return updatedUser;
    } catch (error) {
      console.error('Error assigning admin to organization:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();