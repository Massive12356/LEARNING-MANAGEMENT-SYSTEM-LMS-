import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProfilePictureUpload } from '../../components/ui/ProfilePictureUpload';
import { mockApi } from '../../services/mockApi';
import { User } from '../../types';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  ClockIcon,
  BookOpenIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { viewAsUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [userProgress, setUserProgress] = useState({
    enrolledCourses: 5,
    completedCourses: 3,
    totalTimeSpent: 1440, // minutes
    certificates: 2,
    lastLogin: new Date('2024-01-15')
  });

  // Determine the base path based on current user's role
  const basePath = currentUser?.role === 'superuser' ? '/superuser' : '/admin';

  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student' as 'student' | 'teacher' | 'admin' | 'superuser',
    birthday: '',
    country: '',
    gender: '',
    levelOfEducation: ''
  });

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    if (!userId) return;
    
    try {
      const userData = await mockApi.getUserById(userId);
      setUser(userData);
      setEditData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        birthday: userData.birthday || '',
        country: userData.country || '',
        gender: userData.gender || '',
        levelOfEducation: userData.levelOfEducation || ''
      });
    } catch (error) {
      console.error('Failed to load user:', error);
      toast.error('Failed to load user details');
      navigate(`${basePath}/users`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!user) return;

    try {
      await mockApi.updateUser(user.id, editData);
      setUser({ ...user, ...editData });
      setEditing(false);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleArchiveUser = async () => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to archive this user? They will lose access to the platform.')) {
      return;
    }

    try {
      await mockApi.archiveUser(user.id);
      toast.success('User archived successfully');
      navigate(`${basePath}/users`);
    } catch (error) {
      toast.error('Failed to archive user');
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await mockApi.deleteUser(user.id);
      toast.success('User deleted successfully');
      navigate(`${basePath}/users`);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleViewAsUser = async () => {
    if (!user) return;
    
    try {
      await viewAsUser(user.id);
      navigate('/student/dashboard');
    } catch (error) {
      toast.error('Failed to view as user');
    }
  };

  const handleProfilePictureUpdate = async (imageUrl: string | null) => {
    if (!user) return;
    
    try {
      await mockApi.updateUser(user.id, { profileImage: imageUrl || undefined });
      setUser({ ...user, profileImage: imageUrl || undefined });
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to update profile picture');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User not found</h2>
        <Link to={`${basePath}/users`} className="text-blue-600 hover:text-blue-500 mt-4 inline-block">
          Return to User Management
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={`${basePath}/users`}>
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              User details and activity overview
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {user.role === 'student' && (
            <Button variant="outline" onClick={handleViewAsUser}>
              <EyeIcon className="h-4 w-4 mr-2" />
              View As User
            </Button>
          )}
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit User
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveUser}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Profile */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm rounded-full capitalize ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                      : user.role === 'teacher'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {user.role}
                  </span>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    user.isArchived
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  }`}>
                    {user.isArchived ? 'Archived' : 'Active'}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture Section */}
              <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Profile Picture
                  </h3>
                  <ProfilePictureUpload
                    currentImageUrl={user.profileImage}
                    onImageUpdate={handleProfilePictureUpdate}
                    size="lg"
                    disabled={!editing}
                  />
                </div>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={editData.firstName}
                      onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                    <Input
                      label="Last Name"
                      value={editData.lastName}
                      onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  
                  <Input
                    label="Email Address"
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </label>
                    <select
                      value={editData.role}
                      onChange={(e) => setEditData(prev => ({ ...prev, role: e.target.value as any }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <Input
                    label="Birthday"
                    type="date"
                    value={editData.birthday}
                    onChange={(e) => setEditData(prev => ({ ...prev, birthday: e.target.value }))}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Country
                      </label>
                      <select
                        value={editData.country}
                        onChange={(e) => setEditData(prev => ({ ...prev, country: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select country</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Gender
                      </label>
                      <select
                        value={editData.gender}
                        onChange={(e) => setEditData(prev => ({ ...prev, gender: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Level of Education
                    </label>
                    <select
                      value={editData.levelOfEducation}
                      onChange={(e) => setEditData(prev => ({ ...prev, levelOfEducation: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select education level</option>
                      <option value="high-school">High School</option>
                      <option value="associate">Associate Degree</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="phd">PhD</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                  </div>

                  {user.birthday && (
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Birthday</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(user.birthday).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {user.country && (
                    <div className="flex items-center space-x-3">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Country</p>
                        <p className="font-medium text-gray-900 dark:text-white">{user.country}</p>
                      </div>
                    </div>
                  )}

                  {user.levelOfEducation && (
                    <div className="flex items-center space-x-3">
                      <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Education</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {user.levelOfEducation.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last Login</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {!editing && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
                  Danger Zone
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Archive User</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      User will lose access but data will be preserved
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleArchiveUser}>
                    Archive User
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Delete User</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Permanently delete user and all associated data
                    </p>
                  </div>
                  <Button variant="danger" onClick={handleDeleteUser}>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete User
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Activity Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Activity Summary
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <BookOpenIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {userProgress.enrolledCourses}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Enrolled Courses
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrophyIcon className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {userProgress.completedCourses}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completed Courses
                </div>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <ClockIcon className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(userProgress.totalTimeSpent / 60)}h
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Time Spent Learning
                </div>
              </div>

              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AcademicCapIcon className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                <div className="text-2xl font-bold text-yellow-600">
                  {userProgress.certificates}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Certificates Earned
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Account Details
              </h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.updatedAt.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">User ID</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  {user.id}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}