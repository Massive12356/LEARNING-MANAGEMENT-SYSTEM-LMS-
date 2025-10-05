import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockApi } from '../../services/mockApi';
import { Program, Course } from '../../types';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  AcademicCapIcon,
  BookOpenIcon,
  TrophyIcon,
  LockClosedIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export function ProgramList() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'draft'>('all');
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedProgramAnalytics, setSelectedProgramAnalytics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    filterPrograms();
  }, [programs, searchTerm, statusFilter]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [programsData, coursesData] = await Promise.all([
        mockApi.getPrograms({ organizationId: user.organizationId }),
        mockApi.getCourses({ organizationId: user.organizationId })
      ]);
      
      setPrograms(programsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to load programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPrograms = () => {
    let filtered = [...programs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(program =>
        program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(program => program.status === statusFilter);
    }

    setFilteredPrograms(filtered);
  };

  const getProgramCourses = (program: Program) => {
    return courses.filter(course => program.courseIds.includes(course.id));
  };

  const handleViewAnalytics = async (programId: string) => {
    try {
      // TODO: Replace with real API call to GET /api/analytics/program/:id
      const analyticsData = {
        programId,
        enrollments: 89,
        completions: 67,
        completionRate: 75.3,
        averageTimeToComplete: 45, // days
        certificatesIssued: 67,
        courseCompletionRates: [
          { course: 'React Basics', rate: 85.2 },
          { course: 'Advanced React', rate: 72.1 },
          { course: 'React Testing', rate: 68.9 }
        ],
        studentProgression: [
          { stage: 'Course 1', students: 89 },
          { stage: 'Course 2', students: 76 },
          { stage: 'Course 3', students: 67 }
        ]
      };
      
      setSelectedProgramAnalytics(analyticsData);
      setShowAnalyticsModal(true);
    } catch (error) {
      console.error('Failed to load program analytics:', error);
      toast.error('Failed to load program analytics');
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
            Program Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage learning programs and course sequences
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/teacher/programs/new">
            <Button variant="outline">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Program
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
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {programs.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Programs
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
                {programs.filter(p => p.status === 'live').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Live Programs
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
              <TrophyIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {programs.filter(p => p.requiresCertificate).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                With Certificates
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
              <BookOpenIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {programs.reduce((acc, p) => acc + p.courseIds.length, 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Courses
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
                  placeholder="Search programs..."
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Program Grid */}
      {filteredPrograms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrograms.map((program) => {
            const programCourses = getProgramCourses(program);
            
            return (
              <Card key={program.id} className="group hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={program.coverImage || 'https://picsum.photos/600/300'}
                    alt={program.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {program.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                        {program.description}
                      </p>
                    </div>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      program.status === 'live' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {program.status}
                    </span>
                  </div>

                  {/* Program Features */}
                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <BookOpenIcon className="h-4 w-4 mr-1" />
                      <span>{program.courseIds.length} courses</span>
                    </div>
                    {program.requiresCertificate && (
                      <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                        <TrophyIcon className="h-4 w-4 mr-1" />
                        <span>Certificate</span>
                      </div>
                    )}
                    {program.requiredOrder && (
                      <div className="flex items-center text-blue-600 dark:text-blue-400">
                        <LockClosedIcon className="h-4 w-4 mr-1" />
                        <span>Sequential</span>
                      </div>
                    )}
                  </div>

                  {/* Course List */}
                  {programCourses.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Included Courses:
                      </h4>
                      <div className="space-y-2">
                        {programCourses.slice(0, 3).map((course, index) => (
                          <div key={course.id} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                              {index + 1}
                            </span>
                            <span className="truncate">{course.title}</span>
                          </div>
                        ))}
                        {programCourses.length > 3 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 ml-7">
                            +{programCourses.length - 3} more courses
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Updated {new Date(program.updatedAt).toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link to={`/student/program/${program.id}`}>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </Link>
                      <Link to={`/teacher/programs/${program.id}/edit`}>
                        <Button size="sm">
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewAnalytics(program.id)}
                    >
                      <ChartBarIcon className="h-4 w-4 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'No programs found' 
                : 'No programs yet'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Learning programs will appear here when teachers create them.'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <Link to="/teacher/programs/new">
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create First Program
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Program Analytics Modal */}
      <Modal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        title="Program Analytics"
        size="xl"
      >
        {selectedProgramAnalytics && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedProgramAnalytics.enrollments}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Enrollments
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {selectedProgramAnalytics.completionRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completion Rate
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {selectedProgramAnalytics.averageTimeToComplete}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Days to Complete
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {selectedProgramAnalytics.certificatesIssued}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Certificates Issued
                </div>
              </div>
            </div>

            {/* Course Completion Rates */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                Course Completion Rates
              </h4>
              <div className="space-y-3">
                {selectedProgramAnalytics.courseCompletionRates.map((course: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {course.course}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${course.rate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                        {course.rate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
      {/* Program Analytics Summary */}
      {programs.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Program Analytics Summary
            </h2>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Program analytics dashboard placeholder
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Connect analytics service for detailed program insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
            {/* Student Progression */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                Student Progression Through Program
              </h4>
              <div className="flex items-end justify-between space-x-4 h-32">
                {selectedProgramAnalytics.studentProgression.map((stage: any, index: number) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-600 rounded-t flex items-end justify-center text-white text-sm font-medium pb-2"
                      style={{ height: `${(stage.students / selectedProgramAnalytics.enrollments) * 100}%` }}
                    >
                      {stage.students}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                      {stage.stage}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}