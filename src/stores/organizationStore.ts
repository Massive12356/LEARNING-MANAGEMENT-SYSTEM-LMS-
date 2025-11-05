// stores/organizationStore.ts
import { create } from 'zustand';
import { organizationService } from '../services/organizationService';

interface OrganizationState {
  neworganization: any | null;
  refetchOrganization: (orgId: string) => Promise<void>;
  updateOrganizationStore: (org: any) => void;
}

export const useOrganizationStore = create<OrganizationState>(set => ({
  neworganization: null,
  refetchOrganization: async orgId => {
    try {
      const updatedOrg = await organizationService.getOrganizationById(orgId);
      set({ neworganization: updatedOrg });
    } catch (err) {
      console.error('Failed to fetch organization:', err);
    }
  },
  updateOrganizationStore: org => set({ neworganization: org }),
}));
