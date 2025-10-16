import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { adminService } from '../../services/adminService';
import { organizationService } from '../../services/organizationService';
import { organizationCodeService } from '../../services/organizationCodeService';
import { Organization, User, UserRole } from '../../types';
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
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function OrganizationManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [selectOrgName, setSelectOrgName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [creatingAdmin, setCreatingAdmin]=useState(false);
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
    maxUses: 100,
  });
  const [allUsers,SetAllUsers]= useState<User[]>([]);
  const [changingStatus, SetChangingStatus] = useState<string | null>(null);

  const [newOrgData, setNewOrgData] = useState({
    name: '',
    description: '',
    status: 'active',
    primaryColor: '#3B82F6',
    expiryDay: '',
    maxUsers: '',
  });

  const [adminData, setAdminData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organizationId: '',
    role: 'admin'
  });

  // Add loading state for create organization
  const [creatingOrg, setCreatingOrg] = useState(false);

  // Mock organization stats
  const [orgStats, setOrgStats] = useState<Record<string, any>>({});
  const [totalItems, setTotalItems] = useState<number>(0);

  const [currentPage, SetCurrentPage] = useState(1);
  const [totalPages,SetTotalPages] = useState(1);
  const pageSize = 10;

 

  const loadOrganizations = async (page= 1) => {
    try {
      setLoading(true)
      const response = await organizationService.getOrganizations(page,pageSize);
      console.log(response)
      const orgsData = response.organizations || [];
      // Normalize backend data
      const formattedOrgs = orgsData.map((org: any) => ({
        ...org,
        createdAt: new Date(org.createdAt),
        updatedAt: org.updatedAt ? new Date(org.updatedAt) : null,
      }));

      setOrganizations(formattedOrgs);
      setFilteredOrganizations(formattedOrgs)

      // update pagination states 
      SetCurrentPage(response.currentPage || 1);
      SetTotalPages(response.totalPages || 1)
      setTotalItems(response.totalItems || orgsData.length);
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
      filtered = filtered.filter(
        org =>
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

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description, status, primaryColor, expiryDay, maxUsers } = newOrgData;

    // Validation
    if (!name.trim()) return toast.error('Organization name is required');
    if (name.trim().length < 3) return toast.error('Name must be at least 3 characters long');
    if (!description.trim()) return toast.error('Description is required');
    if (!expiryDay) return toast.error('Expiry date is required');
    if (!maxUsers || isNaN(Number(maxUsers)) || Number(maxUsers) <= 0)
      return toast.error('Maximum users must be a positive number');

    const payload = new FormData();
    payload.append('name', name);
    payload.append('description', description);
    payload.append('status', status);
    payload.append('primaryColor', primaryColor);
    payload.append('expiryDay', expiryDay);
    payload.append('maxUsers', String(maxUsers));

    try {
      setCreatingOrg(true); // Set loading state
      console.log('PAYLOAD TO THE BACKEND', payload);
      const response = await organizationService.createOrganization(payload);

      const organizationName = response.name;
      console.log('NAME OF ORGANIZATION', organizationName);
      toast.success(`Organization ${organizationName} created successfully`);
      setNewOrgData({
        name: '',
        description: '',
        status: 'active',
        primaryColor: '#3B82F6',
        expiryDay: '',
        maxUsers: '',
      });
      setShowCreateModal(false);
      loadOrganizations();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create organization');
    } finally {
      setCreatingOrg(false); // Reset loading state
    }
  };

  const handleStatusChange = async (organizationId: string, newStatus: 'active' | 'suspended') => {
    try {
      SetChangingStatus(organizationId)
      await organizationService.updateOrganization(organizationId, { status: newStatus });

      setOrganizations(prev =>
        prev.map(org =>
          org.id === organizationId ? { ...org, status: newStatus, updatedAt: new Date() } : org
        )
      );

      toast.success(
        `Organization ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`
      );
    } catch (error) {
      toast.error('Failed to update organization status');
    }finally{
      SetChangingStatus(null);
    }
  };

  const openAssignAdminModal = (orgName: string) => {
    setSelectOrgName(orgName);
    setShowAssignAdminModal(true);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectOrgName) {
      toast.error('No organization selected for admin assignment.');
      return;
    }

    const { firstName, lastName, email, password, organizationId } = adminData;

    // ✅ Validation rules
    if (!firstName.trim()) return toast.error('First name is required.');
    if (!lastName.trim()) return toast.error('Last name is required.');
    if (!email.trim()) return toast.error('Email is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return toast.error('Please enter a valid email address.');
    if (!password.trim()) return toast.error('Password is required.');
    if (password.length < 8) return toast.error('Password must be at least 8 characters long.');
    if (!organizationId) return toast.error('Kindly Enter the Generated Code for the organization');

    


    // ✅ Prepare the final payload for admin creation
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role: 'admin' as UserRole, // Ensures it's an admin user
      organizationId: organizationId.trim(), // Links admin to their organization
    };
    console.log('[DEBUG selectedOrgId]:', selectedOrgId, typeof selectedOrgId);

    try {
      // toast.loading('Creating admin...', { id: 'admin-create' });
      setCreatingAdmin(true);

      const createdAdmin = await adminService.createAdmin(payload);

      toast.success(
        `Admin ${createdAdmin.firstName} ${createdAdmin.lastName} created successfully.`,
        { id: 'admin-create' }
      );

      // ✅ Refresh users list
      await fetchUsers();
      // Reset form and close modal
      setAdminData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'admin',
        organizationId: '',
      });
      setShowAssignAdminModal(false);
      setSelectedOrgId(null);

      // Optionally refresh admin list if you have one
      // loadAdmins(selectedOrgId);
    } catch (error: any) {
      console.error('[handleCreateAdmin] Error:', error);
      toast.error(error.message || 'Failed to create admin user', { id: 'admin-create' });
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleGenerateJoinCode = async (orgName: string) => {
    // console.log("ORGANIZATION NAME:", orgName)
    if (!orgName) {
      toast.error('Please create an organization first before generating a join code');
      return;
    } else {
      toast.loading(`Generating Code for ${orgName}`);
    }

    try {
      const code = await organizationCodeService.createOrganizationCode(orgName);
      console.log('[Generated Code API Response]', code);
      setGeneratedCode(code);
      setShowGenerateCodeModal(true);
    } catch (error) {
      toast.error('Failed to generate join code');
    }
  };

  const fetchUsers = async()=>{
    try {
      const response = await adminService.getUsers();
      SetAllUsers(response);
      console.log("RESPONSE FROM BACKEND",response)
    } catch (error) {
      console.log("ERROR RESPONSE FROM BACKEND", error)
    }
  }

  
  const totalCourses = Object.values(orgStats).reduce(
    (acc: number, stats: any) => acc + stats.courses,
    0
  );
  const activeOrgs = organizations.filter(org => org.status === 'active').length;

   useEffect(() => {
     loadOrganizations(currentPage);
     fetchUsers()
   }, [currentPage]);

  useEffect(() => {
    filterOrganizations();
  }, [organizations, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Organizations</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeOrgs}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Organizations</p>
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
                {allUsers?.length ?? 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
              <BookOpenIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCourses}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
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
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
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
      {filteredOrganizations?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrganizations?.map(org => {
            const stats = orgStats[org.id] || { users: 0, courses: 0, activeUsers: 0 };

            return (
              <Card key={org.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: org?.primaryColor }}
                      >
                        <BuildingOfficeIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {org?.name ?? 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          Created {org.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                      <span
                        className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                          org?.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : org.status === 'suspended'
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}
                      >
                        {org?.status ?? 'active'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 min-h-[3rem]">
                    {org?.description ?? 'N/A'}
                  </p>

                  {/* Organization Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 py-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {stats.users}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">Users</div>
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
                      <Link to={`/superuser/organization?orgId=${org.id}`}>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAssignAdminModal(org.name)}
                      >
                        <UserPlusIcon className="h-4 w-4 mr-1" />
                        Add Admin
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateJoinCode(org.name)}
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Generate Code
                      </Button>
                      {org.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(org.id, 'suspended')}
                          disabled={changingStatus === org.id} // disable while loading
                        >
                          {changingStatus === org.id ? (
                            <div className="flex items-center gap-2">
                              <span className="h-4 w-4 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></span>
                              <span>...</span>
                            </div>
                          ) : (
                            <>
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              Suspend
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(org.id, 'active')}
                          disabled={changingStatus === org.id}
                        >
                          {changingStatus === org.id ? (
                            <div className="flex items-center gap-2">
                              <span className="h-4 w-4 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></span>
                              <span>...</span>
                            </div>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
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
                : 'No organizations yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Create your first organization to get started.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create First Organization
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => SetCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>

          <span className="text-gray-700 dark:text-gray-300 text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => SetCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Organization Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Organization"
      >
        <form className="space-y-4" onSubmit={handleCreateOrganization}>
          {/* Name */}
          <Input
            label="Organization Name"
            value={newOrgData.name}
            onChange={e => setNewOrgData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter organization name"
            required
          />

          {/* Status */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={newOrgData.status}
              onChange={e => setNewOrgData(prev => ({ ...prev, status: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={newOrgData.description}
              onChange={e => setNewOrgData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the organization's purpose"
            />
          </div>

          {/* Primary Color */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={newOrgData.primaryColor}
                onChange={e => setNewOrgData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
              />
              <Input
                value={newOrgData.primaryColor}
                onChange={e => setNewOrgData(prev => ({ ...prev, primaryColor: e.target.value }))}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Expiry Date
            </label>
            <input
              type="date"
              value={newOrgData.expiryDay}
              onChange={e => setNewOrgData(prev => ({ ...prev, expiryDay: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Users */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Maximum Users
            </label>
            <input
              type="number"
              min="1"
              value={newOrgData.maxUsers}
              onChange={e => setNewOrgData(prev => ({ ...prev, maxUsers: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter max number of users"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={creatingOrg} // Add loading state to button
            >
              Create Organization
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Admin Modal */}
      <Modal
        isOpen={showAssignAdminModal}
        onClose={() => {
          setShowAssignAdminModal(false);
          setSelectedOrgId(null);
          setAdminData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'admin',
            organizationId: '',
          });
        }}
        title="Create and Assign Admin"
      >
        <form className="space-y-4" onSubmit={handleCreateAdmin}>
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
              onChange={e => setAdminData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="John"
              required
            />
            <Input
              label="Last Name"
              value={adminData.lastName}
              onChange={e => setAdminData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Doe"
              required
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={adminData.email}
            onChange={e => setAdminData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="admin@organization.com"
            required
          />
          <Input
            label="Enter Generated Code for the organization"
            type="text"
            value={adminData.organizationId}
            onChange={e => setAdminData(prev => ({ ...prev, organizationId: e.target.value }))}
            placeholder="Enter code SYM-ORG-MOD9TTN-2025"
            required
          />

          <Input
            label="Password"
            type="password"
            value={adminData.password}
            onChange={e => setAdminData(prev => ({ ...prev, password: e.target.value }))}
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
                setAdminData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  password: '',
                  role: 'admin',
                  organizationId: '',
                });
              }}
            >
              Cancel
            </Button>
            <Button type='submit'  loading={creatingAdmin} disabled={creatingAdmin}>
              {creatingAdmin ? 'creating Admin ...' : 'Create and Assign Admin'}{' '}
            </Button>
          </div>
        </form>
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
                  {generatedCode?.newJoinCode ?? 'N/A'}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode.newJoinCode);
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
                  {generatedCode.logEntry?.expiryDay
                    ? new Date(generatedCode.logEntry.expiryDay).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Uses
                </label>
                <p className="text-gray-900 dark:text-white">
                  {generatedCode?.logEntry?.maxUsers ?? 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
