import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { DataTable, Column } from '../../components/ui/DataTable';
import { FileUploader } from '../../components/ui/FileUploader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { mockApi } from '../../services/mockApi';
import { organizationService } from '../../services/organizationService';
import { adminService } from '../../services/adminService';
import {
  User,
  Organization,
  RegisterPayload,
  ActiveUsersResponse,
  PendingUsersResponse,
  SuspendedUsersResponse,
  DeletedUsersResponse,
} from '../../types';
import {
  PlusIcon,
  UserGroupIcon,
  ArrowUpTrayIcon,
  BuildingOfficeIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

interface CSVUserRecord {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  [key: string]: any;
}

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
  const { user: currentUser, viewAsUser, fetchUserById } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'suspended' | 'deleted'>('active');
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [totalPendingUsers, setTotalPendingUsers] = useState<number>(0);
  const [totalSuspendedUsers, setTotalSuspendedUsers] = useState<number>(0);
  const [totalDeletedUsers, setTotalDeletedUsers] = useState<number>(0);
  const [invitingUsers, setInvitingUsers] = useState(false);
  const [totalActiveUsers, setTotalActiveUsers] = useState<ActiveUsersResponse | null>(null);
  const [suspendedUsers, setSuspendedUsers] = useState<User[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<User[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [suspendedPage, setSuspendedPage] = useState(1);
  const [deletedPage, setDeletedPage] = useState(1);
  const [activeTotalPages, setActiveTotalPages] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [suspendedTotalPages, setSuspendedTotalPages] = useState(1);
  const [deletedTotalPages, setDeletedTotalPages] = useState(1);
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [suspendedSearchTerm, setSuspendedSearchTerm] = useState('');
  const [deletedSearchTerm, setDeletedSearchTerm] = useState('');

  const [pageSize] = useState(10);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null);
  const [showActivateConfirm, setShowActivateConfirm] = useState(false);
  const [userToActivate, setUserToActivate] = useState<User | null>(null);
  const [showBulkArchiveConfirm, setShowBulkArchiveConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [totalOrgUsers, setTotalOrgUsers] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

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

  const loadActiveUsers = async (page = 1, limit = 10, search = '') => {
    if (!currentUser?.organizationId) return;
    try {
      // Pass search term to the API
      const response = await adminService.getActiveUsers(currentUser.organizationId, page, limit, search);
      if (response) {
        const filteredUsers = response.users?.filter(user => user.role !== 'admin') || [];
        setUsers(filteredUsers);
        setActiveTotalPages(response.totalPages || 1);
        
        // 🔹 Keep a separate total count that doesn't change on pagination
        setTotalActiveUsers({
          ...response,
          totalActiveUsers: response.totalActiveUsers ?? filteredUsers.length,
        });

        setTotalOrgUsers(response?.totalUsersInOrg);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadSuspendedUsers = async (page = 1, limit = 10, search = '') => {
    if (!currentUser?.organizationId) return;
    setLoading(true);
    try {
      // Pass search term to the API
      const response = await adminService.getSuspendedUsers(currentUser.organizationId, page, limit, search);
      if (response) {
        const filteredSuspended = response.users?.filter(user => user.role !== 'admin') || [];
        setSuspendedUsers(filteredSuspended);
        setSuspendedTotalPages(response.totalPages || 1);
        setTotalSuspendedUsers(response.totalSuspendedUsers ?? filteredSuspended.length);
      }
    } catch (error) {
      toast.error('Failed to load suspended users');
    } finally {
      setLoading(false);
    }
  };

  const loadDeletedUsers = async (page = 1, limit = 10, search = '') => {
    if (!currentUser?.organizationId) return;
    setLoading(true);
    try {
      // Pass search term to the API
      const response = await adminService.getDeletedUsers(currentUser.organizationId, page, limit, search);
      if (response) {
        const filteredDeleted = response.users?.filter(user => user.role !== 'admin') || [];
        setDeletedUsers(filteredDeleted);
        setDeletedTotalPages(response.totalPages || 1);
        setTotalDeletedUsers(response.totalDeletedUsers ?? filteredDeleted.length);
      }
    } catch (error) {
      toast.error('Failed to load deleted users');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingUsers = async (page = 1, limit = 10, search = '') => {
    if (!currentUser?.organizationId) return;
    setLoading(true);
    try {
      // Pass search term to the API
      const response = await adminService.getPendingUsers(currentUser.organizationId, page, limit, search);
      if (response) {
        const filteredPending = response.users?.filter(user => user.role !== 'admin') || [];
        setPendingUsers(filteredPending);
        setPendingTotalPages(response.totalPages || 1);
        // 🔹 Keep overall pending count fixed
        setTotalPendingUsers(response?.totalPendingUsers);
      }
    } catch (error) {
      toast.error('Failed to load pending users');
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
      // ✅ Update both lists and totals
      await Promise.all([loadPendingUsers(), loadActiveUsers(), loadOrganization()]);
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

  const handleSuspendUser = async (user: User) => {
    setUserToSuspend(user);
    setShowSuspendConfirm(true);
    setIsProcessing(false); // reset processing state
  };

  const confirmSuspendUser = async () => {
    if (!userToSuspend) return;

    const newStatus = userToSuspend.isArchived ? 'active' : 'pending';
    setStatusLoading(userToSuspend.id);

    try {
      await adminService.updateUserStatus(userToSuspend.id, { newStatus });
      toast.success(
        newStatus === 'pending'
          ? `${userToSuspend.firstName} has been suspended`
          : `${userToSuspend.firstName} reactivated successfully`
      );
      setShowSuspendConfirm(false);
      setUserToSuspend(null);

      // Reload both lists
      await Promise.all([loadActiveUsers(), loadPendingUsers()]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    } finally {
      setStatusLoading(null);
    }
  };

  const handleActivateUser = async (user: User) => {
    setUserToActivate(user);
    setShowActivateConfirm(true);
  };

  const confirmActivateUser = async () => {
    if (!userToActivate) return;

    try {
      // Use the real API endpoint for activating users
      const userIds = userToActivate.id;
      await adminService.activateUser(userIds);
      toast.success('User activated successfully');
      loadActiveUsers();
    } catch (error) {
      toast.error('Failed to activate user');
    } finally {
      setShowActivateConfirm(false);
      setUserToActivate(null);
    }
  };

  const handleDeleteUser = async (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);

    try {
      console.log('PAYLOAD ID:', [userToDelete.id]);
      await adminService.deleteUser([userToDelete.id]);
      toast.success('User deleted successfully');
      loadActiveUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
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
        setShowBulkArchiveConfirm(true);
        break;
      case 'delete':
        setShowBulkDeleteConfirm(true);
        break;
    }
  };

  const confirmBulkArchive = () => {
    toast.success(`Archived ${selectedUsers.length} users`);
    setSelectedUsers([]);
    setShowBulkArchiveConfirm(false);
  };

  const confirmBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    const userIds = selectedUsers.map(u => u.id);
    setIsBulkDeleting(true);
    try {
      console.log('PAYLOAD ID:', [userIds]);
      await adminService.deleteUser(userIds);
      toast.success(`Deleted ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`);
      setSelectedUsers([]);
      loadActiveUsers();
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete selected users');
    } finally {
      setIsBulkDeleting(false);
      setShowBulkDeleteConfirm(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Invalid file type. Please upload a CSV file.');
      return;
    }

    setSelectedFile(file);
    setIsImporting(true);

    Papa.parse<CSVUserRecord>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async result => {
        try {
          const records = result.data;
          if (!records.length) {
            toast.error('CSV file is empty');
            setIsImporting(false);
            return;
          }

          const requiredFields = ['email', 'firstName', 'lastName', 'role'];
          const hasAllFields = requiredFields.every(f => f in records[0]);
          if (!hasAllFields) {
            toast.error('CSV file missing required columns');
            setIsImporting(false);
            return;
          }

          const payload = records.map((r: any) => ({
            ...r,
            organizationId: organization?.organizationCode,
          }));

          await adminService.addBulkUsers(payload);
          toast.success(`Successfully imported ${payload.length} users`);
          setShowBulkImportModal(false);
          // Update both lists and totals
          await Promise.all([loadPendingUsers(), loadActiveUsers(), loadOrganization()]);
        } catch (error) {
          console.error('Bulk import error:', error);
          toast.error('Failed to import users');
        } finally {
          // Set importing to false here — after everything
          setIsImporting(false);
        }
      },
    });
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

  const handleCancel = () => {
    setShowBulkImportModal(false);
    setSelectedFile(null);
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
            {user.images ? (
              <img
                src={user.images}
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
              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSuspendUser(user)}
            disabled={statusLoading === user.id}
            className={`${
              user.isArchived
                ? 'text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                : 'text-yellow-600 border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
            }`}
          >
            {statusLoading === user.id ? 'Pending...' : user.isArchived ? 'Activate' : 'Suspend'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteUser(user)}
            className="text-red-600 hover:text-red-700 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (!currentUser?.organizationId) return;

    // Load datasets once on mount
    loadActiveUsers(1, pageSize, activeSearchTerm);
    loadPendingUsers(1, pageSize, pendingSearchTerm);
    loadOrganization();
  }, [currentUser?.organizationId]);

  useEffect(() => {
    if (activeTab === 'active') {
      loadActiveUsers(activePage, pageSize, activeSearchTerm);
    } else if (activeTab === 'pending') {
      loadPendingUsers(pendingPage, pageSize, pendingSearchTerm);
    } else if (activeTab === 'suspended') {
      loadSuspendedUsers(suspendedPage, pageSize, suspendedSearchTerm);
    } else if (activeTab === 'deleted') {
      loadDeletedUsers(deletedPage, pageSize, deletedSearchTerm);
    }
    loadOrganization();
  }, [currentUser, loadOrganization, activePage, pendingPage, suspendedPage, deletedPage, activeTab]);

  const handleSearch = useCallback((searchTerm: string) => {
    if (activeTab === 'active') {
      setActiveSearchTerm(searchTerm);
      setActivePage(1); // Reset to first page when searching
    } else if (activeTab === 'pending') {
      setPendingSearchTerm(searchTerm);
      setPendingPage(1); // Reset to first page when searching
    } else if (activeTab === 'suspended') {
      setSuspendedSearchTerm(searchTerm);
      setSuspendedPage(1); // Reset to first page when searching
    } else if (activeTab === 'deleted') {
      setDeletedSearchTerm(searchTerm);
      setDeletedPage(1); // Reset to first page when searching
    }
  }, [activeTab]);

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (activeTab === 'active') {
        loadActiveUsers(activePage, pageSize, activeSearchTerm);
      } else if (activeTab === 'pending') {
        loadPendingUsers(pendingPage, pageSize, pendingSearchTerm);
      } else if (activeTab === 'suspended') {
        loadSuspendedUsers(suspendedPage, pageSize, suspendedSearchTerm);
      } else if (activeTab === 'deleted') {
        loadDeletedUsers(deletedPage, pageSize, deletedSearchTerm);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [activeSearchTerm, pendingSearchTerm, suspendedSearchTerm, deletedSearchTerm]);

  const clearSearch = () => {
    if (activeTab === 'active') {
      setActiveSearchTerm('');
      setActivePage(1);
      loadActiveUsers(1, pageSize, '');
    } else if (activeTab === 'pending') {
      setPendingSearchTerm('');
      setPendingPage(1);
      loadPendingUsers(1, pageSize, '');
    } else if (activeTab === 'suspended') {
      setSuspendedSearchTerm('');
      setSuspendedPage(1);
      loadSuspendedUsers(1, pageSize, '');
    } else if (activeTab === 'deleted') {
      setDeletedSearchTerm('');
      setDeletedPage(1);
      loadDeletedUsers(1, pageSize, '');
    }
  };

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
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 group relative ">
              {organization?.logo ? (
                <img
                  src={organization?.logo}
                  alt={organization?.name}
                  className="w-7 h-7 object-cover rounded-full center mr-1"
                />
              ) : (
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              )}
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
          <button
            onClick={() => setActiveTab('suspended')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'suspended'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Suspended Users ({totalSuspendedUsers})
          </button>
          <button
            onClick={() => setActiveTab('deleted')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'deleted'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Deleted Users ({totalDeletedUsers})
          </button>
          <span className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 dark:text-gray-400">
            Total Users ({totalOrgUsers ?? 0})
          </span>
        </nav>
      </div>

      {/* Filters and Search */}

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
          currentPage={activePage}
          totalPages={activeTotalPages}
          onPageChange={setActivePage}
          selectable
          onSelectionChange={setSelectedUsers}
          emptyMessage="No users found. Get started by inviting your first user."
          loading={loading}
        />
      ) : activeTab === 'pending' ? (
        <div className="space-y-4">
          {/* Search Input for Pending Users */}
          <div className="flex justify-between items-center">
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search pending users..."
                value={pendingSearchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
              {pendingSearchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <PendingUsersTable
            pendingUsers={pendingUsers}
            onApprove={user => openApproveModal(user)}
            onReject={user => openRejectModal(user)}
          />
        </div>
      ) : activeTab === 'suspended' ? (
        <DataTable
          data={suspendedUsers}
          columns={columns}
          searchable
          sortable
          filterable
          pagination
          pageSize={pageSize}
          currentPage={suspendedPage}
          totalPages={suspendedTotalPages}
          onPageChange={setSuspendedPage}
          selectable
          onSelectionChange={setSelectedUsers}
          emptyMessage="No suspended users found."
          loading={loading}
        />
      ) : (
        <DataTable
          data={deletedUsers}
          columns={columns}
          searchable
          sortable
          filterable
          pagination
          pageSize={pageSize}
          currentPage={deletedPage}
          totalPages={deletedTotalPages}
          onPageChange={setDeletedPage}
          selectable
          onSelectionChange={setSelectedUsers}
          emptyMessage="No deleted users found."
          loading={loading}
        />
      )}
      {activeTab === 'pending' && pendingTotalPages > 1 && (
        <div className="flex items-center justify-end gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={pendingPage === 1}
            onClick={() => setPendingPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {pendingPage} of {pendingTotalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pendingPage === pendingTotalPages}
            onClick={() => setPendingPage(prev => Math.min(prev + 1, pendingTotalPages))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Pagination for suspended users */}
      {activeTab === 'suspended' && suspendedTotalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={suspendedPage === 1}
            onClick={() => setSuspendedPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {suspendedPage} of {suspendedTotalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={suspendedPage === suspendedTotalPages}
            onClick={() => setSuspendedPage(prev => Math.min(prev + 1, suspendedTotalPages))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Pagination for deleted users */}
      {activeTab === 'deleted' && deletedTotalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={deletedPage === 1}
            onClick={() => setDeletedPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {deletedPage} of {deletedTotalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={deletedPage === deletedTotalPages}
            onClick={() => setDeletedPage(prev => Math.min(prev + 1, deletedTotalPages))}
          >
            Next
          </Button>
        </div>
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
              onUpload={files => {
                // This will now only fire when you manually call it
                setSelectedFile(files[0]);
              }}
              dropzoneText="Drop your CSV file here, or click to browse"
            />
            {/* ✅ Show selected file name */}
            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md">
                <span className="text-sm text-gray-700 truncate">📄 {selectedFile.name}</span>
                <button
                  className="text-xs text-red-500 hover:underline"
                  onClick={() => setSelectedFile(null)}
                >
                  Remove
                </button>
              </div>
            )}
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

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-32"
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedFile && handleFileUpload([selectedFile])}
              className="w-32 flex items-center justify-center"
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Importing...
                </>
              ) : (
                'Import Users'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}? this `}
        confirmText={isDeleting ? 'Deleting..' : 'Confirm Delete'}
        cancelText="Cancel"
        confirmVariant="danger"
        confirmDisabled={isDeleting}
      />

      {/* Suspend Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSuspendConfirm}
        onClose={() => {
          setShowSuspendConfirm(false);
          setUserToSuspend(null);
        }}
        onConfirm={confirmSuspendUser}
        title="Suspend User"
        message="Are you sure you want to suspend this user? They will lose access to the platform."
        confirmText={statusLoading ? ' Suspending...' : 'Suspend'}
        cancelText="Cancel"
        confirmVariant="danger"
      />

      {/* Activate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showActivateConfirm}
        onClose={() => {
          setShowActivateConfirm(false);
          setUserToActivate(null);
        }}
        onConfirm={confirmActivateUser}
        title="Activate User"
        message="Are you sure you want to activate this user? They will regain access to the platform."
        confirmText="Activate"
        cancelText="Cancel"
        confirmVariant="primary"
      />

      {/* Bulk Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showBulkArchiveConfirm}
        onClose={() => setShowBulkArchiveConfirm(false)}
        onConfirm={confirmBulkArchive}
        title="Archive Users"
        message={`Are you sure you want to archive ${selectedUsers.length} selected users?`}
        confirmText="Archive"
        cancelText="Cancel"
        confirmVariant="primary"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Users"
        message={`Are you sure you want to permanently delete ${selectedUsers.length} selected users? This action cannot be undone.`}
        confirmText={isBulkDeleting ? 'Deleting...' : ' Confirm Delete'}
        cancelText="Cancel"
        confirmVariant="danger"
        confirmDisabled={isDeleting}
      />
    </div>
  );
}
