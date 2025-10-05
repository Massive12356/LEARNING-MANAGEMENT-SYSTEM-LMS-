import { Organization } from '../types';
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

  async createOrganization(orgData: Partial<Organization>): Promise<Organization> {
    try {
      // In a real implementation, this would be a dedicated endpoint
      // For now, we'll simulate the creation
      const newOrg: Organization = {
        id: `org-${Date.now()}`,
        name: orgData.name || 'New Organization',
        status: orgData.status || 'draft',
        description: orgData.description || '',
        primaryColor: orgData.primaryColor || '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add to mock data (in a real app, this would be handled by the API)
      const organizations = await this.getOrganizations();
      organizations.push(newOrg);
      
      return newOrg;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
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
          updatedAt: new Date()
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