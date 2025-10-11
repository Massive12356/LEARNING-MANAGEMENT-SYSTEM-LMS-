import { mockApi } from './mockApi';
import { User, RegisterForm,RegisterPayload } from '../types';
import apiClient from './apiClient';
import { AxiosError } from 'axios';

class AdminService {
  async createAdmin(adminData: Omit<RegisterPayload,'organizationId'>): Promise<User> {
    try {
      console.log('[AdminService] Sending payload:', adminData);
      const response = await apiClient.post('/user/signUp-admin',adminData);
      console.log("[AdminService]RESPONSE FROM BACKEND:", response.data)
      return response.data.user || response.data;
    } catch (error) {
      const err = error as AxiosError<{message?: string}>
      console.log("[AdminService]RESPONSE FROM BACKEND:", err.response?.data || err.message)
      throw new Error(err.response?.data?.message|| 'Failed to create Admin')
    }
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