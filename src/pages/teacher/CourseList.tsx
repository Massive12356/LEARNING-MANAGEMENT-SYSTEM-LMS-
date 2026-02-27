import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { mockApi } from '../../services/mockApi';
import { organizationService } from '../../services/organizationService';
import { Course, Organization } from '../../types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

export function CourseList() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'created' | 'updated'>('updated');
  const [organization, setOrganization] = useState<Organization | null>(null);

  const loadCourses = useCallback(async () => {
    if (!user?.organizationId) {
      toast.error('You must be assigned to an organization to create courses');
      navigate('/teacher/dashboard');
      return;
    }

    try {
      // Load all courses for the teacher's organization (without teacher filter for demo)
      const coursesData = await mockApi.getCourses({
        organizationId: user.organizationId
      });
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to load courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [user?.organizationId, navigate]);

  const loadOrganization = useCallback(async () => {
    if (!user?.organizationDetails?.id) return;

    try {
      const orgData = await organizationService.getOrganizationById(user?.organizationDetails?.id.toString());
      setOrganization(orgData);
    } catch (error) {
      console.error('Failed to load organization:', error);
    }
  }, [user?.organizationDetails?.id]);

  useEffect(() => {
    loadCourses();
    loadOrganization();
  }, [loadCourses, loadOrganization]);

  const filterAndSortCourses = useCallback(() => {
    let filtered = [...courses];

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
  }, [courses, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    filterAndSortCourses();
  }, [filterAndSortCourses]);

  const handleDuplicateCourse = async (courseId: string) => {
    try {
      await mockApi.duplicateCourse(courseId);
      toast.success('Course duplicated successfully');
      loadCourses();
    } catch (error) {
      console.error('Failed to duplicate course:', error);
      toast.error('Failed to duplicate course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await mockApi.deleteCourse(courseId);
      toast.success('Course deleted successfully');
      loadCourses();
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast.error('Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Header - Taller & Bolder */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative p-10 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-emerald-200 text-sm font-medium">
                <BookOpenIcon className="h-4 w-4 mr-2" />
                <span>Course Management</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                My Courses
              </h1>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                Manage your curriculum, track status, and organize your educational content.
              </p>

              {organization && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <BuildingOfficeIcon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-slate-300 font-medium">{organization.name}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/teacher/courses/new">
                <Button className="h-14 px-8 text-lg bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 hover:-translate-y-1 rounded-2xl">
                  <PlusIcon className="h-6 w-6 mr-2" />
                  Create New Course
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search - Modern Floating Bar */}
      <div className="sticky top-4 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search courses by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 block w-full px-4 py-3.5 border-0 bg-gray-100 dark:bg-gray-900/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
            <div className="flex items-center bg-gray-100 dark:bg-gray-900/50 rounded-xl p-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${statusFilter === 'all'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('live')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${statusFilter === 'live'
                  ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                  }`}
              >
                Live
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${statusFilter === 'draft'
                  ? 'bg-white dark:bg-gray-800 text-amber-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                  }`}
              >
                Draft
              </button>
            </div>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'title' | 'created' | 'updated')}
              className="px-4 py-3.5 border-0 bg-gray-100 dark:bg-gray-900/50 rounded-xl text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[160px]"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div key={course.id} className="group flex flex-col bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
                <img
                  src={course.coverImage || 'https://picsum.photos/400/225'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md ${course.status === 'live'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                    {course.status}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <Link to={`/student/course/${course.id}`} className="flex-1">
                    <Button size="sm" className="w-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </Link>
                  <Link to={`/teacher/courses/${course.id}/edit`} className="flex-1">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-600/20">
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <div className="mt-auto space-y-4">
                  {/* Tags */}
                  {course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {course.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                      {course.tags.length > 3 && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 rounded-lg">
                          +{course.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <BookOpenIcon className="h-4 w-4 mr-1.5" />
                      <span className="font-medium">{course.modules.length} Modules</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicateCourse(course.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Duplicate course"
                      >
                        <DocumentDuplicateIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete course"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="mx-auto h-24 w-24 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
            <BookOpenIcon className="h-12 w-12 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No courses found' : 'Start Your Teaching Journey'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-lg">
            {searchTerm || statusFilter !== 'all'
              ? 'We couldn\'t find any courses matching your filters. Try adjusting your search terms.'
              : 'Create your first course to start sharing your knowledge with students.'
            }
          </p>
          {(!searchTerm && statusFilter === 'all' && organization) && (
            <Link to="/teacher/courses/new">
              <Button size="lg" className="rounded-xl shadow-lg shadow-blue-500/20">
                <PlusIcon className="h-5 w-5 mr-2" />
                Create First Course
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Stats Summary - Gradient Cards */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <BookOpenIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-blue-100 text-sm font-medium">Total</span>
            </div>
            <div className="text-4xl font-bold mb-1">{courses.length}</div>
            <div className="text-blue-100 text-sm">All Courses</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-emerald-100 text-sm font-medium">Active</span>
            </div>
            <div className="text-4xl font-bold mb-1">{courses.filter(c => c.status === 'live').length}</div>
            <div className="text-emerald-100 text-sm">Live Courses</div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <PencilIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-amber-100 text-sm font-medium">Drafts</span>
            </div>
            <div className="text-4xl font-bold mb-1">{courses.filter(c => c.status === 'draft').length}</div>
            <div className="text-amber-100 text-sm">In Progress</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-purple-100 text-sm font-medium">Content</span>
            </div>
            <div className="text-4xl font-bold mb-1">{courses.reduce((acc, course) => acc + course.modules.length, 0)}</div>
            <div className="text-purple-100 text-sm">Total Modules</div>
          </div>
        </div>
      )}
    </div>
  );
}