// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { mockApi } from '../../services/mockApi';
import { organizationService } from '../../services/organizationService';
import { Course, CourseListItem, CourseResponse, Organization } from '../../types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  FunnelIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { courseService } from '../../services/courseService';

export function CourseList() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'live' | 'draft' >('all');
  const [sortBy, setSortBy] = useState<'title' | 'created' | 'updated'>('updated');
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    loadCourses();
    loadOrganization();
  }, [user]);

  useEffect(() => {
    filterAndSortCourses();
  }, [courses, searchTerm, statusFilter, sortBy]);

  const loadCourses = async () => {
    if (!user?.organizationId) {
      toast.error('You must be assigned to an organization to create courses');
      navigate('/teacher/dashboard');
      return;
    }

    try {
      const response: CourseResponse[] = await courseService.loadAllCourses();

      const mappedCourses: CourseListItem[] = response.map(item => ({
        id: item.course.id,
        title: item.course.title,
        description: item.course.description,
        tags: item.course.tags,
        coverImage: item.course.images?.[0] ?? null,
        status: item.settings.courseStatus,
        modulesCount: item.modules.length,
        requiresCertificate: item.settings.certificateOnCompletion,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      setCourses(mappedCourses);
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const loadOrganization = async () => {
    if (!user?.organizationDetails?.id) return;

    try {
      const orgData = await organizationService.getOrganizationById(
        user?.organizationDetails?.id.toString()
      );
      setOrganization(orgData);
    } catch (error) {
      console.error('Failed to load organization:', error);
    }
  };

  const filterAndSortCourses = () => {
    let filtered = [...courses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        course =>
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

  // const handleDuplicateCourse = async (courseId: string) => {
  //   try {
  //     await mockApi.duplicateCourse(courseId);
  //     toast.success('Course duplicated successfully');
  //     loadCourses();
  //   } catch (error) {
  //     toast.error('Failed to duplicate course');
  //   }
  // };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      toast.success('Course deleted successfully');
      loadCourses();
    } catch (error:any) {
      toast.error( error?.message ?? 'Failed to delete course');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Organization Context */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage and organize your course content
          </p>
          {loading ? (
            <div className="mt-2 h-4 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          ) : organization ? (
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              {organization.logo ? (
                <img
                  src={organization.logo}
                  alt={organization.name}
                  className="w-7 h-7 object-cover mr-1 rounded-full"
                />
              ) : (
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              )}
              <p>
                Teaching at{' '}
                <span className="font-medium text-blue-600 dark:text-yellow-400">
                  {organization?.name ?? 'N/A'}
                </span>
              </p>
            </div>
          ) : (
            <div className="mt-2 flex items-center text-sm text-yellow-600 dark:text-yellow-400">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              <span>No organization assigned - contact your admin</span>
            </div>
          )}
        </div>
        <Link to="/teacher/courses/new">
          <Button disabled={!organization}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </Link>
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
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
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
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg
            className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400"
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
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </div>
      ) : filteredCourses?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses?.map(course => (
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
                      {course?.title ?? 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {course?.description ?? 'N/A'}
                    </p>
                  </div>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      course?.status === 'published'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }`}
                  >
                    {course?.status ?? 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <span>{course?.modulesCount ?? 0} modules</span>
                    {course?.requiresCertificate && (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                        Certificate
                      </span>
                    )}
                  </div>
                  <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                </div>

                {/* Tags */}
                {course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.tags.slice(0, 3).map(tag => (
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
                  <div className="flex items-center space-x-2">
                    <Link to={`/student/course/${course.id}`}>
                      <Button variant="outline" size="sm">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </Link>
                    <Link to={`/teacher/courses/${course.id}/edit`}>
                      <Button size="sm">
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* <button
                      onClick={() => handleDuplicateCourse(course.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Duplicate course"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button> */}
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Delete course"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
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
              {searchTerm || statusFilter !== 'all' ? 'No courses found' : 'No courses yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? "Try adjusting your search or filters to find what you're looking for."
                : organization
                ? 'Get started by creating your first course.'
                : 'You need to be assigned to an organization by your admin before you can create courses.'}
            </p>
            {!searchTerm && statusFilter === 'all' && organization && (
              <Link to="/teacher/courses/new">
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Summary */}
      {courses.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {courses.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {courses.filter(c => c.status === 'published').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Live Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {courses.filter(c => c.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Draft Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {courses.reduce((acc, course) => acc + course?.modulesCount, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Modules</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
