import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { organizationService } from '../services/organizationService';
import { Organization } from '../types';
import toast from 'react-hot-toast';

export const Onboarding = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateOrganization = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Create organization
      const orgData = {
        name: orgName,
        description: orgDescription,
        status: 'active',
        primaryColor: '#3b82f6', // Default blue color
      } as Organization;
      
      // TODO: Replace with real API call
      const organization = await organizationService.createOrganization(orgData);
      
      // Update user with organization ID
      await updateUser({ 
        organizationId: organization.id 
      });
      
      toast.success('Organization created successfully!');
      navigate(`/${user.role}/dashboard`);
    } catch (error) {
      toast.error('Failed to create organization');
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;
    
    try {
      // Navigate to user's dashboard
      navigate(`/${user.role}/dashboard`);
    } catch (error) {
      toast.error('Failed to skip onboarding');
      console.error('Onboarding error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to LMS Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let's get you set up with your organization
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto bg-gray-200 dark:bg-gray-700 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Create Your Organization
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Set up your learning organization to start creating courses and managing students.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Organization Name
                </label>
                <Input
                  id="orgName"
                  value={orgName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrgName(e.target.value)}
                  placeholder="Enter organization name"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="orgDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="orgDescription"
                  value={orgDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOrgDescription(e.target.value)}
                  placeholder="Brief description of your organization"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={loading}
              >
                Skip for now
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!orgName || loading}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Confirm Organization Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Review your organization information before creating it.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Organization Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{orgName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                  <p className="font-medium text-gray-900 dark:text-white">{orgDescription || 'No description provided'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                onClick={handleCreateOrganization}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Creating...' : 'Create Organization'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};