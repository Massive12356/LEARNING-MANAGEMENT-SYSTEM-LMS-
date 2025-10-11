import { AxiosError } from 'axios';
import apiClient from './apiClient';

export interface OrganizationCode {
  id: string;
  organizationId: string;
  code: string;
  expiry: Date;
  maxUses: number;
  usedCount: number;
  createdAt: Date;
  createdBy: string;
}

class OrganizationCodeService {
  // Generate a unique fallback code (optional)
  generateUniqueCode(): string {
    const prefix = 'SYM-ORG';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const year = new Date().getFullYear();
    return `${prefix}-${code}-${year}`;
  }

  // ✅ Create a new organization code using the real API
  async createOrganizationCode(organizationName: string): Promise<any> {
    try {
      const response = await apiClient.post(
        '/organization/code-organization',
        { organizationName }
      );

      console.log('[organizationCodeService] RESPONSE FROM BACKEND:', response.data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error('[organizationCodeService] ERROR:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || err.message || 'Failed to create organization code');
    }
  }
}

export const organizationCodeService = new OrganizationCodeService();
