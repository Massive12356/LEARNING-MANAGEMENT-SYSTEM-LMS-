import { AxiosError } from 'axios';
import {
  Organization,
  organizationSearchQuery,
  CreateOrganizationResponse,
  GetOrganizationsResponse,
  ActiveOrganizationStats,
  RecentOrganizationStats,
} from '../types';
import apiClient from './apiClient';

class OrganizationService {
  async getOrganizationById(id: string): Promise<Organization | null> {
    try {
      const response = await apiClient.get<Organization>(`/organization/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching organization:', error);
      return null;
    }
  }

  async getOrganizations(page = 1, pageSize = 10): Promise<GetOrganizationsResponse> {
    try {
      const response = await apiClient.get<GetOrganizationsResponse>(
        `/organization/All-organization?page=${page}&pageSize${pageSize}`
      );
      console.log('[organizationService] RESPONSE FROM BACKEND:', response.data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error(
        '[organizationService] Error fetching organizations:',
        err.response?.data || err.message
      );
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          '[organizationService] Error fetching organizations:'
      );
    }
  }

  async getFullOrganizations(): Promise<GetOrganizationsResponse> {
    try {
      const response = await apiClient.get<GetOrganizationsResponse>(
        `/organization/All-organization/new`
      );
      console.log('[organizationService] RESPONSE FROM BACKEND:', response.data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error(
        '[organizationService] Error fetching organizations:',
        err.response?.data || err.message
      );
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          '[organizationService] Error fetching organizations:'
      );
    }
  }

  async createOrganization(formData: FormData): Promise<Organization> {
    try {
      const response = await apiClient.post<CreateOrganizationResponse>(
        'organization/create-organization',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('RESPONSE FROM BACKEND', response.data);
      return response.data.Organization;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error(
        '[createOrganization] ERROR CREATING ORGANISATION',
        err.response?.data || err.message
      );
      throw new Error(
        err.response?.data?.message || '[createOrganization] ERROR CREATING ORGANISATION'
      );
    }
  }

  async updateOrganization(id: string, orgData: Partial<Organization>): Promise<Organization> {
    try {
      const response = await apiClient.put<Organization>(
        `/organization/change/status/${id}`,
        orgData
      );
      console.log('[updateOrganization] RESPONSE FROM BACKEND:', response.data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error('Error updating organization:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to change Status');
    }
  }

  async updateOrganizationData(id: string, orgData: Partial<Organization>): Promise<Organization> {
    try {
      const response = await apiClient.put<Organization>(`/organization/Edit/${id}`, orgData);
      console.log('[updateOrganizationData] RESPONSE FROM BACKEND:', response.data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error('Error [updateOrganizationData]:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to change Status');
    }
  }

  async getUserOrganization(userId: string): Promise<Organization | null> {
    try {
      // This would need to be implemented with a real API endpoint
      // For now, we'll return null since we're removing mock API usage
      return null;
    } catch (error) {
      console.error('Error fetching user organization:', error);
      return null;
    }
  }

  async getTotalOrganizationActiveOnes(): Promise<ActiveOrganizationStats> {
    try {
      const response = await apiClient.get('/organization/Total/Active');
      console.log('[organizationService]:RESPONSE FROM BACKEND:', response.data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[organizationService]:ERROR RESPONSE FROM BACKEND:',
        err.response?.data || err.message
      );
      throw new Error(err.response?.data?.message || 'Failed to fetch data');
    }
  }

  async getRecentOrganization(): Promise<RecentOrganizationStats> {
    try {
      const response = await apiClient.get('/organization/recent/created');
      console.log('[organizationService]:RESPONSE FROM BACKEND:', response.data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[organizationService]:ERROR RESPONSE FROM BACKEND:',
        err.response?.data || err.message
      );
      throw new Error(err.response?.data?.message || 'Failed to fetch data');
    }
  }

  async searchOrganizations(query: organizationSearchQuery): Promise<Organization[]> {
    try {
      const response = await apiClient.get('/organization/byName/code', { params: query });
      console.log('[OrganizationService] Search Organization response:', response.data);

      // Your backend returns an array directly
      const result = Array.isArray(response.data) ? response.data : response.data?.data || [];

      return result;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error(
        '[OrganizationService] Search organizations error:',
        err.response?.data || err.message
      );
      throw new Error(err.response?.data?.message || 'Failed to search organizations');
    }
  }
}

export const organizationService = new OrganizationService();
