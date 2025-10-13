import { AxiosError } from 'axios';
import { Organization } from '../types';
import apiClient from './apiClient';
import { CreateOrganizationResponse,GetOrganizationsResponse } from '../types';

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

  async getOrganizations(): Promise<GetOrganizationsResponse> {
    try {
      const response = await apiClient.get<GetOrganizationsResponse>('/organization/All-organization');
      console.log("[organizationService] RESPONSE FROM BACKEND:", response.data)
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{message?: string}>
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

  async createOrganization( formData: FormData
  ): Promise<Organization> {
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
      console.log("RESPONSE FROM BACKEND", response.data)
      return response.data.Organization
    } catch (error) {
      const err = error as AxiosError<{message?: string}>
      console.error('[createOrganization] ERROR CREATING ORGANISATION', err.response?.data || err.message);
      throw new Error(
        err.response?.data?.message || '[createOrganization] ERROR CREATING ORGANISATION'
      );
    }
  }

  async updateOrganization(id: string, orgData: Partial<Organization>): Promise<Organization> {
    try {
      const response = await apiClient.put<Organization>(`/organization/${id}`, orgData);
      return response.data;
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
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
}

export const organizationService = new OrganizationService();