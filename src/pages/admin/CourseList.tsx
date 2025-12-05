import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockApi } from '../../services/mockApi';
import { Course } from '../../types';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Modal } from '../../components/ui/Modal';

export default function CourseList() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'draft'>('all');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedCourseAnalytics, setSelectedCourseAnalytics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, statusFilter, teacherFilter]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [coursesData, teachersData] = await Promise.all([
        mockApi.getCourses({ organizationId: user.organizationId }),
        mockApi.getUsers({ role: 'teacher', organizationId: user.organizationId })
      ]);
      
      setCourses(coursesData);
      setTeachers(teachersData.data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
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

    // Apply teacher filter
    if (teacherFilter !== 'all') {
      filtered = filtered.filter(course => course.teacherId === teacherFilter);
    }

    setFilteredCourses(filtered);
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher';
  };

  const handleViewAnalytics = async (courseId: string) => {
    try {
      // TODO: Replace with real API call to GET /api/analytics/course/:id
      const analyticsData = {
        courseId,
        enrollments: 156,
        completions: 122,
        completionRate: 78.2,
        averageScore: 87.5,
        totalTimeSpent: 2340,
        studentEngagement: 85.3,
        dropoffPoints: [
          { lesson: 'Advanced Hooks', dropoffRate: 15.2 },
          { lesson: 'State Management', dropoffRate: 12.8 }
        ],
        weeklyProgress: [
          { week: 'Week 1', completions: 23 },
          { week: 'Week 2', completions: 31 },
          { week: 'Week 3', completions: 28 },
          { week: 'Week 4', completions: 40 }
        ]
      };
      
      setSelectedCourseAnalytics(analyticsData);
      setShowAnalyticsModal(true);
    } catch (error) {
      console.error('Failed to load course analytics:', error);
      toast.error('Failed to load course analytics');
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Course Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Oversee all courses in your organization
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/teacher/courses">
            <Button variant="outline">
              <BookOpenIcon className="h-4 w-4 mr-2" />
              Teacher View
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button>
              <ChartBarIcon className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <BookOpenIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {courses.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Courses
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <EyeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {courses.filter(c => c.status === 'live').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Live Courses
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
              <PencilIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {courses.filter(c => c.status === 'draft').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Draft Courses
              </p>
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
                {teachers.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Teachers
              </p>
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
                  <option value="draft">Draft</option>
                </select>
              </div>

              <select
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Teachers</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
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

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    <span>Teacher: {getTeacherName(course.teacherId)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <BookOpenIcon className="h-4 w-4 mr-1" />
                      <span>{course.modules.length} modules</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {course.requiresCertificate && (
                    <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      Certificate Available
                    </div>
                  )}
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
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewAnalytics(course.id)}
                  >
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
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
              {searchTerm || statusFilter !== 'all' || teacherFilter !== 'all' 
                ? 'No courses found' 
                : 'No courses yet'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' || teacherFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Courses created by teachers will appear here.'
              }
            </p>
            {(!searchTerm && statusFilter === 'all' && teacherFilter === 'all') && (
              <Link to="/teacher/courses/new">
                <Button>
                  Create First Course
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Course Analytics Summary */}
      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Course Analytics Summary
            </h2>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Course analytics dashboard placeholder
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Connect analytics service for detailed course insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Analytics Modal */}
      <Modal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        title="Course Analytics"
        size="xl"
      >
        {selectedCourseAnalytics && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedCourseAnalytics.enrollments}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Enrollments
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {selectedCourseAnalytics.completionRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completion Rate
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {selectedCourseAnalytics.averageScore}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average Score
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.round(selectedCourseAnalytics.totalTimeSpent / 60)}h
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Time Spent
                </div>
              </div>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Weekly Progress
                </h4>
                <div className="h-32 flex items-end justify-between space-x-2">
                  {selectedCourseAnalytics.weeklyProgress.map((week: any, index: number) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-600 rounded-t"
                        style={{ height: `${(week.completions / 40) * 100}%` }}
                      />
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        {week.week}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Drop-off Points
                </h4>
                <div className="space-y-3">
                  {selectedCourseAnalytics.dropoffPoints.map((point: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {point.lesson}
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        {point.dropoffRate}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}