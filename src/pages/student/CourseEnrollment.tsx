// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { mockApi } from '../../services/mockApi';
import { organizationService } from '../../services/organizationService';
import { Course, Organization, Enrollment } from '../../types';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function CourseEnrollment() {
  const { user } = useAuthStore();
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'created' | 'updated'>('updated');
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    loadCourses();
    loadOrganization();
    loadEnrollments();
  }, [user]);

  useEffect(() => {
    filterAndSortCourses();
  }, [availableCourses, searchTerm, statusFilter, sortBy]);

  const loadCourses = async () => {
    if (!user?.organizationId) {
      toast.error('You must be enrolled in an organization to access courses');
      return;
    }
    
    try {
      // Only load courses from the user's organization
      const coursesData = await mockApi.getCourses({ 
        status: 'live',
        organizationId: user.organizationId
      });
      setAvailableCourses(coursesData);
    } catch (error) {
      console.error('Failed to load courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const loadOrganization = async () => {
    if (!user?.organizationDetails?.id) return;
    
    try {
      const orgData = await organizationService.getOrganizationById(user?.organizationDetails?.id.toString());
      setOrganization(orgData);
    } catch (error) {
      console.error('Failed to load organization:', error);
    }
  };

  const loadEnrollments = async () => {
    if (!user) return;
    
    try {
      const enrollmentsData = await mockApi.getUserEnrollments(user.id);
      setEnrolledCourses(enrollmentsData);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
    }
  };

  const filterAndSortCourses = () => {
    let filtered = [...availableCourses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    
    try {
      await mockApi.enrollUser(user.id, courseId);
      toast.success('Successfully enrolled in course');
      loadEnrollments();
    } catch (error) {
      toast.error('Failed to enroll in course');
    }
  };

  const isEnrolledInCourse = (courseId: string) => {
    return enrolledCourses.some(enrollment => enrollment.courseId === courseId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Organization Context */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Course Enrollment
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Browse and enroll in courses from your organization
          </p>
          {organization ? (
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              <span>{organization.name}</span>
            </div>
          ) : (
            <div className="mt-2 flex items-center text-sm text-yellow-600 dark:text-yellow-400">
              <UserGroupIcon className="h-4 w-4 mr-1" />
              <span>No organization enrollment found</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
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
                  <option value="live">Live</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="updated">Recently Updated</option>
                <option value="created">Recently Created</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="group hover:shadow-lg transition-shadow">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={course.coverImage || 'https://picsum.photos/400/225'}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {course.description}
                    </p>
                  </div>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    course.status === 'live' 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {course.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <span>{course.modules.length} modules</span>
                    {course.requiresCertificate && (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                        Certificate
                      </span>
                    )}
                  </div>
                  <span>
                    Updated {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Tags */}
                {course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {course.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        +{course.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Link to={`/student/course/${course.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  
                  {isEnrolledInCourse(course.id) ? (
                    <Button size="sm" disabled>
                      Enrolled
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handleEnroll(course.id)}
                      disabled={!organization}
                    >
                      Enroll
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpenIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No courses found' : 'No courses available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : organization 
                  ? 'There are currently no courses available in your organization.'
                  : 'You need to be enrolled in an organization to access courses.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary */}
      {availableCourses.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {availableCourses.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Available Courses
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {enrolledCourses.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Enrolled Courses
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {availableCourses.filter(c => c.status === 'live').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Live Courses
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}