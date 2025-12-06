import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
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
  PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function ProgramList() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'draft'>('all');

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    filterPrograms();
  }, [programs, searchTerm, statusFilter]);

  const loadData = async () => {
    if (!user?.organizationId) {
      toast.error('You must be assigned to an organization to manage programs');
      navigate('/teacher/dashboard');
      return;
    }
    
    try {
      const [programsData, coursesData] = await Promise.all([
        mockApi.getPrograms({ organizationId: user.organizationId }),
        mockApi.getCourses({ organizationId: user.organizationId })
      ]);
      
      setPrograms(programsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to load programs:', error);
      toast.error('Failed to load programs');
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

  const handleEditProgram = (programId: string) => {
    navigate(`/teacher/programs/${programId}/edit`);
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
            My Programs
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your learning programs and course sequences
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/teacher/programs/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Program
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
                {courses.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Available Courses
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
        </CardContent>
      </Card>

      {/* Programs List */}
      {filteredPrograms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => {
            const programCourses = getProgramCourses(program);
            const completedCourses = programCourses.filter(c => c.status === 'live').length;
            
            return (
              <Card key={program.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {program.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {program.description}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {program.status === 'live' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <BookOpenIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{programCourses.length} courses</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <TrophyIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>
                        {program.requiresCertificate ? 'Certificate awarded' : 'No certificate'}
                      </span>
                    </div>
                    
                    {program.requiredOrder && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <LockClosedIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>Required order</span>
                      </div>
                    )}
                    
                    <div className="pt-4 flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProgram(program.id)}
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Link to={`/teacher/programs/${program.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
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
                : 'Learning programs will appear here when you create them.'
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
    </div>
  );
}