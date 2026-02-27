import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { mockApi } from '../../services/mockApi';
import { organizationService } from '../../services/organizationService';
import { Course, Organization, Enrollment } from '../../types';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  ArrowsUpDownIcon,
  Bars3BottomLeftIcon
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

  useEffect(() => {
    loadCourses();
    loadOrganization();
    loadEnrollments();
  }, [user]);

  return (
    <div className="space-y-10 pb-16">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative p-10 md:p-14">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-blue-300 text-sm font-bold">
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                University Catalog
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                  Course Enrollment
                </h1>
                <p className="text-slate-300 text-xl max-w-xl leading-relaxed font-medium">
                  Elevate your skills with our curated selection of professional courses from your organization.
                </p>
              </div>

              {organization && (
                <div className="flex items-center gap-3 px-5 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl w-fit">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <BuildingOfficeIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Affiliated Organization</p>
                    <p className="text-white font-bold">{organization.name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full translate-x-10 translate-y-10"></div>
              <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-4xl font-black text-white">{availableCourses.length}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-black text-blue-400">{enrolledCourses.length}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enrolled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-8 items-end">
          <div className="flex-1 space-y-3 w-full">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Search Courses</label>
            <div className="relative group">
              <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none min-w-[200px] space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Live Status</label>
              <div className="relative">
                <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full pl-11 pr-10 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-slate-900 dark:text-white font-bold appearance-none focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="live">Live Only</option>
                </select>
              </div>
            </div>

            <div className="flex-1 lg:flex-none min-w-[200px] space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Order By</label>
              <div className="relative">
                <ArrowsUpDownIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full pl-11 pr-10 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-slate-900 dark:text-white font-bold appearance-none focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="created">Recently Created</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSortBy('updated');
              }}
              className="mt-7 p-4 bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all"
              title="Reset Filters"
            >
              <ArrowPathIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            const isEnrolled = isEnrolledInCourse(course.id);
            return (
              <div
                key={course.id}
                className="group bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 flex flex-col"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={course.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                    alt={course.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg backdrop-blur-md border ${course.status === 'live'
                      ? 'bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 border-amber-500/20 text-amber-400'
                      }`}>
                      {course.status}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                          <img src={`https://i.pravatar.cc/150?u=${course.id}${i}`} alt="User" className="h-full w-full object-cover" />
                        </div>
                      ))}
                      <div className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                        +12
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                        {(course as any).category || 'Level 1'}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {course.modules.length} Modules
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium line-clamp-2 mb-6 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* Specific Tags */}
                  {course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                      {course.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 text-[10px] font-bold bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-xl"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-6 border-t border-gray-50 dark:border-gray-700">
                    <Link to={`/student/course/${course.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-11 rounded-xl border-gray-100 dark:border-gray-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                      >
                        Details
                      </Button>
                    </Link>

                    {isEnrolled ? (
                      <Button
                        size="sm"
                        disabled
                        className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 text-xs font-bold"
                      >
                        Enrolled
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleEnroll(course.id)}
                        disabled={!organization}
                        className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
                      >
                        Enroll Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] text-center py-20 border border-gray-100 dark:border-gray-700">
          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] w-fit mx-auto mb-8">
            <BookOpenIcon className="h-16 w-16 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {searchTerm || statusFilter !== 'all' ? 'No courses found' : 'No courses available'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
            {searchTerm || statusFilter !== 'all'
              ? 'We couldn\'t find any courses matching your current search or filter criteria.'
              : organization
                ? 'Your organization hasn\'t published any courses yet. Please check back later.'
                : 'You need to be part of an organization to see available courses.'
            }
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-8 text-blue-600 font-bold hover:text-blue-700 transition-colors underline decoration-2 underline-offset-8"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Stats Summary - Redesigned */}
      {availableCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Available Catalog', value: availableCourses.length, icon: AcademicCapIcon, color: 'blue' },
            { label: 'My Enrollments', value: enrolledCourses.length, icon: BookOpenIcon, color: 'indigo' },
            { label: 'Active Sessions', value: availableCourses.filter(c => c.status === 'live').length, icon: Bars3BottomLeftIcon, color: 'emerald' }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900">
                    <Icon className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-2">{stat.value}</p>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}