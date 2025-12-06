import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { mockApi } from '../../services/mockApi';
import { Program, Course } from '../../types';
import { 
  PlusIcon,
  PhotoIcon,
  BookOpenIcon,
  XMarkIcon,
  Bars3Icon,
  LockClosedIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function ProgramBuilder() {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [program, setProgram] = useState<Program | null>(null);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const [programData, setProgramData] = useState({
    title: '',
    description: '',
    status: 'draft' as 'draft' | 'live',
    requiresCertificate: false,
    requiredOrder: false
  });

  const isEditing = !!programId;

  useEffect(() => {
    loadData();
  }, [programId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData, programData] = await Promise.all([
        mockApi.getCourses({ status: 'live' }),
        programId ? mockApi.getProgramById(programId) : Promise.resolve(null)
      ]);

      setAvailableCourses(coursesData);

      if (programData) {
        setProgram(programData);
        setProgramData({
          title: programData.title,
          description: programData.description,
          status: programData.status,
          requiresCertificate: programData.requiresCertificate,
          requiredOrder: programData.requiredOrder
        });

        // Set selected courses
        const programCourses = coursesData.filter(course => 
          programData.courseIds.includes(course.id)
        );
        setSelectedCourses(programCourses);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load program data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgram = async () => {
    if (!programData.title.trim()) {
      toast.error('Program title is required');
      return;
    }

    if (selectedCourses.length === 0) {
      toast.error('Please select at least one course');
      return;
    }

    setLoading(true);
    try {
      const programPayload = {
        ...programData,
        courseIds: selectedCourses.map(course => course.id),
        organizationId: user?.organizationId
      };

      if (isEditing && program) {
        // Update existing program
        const updatedProgram = await mockApi.updateProgram(program.id, programPayload);
        setProgram(updatedProgram);
        toast.success('Program updated successfully');
      } else {
        // Create new program
        const newProgram = await mockApi.createProgram(programPayload);
        setProgram(newProgram);
        toast.success('Program created successfully');
        navigate('/teacher/dashboard');
      }
    } catch (error) {
      console.error('Failed to save program:', error);
      toast.error('Failed to save program');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = (course: Course) => {
    if (!selectedCourses.find(c => c.id === course.id)) {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter(course => course.id !== courseId));
  };

  const handleReorderCourse = (courseId: string, direction: 'up' | 'down') => {
    const currentIndex = selectedCourses.findIndex(course => course.id === courseId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= selectedCourses.length) return;

    const newSelectedCourses = [...selectedCourses];
    [newSelectedCourses[currentIndex], newSelectedCourses[newIndex]] = 
    [newSelectedCourses[newIndex], newSelectedCourses[currentIndex]];
    
    setSelectedCourses(newSelectedCourses);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Program' : 'Create New Program'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isEditing ? 'Update your program details and course sequence' : 'Group courses into a structured learning program'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/teacher/programs')}>
            Cancel
          </Button>
          <Button onClick={handleSaveProgram} loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Program'}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Program Details */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Program Details
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Program Title"
              value={programData.title}
              onChange={(e) => setProgramData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter program title"
              required
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Program Description
              </label>
              <textarea
                value={programData.description}
                onChange={(e) => setProgramData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the learning outcomes and goals of this program"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Program Cover Image
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Upload a cover image for your program
                </p>
                <Button variant="outline" size="sm">
                  Choose File
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Program Settings */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Program Settings
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Program Status
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Control whether students can enroll in this program
                  </p>
                </div>
                <select
                  value={programData.status}
                  onChange={(e) => setProgramData(prev => ({ ...prev, status: e.target.value as 'draft' | 'live' }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Required Course Order
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Students must complete courses in the specified order
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={programData.requiredOrder}
                    onChange={(e) => setProgramData(prev => ({ ...prev, requiredOrder: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Program Certificate
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Award a certificate when students complete all courses
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={programData.requiresCertificate}
                    onChange={(e) => setProgramData(prev => ({ ...prev, requiresCertificate: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Courses */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Available Courses
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select courses to include in this program
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableCourses
                  .filter(course => !selectedCourses.find(c => c.id === course.id))
                  .map((course) => (
                    <div key={course.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <img
                        src={course.coverImage || 'https://picsum.photos/60/60'}
                        alt={course.title}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {course.modules.length} modules
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddCourse(course)}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                
                {availableCourses.filter(course => !selectedCourses.find(c => c.id === course.id)).length === 0 && (
                  <div className="text-center py-8">
                    <BookOpenIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">
                      All available courses have been added
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Courses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Program Courses
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
                {programData.requiredOrder && (
                  <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                    <LockClosedIcon className="h-4 w-4 mr-1" />
                    Sequential Order
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedCourses.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedCourses.map((course, index) => (
                    <div key={course.id} className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {programData.requiredOrder && (
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleReorderCourse(course.id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Bars3Icon className="h-3 w-3 rotate-90" />
                            </button>
                            <button
                              onClick={() => handleReorderCourse(course.id, 'down')}
                              disabled={index === selectedCourses.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Bars3Icon className="h-3 w-3 -rotate-90" />
                            </button>
                          </div>
                        )}
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </div>
                      </div>
                      
                      <img
                        src={course.coverImage || 'https://picsum.photos/60/60'}
                        alt={course.title}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {course.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>{course.modules.length} modules</span>
                          {course.requiresCertificate && (
                            <>
                              <span>•</span>
                              <div className="flex items-center">
                                <TrophyIcon className="h-3 w-3 mr-1" />
                                Certificate
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveCourse(course.id)}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpenIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No courses selected yet
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Add courses from the available list
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Program Summary */}
        {selectedCourses.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Program Summary
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedCourses.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Courses
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedCourses.reduce((acc, course) => acc + course.modules.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Modules
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {programData.requiredOrder ? 'Sequential' : 'Flexible'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Learning Path
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {programData.requiresCertificate ? 'Yes' : 'No'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Certificate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}