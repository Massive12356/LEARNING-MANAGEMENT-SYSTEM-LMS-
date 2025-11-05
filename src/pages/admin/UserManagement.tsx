import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { DataTable, Column } from '../../components/ui/DataTable';
import { FileUploader } from '../../components/ui/FileUploader';
import { mockApi } from '../../services/mockApi';
import { organizationService } from '../../services/organizationService';
import { adminService } from '../../services/adminService';
import {
  User,
  Organization,
  RegisterPayload,
  ActiveUsersResponse,
  PendingUsersResponse,
} from '../../types';
import {
  PlusIcon,
  UserGroupIcon,
  ArrowUpTrayIcon,
  BuildingOfficeIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// This version omits password (backend generates it)
type InviteUserPayload = Omit<RegisterPayload, 'password'>;

const handleCopy = async (text: string) => {
  try {
    const res = await navigator.clipboard.writeText(text);
    console.log('text Copied [admin DashBoard]', res);
    toast.success('code copied to clipboard!!');
  } catch (error) {
    console.log('failed to copy code [admin dashboard]', error);
    toast.error('failed to copy text!');
  }
};

// Pending Users Table Component
const PendingUsersTable: React.FC<{
  pendingUsers: any[];
  onApprove: (user: any) => void;
  onReject: (user: any) => void;
}> = ({ pendingUsers, onApprove, onReject }) => {
  if (pendingUsers.length === 0) {
    return (
      <div className="text-center py-12">
        <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          No pending signups
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          There are no pending user signups at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
            >
              User
            </th>
            <th
              scope="col"
              className="px-3 py-33.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
            >
              Requested Role
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
            >
              Submitted
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
          {pendingUsers.map(user => (
            <tr key={user.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'teacher'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : user.role === 'admin'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {user.role === 'teacher' ? 'Teacher' : user.role}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <div className="flex items-center space-x-2">
                  <Button size="sm" onClick={() => onApprove(user)}>
                    Approve
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onReject(user)}>
                    Reject
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export function UserManagement() {
  const { user: currentUser, viewAsUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [totalPendingUsers, setTotalPendingUsers] = useState<number>(0);
  const [invitingUsers, setInvitingUsers] = useState(false);
  const [totalActiveUsers, setTotalActiveUsers] = useState<ActiveUsersResponse | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [inviteData, setInviteData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'student' as 'student' | 'teacher',
    organizationId: '',
  });

  // 🔹 States for approve/reject confirmation modals
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orgLoading, setOrgLoading] = useState(true);

  const loadOrganization = useCallback(async () => {
    if (!currentUser?.organizationDetails?.id) return;

    try {
      setOrgLoading(true);
      const orgData = await organizationService.getOrganizationById(
        String(currentUser.organizationDetails?.id)
      );
      setOrganization(orgData);
    } catch (error) {
      console.error('Failed to load organization:', error);
    } finally {
      setOrgLoading(false);
    }
  }, [currentUser?.id]);

  const loadActiveUsers = async (page = 1, limit = 10) => {
    if (!currentUser?.organizationId) return;

    try {
      const response = await adminService.getActiveUsers(currentUser.organizationId, page, limit);

      if (response) {
        // Filter out admins so only students and teachers show on the table
        const filteredUsers = response.users?.filter(user => user.role !== 'admin') || [];

        setUsers(filteredUsers);
        setTotalPages(response.totalPages || 1);
        // Optional: Update totalActiveUsers based on filtered list
        setTotalActiveUsers({
          ...response,
          totalActiveUsers: filteredUsers.length,
        });
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };


  const loadPendingUsers = async (page = 1, limit = 10) => {
    if (!currentUser?.organizationId) return;

    setLoading(true);
    try {
      const response = await adminService.getPendingUsers(currentUser.organizationId, page, limit);
      if (response) {
        // Filter out admins and update pending users
        const filteredPending = response.users?.filter(user => user.role !== 'admin') || [];

        setPendingUsers(filteredPending);
        setTotalPages(response.totalPages || 1);

        // Update total pending users after filtering
        setTotalPendingUsers(filteredPending.length);
      }
    } catch (error) {
      toast.error('Failed to load pending users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.email || !inviteData.firstName || !inviteData.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!currentUser?.organizationId) {
      toast.error('Organization not found');
      return;
    }
    try {
      setInvitingUsers(true);

      // prepare payload and attached organizational code to the
      const payload: InviteUserPayload = {
        ...inviteData,
        organizationId: organization?.organizationCode,
      };

      console.log('[PayloadComponentFunction]', payload);
      await adminService.inviteUsers(payload);
      toast.success(` created successfully`);
      setInviteData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'student',
        organizationId: '',
      });
      setShowInviteModal(false);
      loadPendingUsers();
    } catch (error) {
      // 👇 Display the error thrown from the service
      if (error instanceof Error) {
        toast.error(error.message);
        console.log(error.message);
      } else {
        toast.error('Something went wrong while inviting the user');
      }
    } finally {
      setInvitingUsers(false);
    }
  };

  const handleArchiveUser = async (userId: string) => {
    if (
      !confirm('Are you sure you want to archive this user? They will lose access to the platform.')
    ) {
      return;
    }

    try {
      await mockApi.archiveUser(userId);
      toast.success('User archived successfully');
      loadActiveUsers();
    } catch (error) {
      toast.error('Failed to archive user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        'Are you sure you want to permanently delete this user? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await mockApi.deleteUser(userId);
      toast.success('User deleted successfully');
      loadActiveUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleViewAsUser = async (userId: string) => {
    try {
      await viewAsUser(userId);
    } catch (error) {
      toast.error('Failed to view as user');
    }
  };

  const handleApproveUser = async (userId: string) => {
    if (!currentUser?.organizationId) return;

    try {
      console.log(`Payload id:`, userId);
      await adminService.approveProvisionalUsers(userId);
      toast.success('User approved successfully');
      // Reload both active and pending users
      loadActiveUsers();
      loadPendingUsers();
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      await adminService.rejectProvisionalUser(userId);
      toast.success('User rejected successfully');
      // Reload both active and pending users
      loadActiveUsers();
      loadPendingUsers();
    } catch (error) {
      toast.error('Failed to reject user');
    }
  };

  const handleBulkAction = (action: 'archive' | 'delete' | 'export') => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    switch (action) {
      case 'export':
        // TODO: Implement bulk export
        toast.success(`Exporting ${selectedUsers.length} users`);
        break;
      case 'archive':
        if (confirm(`Archive ${selectedUsers.length} selected users?`)) {
          toast.success(`Archived ${selectedUsers.length} users`);
          setSelectedUsers([]);
        }
        break;
      case 'delete':
        if (
          confirm(
            `Permanently delete ${selectedUsers.length} selected users? This cannot be undone.`
          )
        ) {
          toast.success(`Deleted ${selectedUsers.length} users`);
          setSelectedUsers([]);
        }
        break;
    }
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      // Handle CSV file upload
      const file = files[0];
      if (file.type !== 'text/csv') {
        toast.error('Please upload a CSV file');
        return;
      }

      // TODO: Process CSV and import users
      toast.success('CSV file uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  // confirm Approve function
  const confirmApprove = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);

    try {
      await handleApproveUser(selectedUser.id);
      setShowApproveModal(false);
      setSelectedUser(null);
    } finally {
      setIsProcessing(false);
    }
  };

  //Confirm Reject
  const confirmReject = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      await handleRejectUser(selectedUser.id);
      setShowRejectModal(false);
      setSelectedUser(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // open Approve Modal
  const openApproveModal = (user: any) => {
    setSelectedUser(user);
    setShowApproveModal(true);
  };

  const openRejectModal = (user: any) => {
    setSelectedUser(user);
    setShowRejectModal(true);
  };

  // Define table columns
  const columns: Column<User>[] = [
    {
      key: 'user',
      label: 'User',
      sortable: false,
      render: (_, user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      filterable: true,
      render: role => (
        <span
          className={`px-2 py-1 text-xs rounded-full capitalize ${
            role === 'admin'
              ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
              : role === 'teacher'
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          {role}
        </span>
      ),
    },
    {
      key: 'isArchived',
      label: 'Status',
      filterable: true,
      render: isArchived => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            isArchived
              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
          }`}
        >
          {isArchived ? 'Archived' : 'Active'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: lastLogin => (lastLogin ? new Date(lastLogin).toLocaleDateString() : 'Never'),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Link to={`/admin/users/${user.id}`}>
            <Button variant="outline" size="sm">
              <EyeIcon className="h-4 w-4" />
            </Button>
          </Link>
          {user.role === 'student' && (
            <Button variant="outline" size="sm" onClick={() => handleViewAsUser(user.id)}>
              View As
            </Button>
          )}
        </div>
      ),
    },
  ];
  useEffect(() => {
    loadActiveUsers(page, pageSize);
    loadPendingUsers(page, pageSize);
    loadOrganization();
  }, [currentUser, loadOrganization, page]);

  return (
    <div className="space-y-8">
      {/* Header with Organization Context */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage users, roles, and permissions for your organization
          </p>
          {orgLoading ? (
            <div className="mt-2 h-4 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          ) : organization ? (
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 group relative">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              <span>{organization.name}</span>
              <span className="ml-3 text-zinc-900 dark:text-yellow-500 font-medium">
                {organization?.organizationCode ?? 'N/A'}
              </span>
              <button
                className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => handleCopy(organization?.organizationCode ?? 'N/A')}
                title="Copy organization code"
              >
                <ClipboardDocumentIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No organization found</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setShowBulkImportModal(true)}>
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={() => setShowInviteModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Active Users ({totalActiveUsers?.totalActiveUsers ?? 0})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Pending Signups ({totalPendingUsers})
          </button>
        </nav>
      </div>

      {/* Filters and Search */}
      {/* Filters and Search are now handled by DataTable */}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800 dark:text-blue-200">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
                  Archive
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      {activeTab === 'active' ? (
        <DataTable
          data={users}
          columns={columns}
          searchable
          sortable
          filterable
          pagination
          pageSize={pageSize}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          selectable
          onSelectionChange={setSelectedUsers}
          emptyMessage="No users found. Get started by inviting your first user."
          loading={loading}
        />
      ) : (
        <PendingUsersTable
          pendingUsers={pendingUsers}
          onApprove={user => openApproveModal(user)}
          onReject={user => openRejectModal(user)}
        />
      )}

      {/* ✅ Approve Confirmation Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve User Confirmation"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to <strong>approve</strong> this user?
            </p>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 dark">
              <p>
                <strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Requested Role:</strong> {selectedUser.role}
              </p>
              <p>
                <strong>Submitted On:</strong>{' '}
                {new Date(selectedUser.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowApproveModal(false)}>
                Cancel
              </Button>
              <Button onClick={confirmApprove} loading={isProcessing}>
                {isProcessing ? 'Approving...' : 'Confirm Approve'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ❌ Reject Confirmation Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject User Confirmation"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to <strong>reject</strong> this user?
            </p>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p>
                <strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Requested Role:</strong> {selectedUser.role}
              </p>
              <p>
                <strong>Submitted On:</strong>{' '}
                {new Date(selectedUser.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={confirmReject} loading={isProcessing}>
                {isProcessing ? 'Rejecting...' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Invite User Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite New User"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Users will be invited to join{' '}
              <strong>{organization?.name || 'your organization'}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={inviteData.firstName}
              onChange={e => setInviteData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="John"
            />
            <Input
              label="Last Name"
              value={inviteData.lastName}
              onChange={e => setInviteData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Doe"
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={inviteData.email}
            onChange={e => setInviteData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="john.doe@example.com"
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              value={inviteData.role}
              onChange={e => setInviteData(prev => ({ ...prev, role: e.target.value as any }))}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteUser} loading={invitingUsers}>
              {invitingUsers ? 'Inviting...' : 'Invite User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        title="Bulk Import Users"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload a CSV file to import multiple users at once. The CSV should include columns for
              firstName, lastName, email, and role.
            </p>

            <FileUploader
              accept=".csv"
              maxSize={5 * 1024 * 1024} // 5MB
              maxFiles={1}
              legacyMode={true} // Use legacy File[] mode
              onUpload={handleFileUpload}
              dropzoneText="Drop your CSV file here, or click to browse"
            />
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">CSV Format Example:</h4>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm font-mono">
              firstName,lastName,email,role
              <br />
              John,Doe,john.doe@example.com,student
              <br />
              Jane,Smith,jane.smith@example.com,teacher
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowBulkImportModal(false)}>
              Cancel
            </Button>
            <Button>Import Users</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
