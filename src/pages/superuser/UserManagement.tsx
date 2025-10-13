import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { DataTable, Column } from '../../components/ui/DataTable';
import { User, Organization } from '../../types';
import { adminService } from '../../services/adminService';
import { organizationService } from '../../services/organizationService';
import { 
  PlusIcon,
  EyeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  PencilIcon
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

  const [newUserData, setNewUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'student' as 'student' | 'teacher' | 'admin',
    organizationId: ''
  });

  useEffect(() => {
    loadUsers();
    loadOrganizations();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Use real API endpoint to fetch all users for superuser
      const allUsers = await adminService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const response = await organizationService.getOrganizations();
      setOrganizations(response.organizations || []);
    } catch (error) {
      console.error('Failed to load organizations:', error);
      toast.error('Failed to load organizations');
    }
  };

  const handleAddUser = async () => {
    if (!newUserData.email || !newUserData.firstName || !newUserData.lastName || !newUserData.organizationId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let createdUser: User;
      
      // Create user based on role using real API
      if (newUserData.role === 'admin') {
        // Create admin without organizationId first
        createdUser = await adminService.createAdmin({
          email: newUserData.email,
          firstName: newUserData.firstName,
          lastName: newUserData.lastName,
          password: 'TempPass123!', // In a real app, this would be a generated password
          role: 'admin'
        });
        
        // Then assign to organization
        await adminService.assignAdminToOrganization(createdUser.id, newUserData.organizationId);
      } else if (newUserData.role === 'teacher') {
        createdUser = await adminService.createTeacher(
          {
            email: newUserData.email,
            firstName: newUserData.firstName,
            lastName: newUserData.lastName,
            password: 'TempPass123!'
          },
          newUserData.organizationId
        );
      } else {
        createdUser = await adminService.createStudent(
          {
            email: newUserData.email,
            firstName: newUserData.firstName,
            lastName: newUserData.lastName,
            password: 'TempPass123!'
          },
          newUserData.organizationId
        );
      }
      
      toast.success(`${newUserData.role.charAt(0).toUpperCase() + newUserData.role.slice(1)} created successfully`);
      setNewUserData({ email: '', firstName: '', lastName: '', role: 'student', organizationId: '' });
      setShowAddUserModal(false);
      // Reload users after creating a new user
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(`Failed to create ${newUserData.role}`);
    }
  };

  // Filter users based on search term, role, and organization
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const matchesOrg = orgFilter === 'all' || user.organizationId === orgFilter;
    
    return matchesSearch && matchesRole && matchesOrg;
  });

  const columns: Column<User>[] = [
    {
      key: 'user',
      label: 'User',
      render: (_, user) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.role === 'superuser' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
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
        const org = organizations.find(o => o.id === user.organizationId);
        return (
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-1" />
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
          <Link to={`/superuser/users/${user.id}`}>
            <Button variant="outline" size="sm">
              <EyeIcon className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <PencilIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage all users across all organizations
          </p>
        </div>
        <Button onClick={() => setShowAddUserModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="superuser">Superuser</option>
            </select>
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
            >
              <option value="all">All Organizations</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            All Users ({filteredUsers.length})
          </h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
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
            <DataTable 
              data={filteredUsers} 
              columns={columns}
              pagination
            />
          )}
        </CardContent>
      </Card>

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
              onChange={(e) => setNewUserData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="John"
            />
            <Input
              label="Last Name"
              value={newUserData.lastName}
              onChange={(e) => setNewUserData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Doe"
            />
          </div>
          
          <Input
            label="Email Address"
            type="email"
            value={newUserData.email}
            onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="john.doe@example.com"
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              value={newUserData.role}
              onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value as any }))}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Organization
            </label>
            <select
              value={newUserData.organizationId}
              onChange={(e) => setNewUserData(prev => ({ ...prev, organizationId: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an organization</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowAddUserModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              Create User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}