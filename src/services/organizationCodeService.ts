import { mockApi } from './mockApi';

export interface OrganizationCode {
  id: string;
  orgId: string;
  code: string;
  expiry: Date;
  maxUses: number;
  usedCount: number;
  createdAt: Date;
  createdBy: string;
}

class OrganizationCodeService {
  // Generate a unique code
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

  // Create a new organization code
  async createOrganizationCode(orgId: string, createdBy: string, expiryDays: number = 30, maxUses: number = 100): Promise<OrganizationCode> {
    const code: OrganizationCode = {
      id: `code-${Date.now()}`,
      orgId,
      code: this.generateUniqueCode(),
      expiry: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
      maxUses,
      usedCount: 0,
      createdAt: new Date(),
      createdBy
    };

    // In a real implementation, this would call an API
    // For now, we'll store it in the mock API
    const result = await mockApi.createOrganizationCode(code);
    
    return result;
  }

  // Validate an organization code
  async validateOrganizationCode(code: string): Promise<{ valid: boolean; orgId?: string; orgName?: string }> {
    try {
      const result = await mockApi.validateOrganizationCode(code);
      return result;
    } catch (error) {
      return { valid: false };
    }
  }
}

export const organizationCodeService = new OrganizationCodeService();