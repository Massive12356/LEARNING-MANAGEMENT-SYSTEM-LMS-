import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { mockApi } from '../../services/mockApi';
import { adminService } from '../../services/adminService';
import { organizationService } from '../../services/organizationService';
import { organizationCodeService } from '../../services/organizationCodeService';
import { Organization, User } from '../../types';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserPlusIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function OrganizationManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [admins, setAdmins] = useState<User[]>([]);
  const [showGenerateCodeModal, setShowGenerateCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [codeConfig, setCodeConfig] = useState({
    expiryDays: 30,
    maxUses: 100
  });

  const [newOrgData, setNewOrgData] = useState({
    name: '',
    description: '',
    primaryColor: '#3B82F6'
  });

  const [adminData, setAdminData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  // Add loading state for create organization
  const [creatingOrg, setCreatingOrg] = useState(false);

  // Mock organization stats
  const [orgStats, setOrgStats] = useState<Record<string, any>>({});

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    filterOrganizations();
  }, [organizations, searchTerm, statusFilter]);

  const loadOrganizations = async () => {
    try {
      const orgsData = await organizationService.getOrganizations();
      setOrganizations(orgsData);
      
      // Mock stats for each organization
      const stats: Record<string, any> = {};
      orgsData.forEach(org => {
        stats[org.id] = {
          users: Math.floor(Math.random() * 1000) + 100,
          courses: Math.floor(Math.random() * 50) + 10,
          activeUsers: Math.floor(Math.random() * 500) + 50
        };
      });
      setOrgStats(stats);
    } catch (error) {
      console.error('Failed to load organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const filterOrganizations = () => {
    let filtered = [...organizations];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(org => org.status === statusFilter);
    }

    setFilteredOrganizations(filtered);
  };

  const handleCreateOrganization = async () => {
    if (!newOrgData.name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    try {
      setCreatingOrg(true); // Set loading state
      await organizationService.createOrganization({
        name: newOrgData.name,
        description: newOrgData.description,
        primaryColor: newOrgData.primaryColor,
        status: 'active'
      });
      
      toast.success('Organization created successfully');
      setNewOrgData({ name: '', description: '', primaryColor: '#3B82F6' });
      setShowCreateModal(false);
      loadOrganizations();
    } catch (error) {
      toast.error('Failed to create organization');
    } finally {
      setCreatingOrg(false); // Reset loading state
    }
  };

  const handleStatusChange = async (orgId: string, newStatus: 'active' | 'suspended') => {
    try {
      await organizationService.updateOrganization(orgId, { status: newStatus });
      
      setOrganizations(prev => prev.map(org => 
        org.id === orgId ? { ...org, status: newStatus, updatedAt: new Date() } : org
      ));
      
      toast.success(`Organization ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
    } catch (error) {
      toast.error('Failed to update organization status');
    }
  };

  const openAssignAdminModal = (orgId: string) => {
    setSelectedOrgId(orgId);
    setShowAssignAdminModal(true);
  };

  const handleCreateAdmin = async () => {
    if (!selectedOrgId) return;
    
    if (!adminData.email || !adminData.firstName || !adminData.lastName || !adminData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await adminService.createAdmin({
        ...adminData,
        organizationId: selectedOrgId
      });
      
      toast.success('Admin user created and assigned successfully');
      setAdminData({ firstName: '', lastName: '', email: '', password: '' });
      setShowAssignAdminModal(false);
      setSelectedOrgId(null);
    } catch (error) {
      toast.error('Failed to create admin user');
    }
  };

  const handleGenerateJoinCode = async (orgId: string) => {
    try {
      // For now, we'll use a mock user ID. In a real implementation, you'd get the current user ID.
      const code = await organizationCodeService.createOrganizationCode(
        orgId, 
        'superuser', 
        codeConfig.expiryDays, 
        codeConfig.maxUses
      );
      setGeneratedCode(code);
      setShowGenerateCodeModal(true);
    } catch (error) {
      toast.error('Failed to generate join code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalUsers = Object.values(orgStats).reduce((acc: number, stats: any) => acc + stats.users, 0);
  const totalCourses = Object.values(orgStats).reduce((acc: number, stats: any) => acc + stats.courses, 0);
  const activeOrgs = organizations.filter(org => org.status === 'active').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Organization Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage all organizations across the platform
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/superuser/reports">
            <Button variant="outline">
              <ChartBarIcon className="h-4 w-4 mr-2" />
              System Reports
            </Button>
          </Link>
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {organizations.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Organizations
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeOrgs}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Organizations
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalUsers.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Users
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
              <BookOpenIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalCourses}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Courses
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Grid */}
      {filteredOrganizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => {
            const stats = orgStats[org.id] || { users: 0, courses: 0, activeUsers: 0 };
            
            return (
              <Card key={org.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: org.primaryColor }}
                      >
                        <BuildingOfficeIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {org.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          Created {org.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                      <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                        org.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : org.status === 'suspended'
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {org.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 min-h-[3rem]">
                    {org.description || 'No description provided'}
                  </p>

                  {/* Organization Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 py-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {stats.users}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        Users
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {stats.courses}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        Courses
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {stats.activeUsers}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        Active
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/admin/organization?orgId=${org.id}`}>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openAssignAdminModal(org.id)}
                      >
                        <UserPlusIcon className="h-4 w-4 mr-1" />
                        Add Admin
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleGenerateJoinCode(org.id)}
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Generate Code
                      </Button>
                      {org.status === 'active' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange(org.id, 'suspended')}
                        >
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          Suspend
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange(org.id, 'active')}
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BuildingOfficeIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'No organizations found' 
                : 'No organizations yet'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Create your first organization to get started.'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <Button onClick={() => setShowCreateModal(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create First Organization
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Organization Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Organization"
      >
        <div className="space-y-4">
          <Input
            label="Organization Name"
            value={newOrgData.name}
            onChange={(e) => setNewOrgData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter organization name"
            required
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={newOrgData.description}
              onChange={(e) => setNewOrgData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the organization's purpose"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={newOrgData.primaryColor}
                onChange={(e) => setNewOrgData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
              />
              <Input
                value={newOrgData.primaryColor}
                onChange={(e) => setNewOrgData(prev => ({ ...prev, primaryColor: e.target.value }))}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateOrganization}
              loading={creatingOrg} // Add loading state to button
            >
              Create Organization
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Admin Modal */}
      <Modal
        isOpen={showAssignAdminModal}
        onClose={() => {
          setShowAssignAdminModal(false);
          setSelectedOrgId(null);
          setAdminData({ firstName: '', lastName: '', email: '', password: '' });
        }}
        title="Create and Assign Admin"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This admin will have full management privileges for this organization only.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={adminData.firstName}
              onChange={(e) => setAdminData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="John"
              required
            />
            <Input
              label="Last Name"
              value={adminData.lastName}
              onChange={(e) => setAdminData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Doe"
              required
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={adminData.email}
            onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="admin@organization.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={adminData.password}
            onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Create a secure password"
            helpText="Must be at least 8 characters"
            required
          />

          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAssignAdminModal(false);
                setSelectedOrgId(null);
                setAdminData({ firstName: '', lastName: '', email: '', password: '' });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateAdmin}>
              Create and Assign Admin
            </Button>
          </div>
        </div>
      </Modal>

      {/* Generate Join Code Modal */}
      <Modal
        isOpen={showGenerateCodeModal}
        onClose={() => {
          setShowGenerateCodeModal(false);
          setGeneratedCode(null);
        }}
        title="Organization Join Code"
      >
        {generatedCode && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                  {generatedCode.code}
                </code>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode.code);
                    toast.success('Code copied to clipboard');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expires
                </label>
                <p className="text-gray-900 dark:text-white">
                  {generatedCode.expiry.toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Uses
                </label>
                <p className="text-gray-900 dark:text-white">
                  {generatedCode.maxUses}
                </p>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Share this code with users who want to join this organization. 
                They'll need to enter it during signup.
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  setShowGenerateCodeModal(false);
                  setGeneratedCode(null);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}