import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { DataTable, Column } from '../../components/ui/DataTable';
import { User, Organization, UserRole } from '../../types';
import { adminService } from '../../services/adminService';
import { organizationService } from '../../services/organizationService';
import {
  PlusIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  PencilIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin' | 'superuser'>('all');
  const [orgFilter, setOrgFilter] = useState<'all' | string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [updatingUser, setUpdatingUser] = useState(false);

  const [currentPage, SetCurrentPage] = useState(1);
  const [totalPages, SetTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const pageSize = 10;

  const [newUserData, setNewUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: "",
    role: 'student' as 'student' | 'teacher' | 'admin' | 'superuser',
    organizationId: ''
  });

  const [editUserData, setEditUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'student' as 'student' | 'teacher' | 'admin' | 'superuser',
    organizationId: ''
  });



  const loadUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(page, pageSize);
      console.log('✅ Full API Response:', response);

      // Sometimes the real data may be in response.data — handle both cases safely
      const data = response?.data ? response.data : response;

      console.log('✅ Parsed data:', data);

      setUsers(data?.users || []);
      SetCurrentPage(data?.currentPage || 1);
      SetTotalPages(data?.totalPages || 1);
      setTotalUsers(data?.totalUsers || 0);

      console.log('✅ Loaded users:', data?.users?.length);
    } catch (error) {
      console.error('❌ Failed to load users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };



  const loadOrganizations = async () => {
    try {
      const response = await organizationService.getFullOrganizations();
      setOrganizations(response.organizations || []);
    } catch (error) {
      console.error('Failed to load organizations:', error);
      toast.error('Failed to load organizations');
    }
  };

  // const handleAddUser = async () => {
  //   if (!newUserData.email || !newUserData.firstName || !newUserData.lastName || !newUserData.organizationId) {
  //     toast.error('Please fill in all required fields');
  //     return;
  //   }

  //   try {
  //     let createdUser: User;

  //     // Create user based on role using real API
  //     if (newUserData.role === 'superuser') {
  //       // Superusers typically don't belong to an organization
  //       createdUser = await adminService.createAdmin({
  //         email: newUserData.email,
  //         firstName: newUserData.firstName,
  //         lastName: newUserData.lastName,
  //         password: 'TempPass123!', // In a real app, this would be a generated password
  //         role: 'superuser'
  //       });
  //     } else if (newUserData.role === 'admin') {
  //       // Create admin without organizationId first
  //       createdUser = await adminService.createAdmin({
  //         email: newUserData.email,
  //         firstName: newUserData.firstName,
  //         lastName: newUserData.lastName,
  //         password: 'TempPass123!', // In a real app, this would be a generated password
  //         role: 'admin'
  //       });

  //       // Then assign to organization
  //       await adminService.assignAdminToOrganization(createdUser.id, newUserData.organizationId);
  //     } else if (newUserData.role === 'teacher') {
  //       createdUser = await adminService.createTeacher(
  //         {
  //           email: newUserData.email,
  //           firstName: newUserData.firstName,
  //           lastName: newUserData.lastName,
  //           password: 'TempPass123!'
  //         },
  //         newUserData.organizationId
  //       );
  //     } else {
  //       createdUser = await adminService.createStudent(
  //         {
  //           email: newUserData.email,
  //           firstName: newUserData.firstName,
  //           lastName: newUserData.lastName,
  //           password: 'TempPass123!'
  //         },
  //         newUserData.organizationId
  //       );
  //     }

  //     const roleDisplay = newUserData.role === 'superuser' ? 'Superuser' : newUserData.role.charAt(0).toUpperCase() + newUserData.role.slice(1);
  //     toast.success(`${roleDisplay} created successfully`);
  //     setNewUserData({ email: '', firstName: '', lastName: '', role: 'student', organizationId: '' });
  //     setShowAddUserModal(false);
  //     // Reload users after creating a new user
  //     loadUsers();
  //   } catch (error) {
  //     console.error('Error creating user:', error);
  //     const roleDisplay = newUserData.role === 'superuser' ? 'Superuser' : newUserData.role;
  //     toast.error(`Failed to create ${roleDisplay}`);
  //   }
  // };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const { firstName, lastName, email, password, role, organizationId } = newUserData;

    if (
      !newUserData.firstName ||
      !newUserData.lastName ||
      !newUserData.email ||
      !newUserData.password ||
      !newUserData.role ||
      !newUserData.organizationId
    ) {
      toast.error('Please fill in all required fields ');
      return;
    }

    // Find the selected organization by its internal ID
    const selectedOrg = organizations.find(org => String(org.id) === organizationId);

    // Use organizationCode as organizationId for backend
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      role,
      organizationId: selectedOrg?.organizationCode || '', // map code to API
    };
    console.log('PAYLOAD TO BACKEND', payload);
    try {
      setCreatingUser(true);
      const response = await adminService.createUser(payload);
      toast.success(`User ${newUserData.firstName} is created`);
      setNewUserData({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        role: 'student' as 'student' | 'teacher' | 'admin' | 'superuser',
        organizationId: '',
      });
      await loadUsers();
      return response;
    } catch (error) {
      console.log('ERROR IN COMPONENT [ HANDLE USER] ', error);
      toast.error('Failed to Create User');
    } finally {
      setCreatingUser(false);
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !editUserData.email ||
      !editUserData.firstName ||
      !editUserData.lastName ||
      !editUserData.organizationId
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedUser) {
      toast.error('No user selected for editing');
      return;
    }

    try {
      setUpdatingUser(true);

      // Find organization to map to correct organizationCode for backend
      const selectedOrg = organizations.find(org => String(org.id) === editUserData.organizationId);

      const payload = {
        firstName: editUserData.firstName.trim(),
        lastName: editUserData.lastName.trim(),
        email: editUserData.email.trim().toLowerCase(),
        role: editUserData.role,
        organizationId: selectedOrg?.organizationCode || '',
      };

      console.log('🟢 Updating user with payload:', payload);

      // API call to update user
      await adminService.superuserUpdateUser(selectedUser.id, payload);

      toast.success(`User ${editUserData.firstName} ${editUserData.lastName} updated successfully`);

      // Update the UI state accordingly
      if (searchMode) {
        // In search mode, update in current users list without refetching all pages
        setUsers(prev => prev.map(u => (u.id === selectedUser.id ? { ...u, ...payload } : u)));
      } else {
        // In normal mode, reload the current page
        await loadUsers(currentPage);
      }

      // Reset modal state
      setShowEditUserModal(false);
      setSelectedUser(null);
      setEditUserData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'student',
        organizationId: '',
      });
    } catch (error) {
      console.error('❌ Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setUpdatingUser(false);
    }
  };

  // Filter users based on search term, role, and organization
  // const filteredUsers = users.filter(user => {
  //   const matchesSearch =
  //     user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     user.email.toLowerCase().includes(searchTerm.toLowerCase());

  //   const matchesRole = roleFilter === 'all' || user.role === roleFilter;

  //   const matchesOrg =
  //     orgFilter === 'all' ||
  //     user.organizationId === orgFilter ||
  //     organizations.find(o => o.id === orgFilter)?.organizationCode === user.organizationId;

  //   return matchesSearch && matchesRole && matchesOrg;
  // });


  // Search Users based on search term and by clicking a button to trigger the search function
  //  const handleSearch = async () => {
  //    if (!searchTerm.trim()) {
  //      setSearchMode(false);
  //      loadUsers();
  //      return;
  //    }

  //    setSearchMode(true);
  //    setLoading(true);

  //    try {
  //      // Build the query object
  //      const query: any = {};
  //      if (searchTerm.includes('@')) {
  //        query.email = searchTerm.trim();
  //      } else {
  //        const parts = searchTerm.trim().split(' ');
  //        if (parts.length === 1) {
  //          query.firstName = parts[0];
  //        } else if (parts.length >= 2) {
  //          query.firstName = parts[0];
  //          query.lastName = parts.slice(1).join(' ');
  //        }
  //      }

  //      if (roleFilter !== 'all') {
  //        query.role = roleFilter;
  //      }

  //      // Fetch results
  //      const results = await adminService.searchUsers(query);

  //      // Handle cases where no users are found
  //      if (!results || results.length === 0) {
  //        setUsers([]); // Clear the table
  //        setTotalUsers(0);
  //        SetTotalPages(1);

  //      } else {
  //        setUsers(results);
  //        setTotalUsers(results.length);
  //        SetTotalPages(1);
  //      }
  //    } catch (error) {
  //      console.error('Search failed:', error);
  //     toast.error('No user found');
  //      setUsers([]); // Make sure table shows "No users found"
  //    } finally {
  //      setLoading(false);
  //    }
  //  };



  // auto search after user stops typing for 5 seconds
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchMode(false);
      loadUsers();
      return;
    }
    // clear previous timeout if the user keeps typing
    if (debounceTimeout) clearTimeout(debounceTimeout);

    const timeout = setTimeout(async () => {
      try {
        setCreatingUser(true);
        setLoading(true);

        // Build the query object
        const query: any = {};
        if (searchTerm.includes('@')) {
          query.email = searchTerm.trim();
        } else {
          const parts = searchTerm.trim().split(' ');
          if (parts.length === 1) {
            query.firstName = parts[0];
          } else if (parts.length >= 2) {
            query.firstName = parts[0];
            query.lastName = parts.slice(1).join(' ');
          }
        }

        if (roleFilter !== 'all') {
          query.role = roleFilter;
        }

        console.log('[Search Query Sent]', query);

        // Fetch results
        const results = await adminService.searchUsers(query);

        // Handle cases where no users are found
        if (!results || results.length === 0) {
          setUsers([]); // Clear the table
          setTotalUsers(0);
          SetTotalPages(1);
        } else {
          setUsers(results);
          setTotalUsers(results.length);
          SetTotalPages(1);
        }
      } catch (error) {
        console.error('Search failed:', error);
        toast.error('No user found');
        setUsers([]); // Make sure table shows "No users found"
      } finally {
        setLoading(false);
      }
    }, 2000);

    setDebounceTimeout(timeout)
    return () => clearTimeout(timeout)
  }, [searchTerm, roleFilter])


  useEffect(() => {
    loadUsers();
    loadOrganizations();
  }, []);

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchMode(false);
    loadUsers(); // reload all users
  };



  const columns: Column<User>[] = [
    {
      key: 'user',
      label: 'User',
      render: (_, user) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {user.firstName.charAt(0).toUpperCase()}{user.lastName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {user.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (_, user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'superuser' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
          user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
            user.role === 'teacher' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      )
    },
    {
      key: 'organization',
      label: 'Organization',
      render: (_, user) => {
        const org = organizations.find(o => o.organizationCode === user.organizationId);
        return (
          <div className="flex items-center gap-1">
            {org?.logo ? (
              <img
                src={org?.logo}
                alt={org?.name}
                className="h-7 w-7 rounded object-cover"
              />
            ) : (
              <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-1" />
            )}
            <span className="text-gray-900 dark:text-white">
              {org ? org.name : 'No Organization'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, user) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Set the selected user for editing
              setSelectedUser(user);
              // Pre-fill the edit form with user data
              setEditUserData({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role as 'student' | 'teacher' | 'admin' | 'superuser',
                organizationId:
                  organizations
                    .find(org => org.organizationCode === user.organizationId)
                    ?.id.toString() || '',
              });
              // Open the edit modal
              setShowEditUserModal(true);
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => loadUsers(i)}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Users: {totalUsers}</p>
        <div className="flex items-center gap-2 space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => loadUsers(currentPage - 1)}
          >
            Previous
          </Button>
          <p className="text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => loadUsers(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative p-10 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-purple-200 text-sm font-medium">
                <UserGroupIcon className="h-4 w-4 mr-2" />
                <span>Global User Control</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                User Management
              </h1>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                Oversee all users across the platform, manage roles, and handle account settings.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowAddUserModal(true)}
                className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 border-none rounded-xl px-6 py-3 h-auto text-base"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add New User
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative w-full md:w-[50%] md:col-span-2">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 p-1.5 rounded-lg transition-colors"
              >
                <span className="sr-only">Clear</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            All Users ({totalUsers})
          </h2>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : users?.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No users found
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <>
              <DataTable
                data={users}
                columns={columns}
                loading={loading}
                pagination={false}
                searchable={false}
              />

              {/* Show pagination only in normal (non-search) mode */}
              {!searchMode && totalPages > 1 && (
                <div className="px-8 pb-8">
                  {renderPagination()}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {/* Add User Modal */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Add New User"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={newUserData.firstName}
              onChange={e => setNewUserData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="John"
            />
            <Input
              label="Last Name"
              value={newUserData.lastName}
              onChange={e => setNewUserData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Doe"
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={newUserData.email}
            onChange={e => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="john.doe@example.com"
          />

          <Input
            label="Password"
            type="password"
            value={newUserData.password}
            onChange={e => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="**********"
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              value={newUserData.role}
              onChange={e => setNewUserData(prev => ({ ...prev, role: e.target.value as any }))}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="superuser">Superuser</option>
            </select>
          </div>

          {/* --- Organization Field --- */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Organization
            </label>
            <select
              value={newUserData.organizationId}
              onChange={e => setNewUserData(prev => ({ ...prev, organizationId: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an Organization</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {/* --- Conditional Red Notice --- */}
          {(() => {
            const selectedOrg = organizations.find(
              org => String(org.id) === newUserData.organizationId
            );
            var showNotice = selectedOrg && !selectedOrg.organizationCode;
            return (
              showNotice && (
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ The selected organization does not have an <strong>organization code</strong>{' '}
                  generated yet.
                </p>
              )
            );
          })()}

          {/* --- Footer Buttons --- */}
          {(() => {
            const selectedOrg = organizations.find(
              org => String(org.id) === newUserData.organizationId
            );
            const disableCreate = creatingUser || (selectedOrg && !selectedOrg.organizationCode); //Disable logic

            return (
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser} disabled={disableCreate}>
                  {creatingUser ? (
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </div>
            );
          })()}
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditUserModal}
        onClose={() => {
          setShowEditUserModal(false);
          setSelectedUser(null);
          setEditUserData({
            email: '',
            firstName: '',
            lastName: '',
            role: 'student',
            organizationId: '',
          });
        }}
        title="Edit User"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={editUserData.firstName}
              onChange={e => setEditUserData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="John"
            />
            <Input
              label="Last Name"
              value={editUserData.lastName}
              onChange={e => setEditUserData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Doe"
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={editUserData.email}
            onChange={e => setEditUserData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="john.doe@example.com"
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              value={editUserData.role}
              onChange={e => setEditUserData(prev => ({ ...prev, role: e.target.value as any }))}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              {selectedUser?.role === 'superuser' && <option value="superuser">Superuser</option>}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Organization
            </label>
            <select
              value={editUserData.organizationId}
              onChange={e => setEditUserData(prev => ({ ...prev, organizationId: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an organization</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditUserModal(false);
                setSelectedUser(null);
                setEditUserData({
                  email: '',
                  firstName: '',
                  lastName: '',
                  role: 'student',
                  organizationId: '',
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={updatingUser}>
              {updatingUser ? (
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}