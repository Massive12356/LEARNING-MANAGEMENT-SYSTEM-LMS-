import { AxiosError } from 'axios';
import { Organization } from '../types';
import apiClient from './apiClient';
import { mockApi } from './mockApi';

class OrganizationService {
  async getOrganizationById(id: string): Promise<Organization | null> {
    try {
      const organization = await mockApi.getOrganizationById(id);
      return organization;
    } catch (error) {
      console.error('Error fetching organization:', error);
      return null;
    }
  }

  async getOrganizations(): Promise<Organization[]> {
    try {
      const organizations = await mockApi.getOrganizations();
      return organizations;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }
  }

  async createOrganization( formData: FormData
  ): Promise<Organization> {
    try {
      // real  endpoint
      const response = await apiClient.post('organization/create-organization', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("RESPONSE FROM BACKEND", response.data)
      return response.data
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
      // In a real implementation, this would be a dedicated endpoint
      const updatedOrg = await mockApi.getOrganizationById(id);
      const organizations = await this.getOrganizations();
      const orgIndex = organizations.findIndex(org => org.id === id);

      if (orgIndex !== -1) {
        organizations[orgIndex] = {
          ...organizations[orgIndex],
          ...orgData,
          updatedAt: new Date(),
        };
      }

      return organizations[orgIndex];
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  }

  async getUserOrganization(userId: string): Promise<Organization | null> {
    try {
      // First get the user to find their organizationId
      const user = await mockApi.getCurrentUser();
      if (!user || !user.organizationId) {
        return null;
      }

      // Then get the organization
      const organization = await this.getOrganizationById(user.organizationId);
      return organization;
    } catch (error) {
      console.error('Error fetching user organization:', error);
      return null;
    }
  }
}

export const organizationService = new OrganizationService();