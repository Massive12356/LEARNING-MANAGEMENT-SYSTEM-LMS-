
import {
  User,
  RegisterPayload,
  ActiveUserStats,
  SystemHealthStats,
  PlatformStatsResponse,
  UserSearchQuery,
  SystemUsageResponse
} from '../types';
import apiClient from './apiClient';
import { AxiosError } from 'axios';

class AdminService {
  async createAdmin(adminData: Omit<RegisterPayload, 'organizationId'>): Promise<User> {
    try {
      console.log('[AdminService] Sending payload:', adminData);
      const response = await apiClient.post('/user/signUp-admin', adminData);
      console.log('[AdminService]RESPONSE FROM BACKEND:', response.data);
      return response.data.user || response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log('[AdminService]RESPONSE FROM BACKEND:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to create Admin');
    }
  }

  async createUser(adminData: Omit<RegisterPayload, 'password'>): Promise<User> {
    try {
      const response = await apiClient.post('/user/signUp-admin', adminData);
      console.log('[AdminService CREATE USER]RESPONSE FROM BACKEND:', response.data);
      return response.data.user || response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[AdminService CREATE USER]RESPONSE FROM BACKEND:',
        err.response?.data || err.message
      );
      throw new Error(err.response?.data?.message || 'Failed to create Admin');
    }
  }

  async createTeacher(
    teacherData: Partial<User> & {
      email: string;
      firstName: string;
      lastName: string;
      password: string;
    },
    orgId: string
  ): Promise<User> {
    try {
      // Create teacher with organization assignment
      const payload = {
        ...teacherData,
        role: 'teacher',
        organizationId: orgId,
      };

      const response = await apiClient.post('/user/signUp-teacher', payload);
      console.log('[AdminService] Teacher creation response:', response.data);
      return response.data.user || response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log('[AdminService] Teacher creation error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to create Teacher');
    }
  }

  async createStudent(
    studentData: Partial<User> & {
      email: string;
      firstName: string;
      lastName: string;
      password: string;
    },
    orgId: string
  ): Promise<User> {
    try {
      // Create student with organization assignment
      const payload = {
        ...studentData,
        role: 'student',
        organizationId: orgId,
      };

      const response = await apiClient.post('/user/signUp-student', payload);
      console.log('[AdminService] Student creation response:', response.data);
      return response.data.user || response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log('[AdminService] Student creation error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to create Student');
    }
  }

  async getAdminsByOrganization(orgId: string): Promise<User[]> {
    try {
      // Use real API to fetch admins by organization
      const response = await apiClient.get<{ data: User[] }>(`/organization/${orgId}/admins`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching admins:', error);
      return [];
    }
  }

  async getTeachersByOrganization(orgId: string): Promise<User[]> {
    try {
      // Use real API to fetch teachers by organization
      const response = await apiClient.get<{ data: User[] }>(`/organization/${orgId}/teachers`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      return [];
    }
  }

  async getStudentsByOrganization(orgId: string): Promise<User[]> {
    try {
      // Use real API to fetch students by organization
      const response = await apiClient.get<{ data: User[] }>(`/organization/${orgId}/students`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  }

  async assignAdminToOrganization(adminId: string, orgId: string): Promise<User> {
    try {
      // Use real API to assign admin to organization
      const response = await apiClient.put<User>(`/user/${adminId}/assign-organization`, {
        organizationId: orgId,
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error('Error assigning admin to organization:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to assign admin to organization');
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      // Use real API to fetch all users for superuser
      const response = await apiClient.get<{ data: User[] }>(`/users`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async getUsers(page = 1, pageSize = 10) {
    try {
      const response = await apiClient.get(`/user/all-users?page=${page}&pageSize=${pageSize}`);
      console.log('[adminService] RESPONSE FROM BACKEND:', response.data);

      // Return the full data object (not just users)
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log('[adminService] ERROR RESPONSE:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || '[adminService] Failed to Fetch Users');
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      // Use real API to update user
      const response = await apiClient.put<User>(`/user/${userId}`, userData);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error('Error updating user:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to update user');
    }
  }

  async superuserUpdateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      // Use real API to update user
      const response = await apiClient.put<User>(
        `/user/Edit/User-profilr/admin-superUser/${userId}`,
        userData
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error('Error updating user:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to update user');
    }
  }

  async getTotalUsers(): Promise<ActiveUserStats> {
    try {
      const response = await apiClient.get('/user/Total/Active');
      console.log('[adminService]: RESPONSE FROM BACKEND', response.data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log('[adminService]: ERROR RESPONSE FROM BACKEND', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to load Data');
    }
  }

  async systemHealthCheck(): Promise<SystemHealthStats> {
    try {
      const response = await apiClient.get('/system/health-check');
      console.log('[adminService]: RESPONSE FROM BACKEND', response.data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log('[adminService]: ERROR RESPONSE FROM BACKEND', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to load Data');
    }
  }

  async platformStats(): Promise<PlatformStatsResponse> {
    try {
      const response = await apiClient.get('/system/platform/statistics');
      console.log('[adminService]: RESPONSE FROM BACKEND', response.data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log('[adminService]: ERROR RESPONSE FROM BACKEND', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to load Data');
    }
  }

  async systemUsage():Promise<SystemUsageResponse>{
    try {
      const response = await apiClient.get<SystemUsageResponse>('/platform/statistics');
      console.log('[adminService]: RESPONSE FROM BACKEND', response.data)
      return response.data
    } catch (error) {
      const err = error as AxiosError<{message?: string}>
      console.log('[adminService]: ERROR RESPONSE FROM BACKEND', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to load Data');
    }
  }

  async searchUsers(query: UserSearchQuery): Promise<User[]> {
    try {
      const response = await apiClient.get('/user/bySearch/models', { params: query });
      console.log('[AdminService] Search users response:', response.data);
      return response.data?.data || response.data?.users || [];
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error('[AdminService] Search users error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to search users');
    }
  }
}

export const adminService = new AdminService();
