// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { FileUploader } from '../../components/ui/FileUploader';
import { StudentManagement } from '../../components/teacher/StudentManagement';
import { AnnouncementForm } from '../../components/teacher/AnnouncementForm';
import { mockApi } from '../../services/mockApi';
import { UploadResult } from '../../services/fileUploadService';
import { Course, Module, Lesson } from '../../types';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PhotoIcon,
  PlayIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  PaperClipIcon,
  QuestionMarkCircleIcon,
  PencilSquareIcon,
  Bars3Icon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function CourseBuilder() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [studentCount, setStudentCount] = useState(0);

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    status: 'draft' as 'draft' | 'live',
    isTracked: true,
    allowSelfPacing: true,
    requiresCertificate: false,
    isGraded: false
  });

  const [moduleData, setModuleData] = useState({
    title: '',
    description: ''
  });

  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    type: 'video' as 'video' | 'text' | 'pdf' | 'attachment' | 'quiz' | 'reflection',
    content: {} as any,
    duration: 0,
    isRequired: true
  });

  const isEditing = !!courseId;

  useEffect(() => {
    if (isEditing) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      const courseData = await mockApi.getCourseById(courseId);
      setCourse(courseData);
      setCourseData({
        title: courseData.title,
        description: courseData.description,
        tags: courseData.tags,
        status: courseData.status,
        isTracked: courseData.isTracked,
        allowSelfPacing: courseData.allowSelfPacing,
        requiresCertificate: courseData.requiresCertificate,
        isGraded: courseData.isGraded
      });
    } catch (error) {
      console.error('Failed to load course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!courseData.title.trim()) {
      toast.error('Course title is required');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && course) {
        await mockApi.updateCourse(course.id, courseData);
        toast.success('Course updated successfully');
      } else {
        const newCourse = await mockApi.createCourse({
          ...courseData,
          teacherId: user!.id
        });
        navigate(`/teacher/courses/${newCourse.id}/edit`);
        toast.success('Course created successfully');
      }
    } catch (error) {
      toast.error('Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    if (!moduleData.title.trim()) {
      toast.error('Module title is required');
      return;
    }

    // Mock module creation
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: moduleData.title,
      description: moduleData.description,
      order: course?.modules.length || 0,
      courseId: course?.id || '',
      lessons: []
    };

    if (course) {
      setCourse({
        ...course,
        modules: [...course.modules, newModule]
      });
    }

    setModuleData({ title: '', description: '' });
    setShowModuleModal(false);
    toast.success('Module added successfully');
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setModuleData({
      title: module.title,
      description: module.description
    });
    setShowModuleModal(true);
  };

  const handleUpdateModule = async () => {
    if (!moduleData.title.trim()) {
      toast.error('Module title is required');
      return;
    }

    if (!editingModule) return;

    if (course) {
      const updatedModules = course.modules.map(module => 
        module.id === editingModule.id 
          ? { ...module, title: moduleData.title, description: moduleData.description }
          : module
      );

      setCourse({
        ...course,
        modules: updatedModules
      });
    }

    setEditingModule(null);
    setModuleData({ title: '', description: '' });
    setShowModuleModal(false);
    toast.success('Module updated successfully');
  };

  const handleDeleteModule = (moduleId: string, moduleTitle: string) => {
    if (!confirm(`Are you sure you want to delete the module "${moduleTitle}"? This will also delete all lessons in this module.`)) {
      return;
    }

    if (course) {
      const updatedModules = course.modules.filter(module => module.id !== moduleId);
      
      // Update order of remaining modules
      const reorderedModules = updatedModules.map((module, index) => ({
        ...module,
        order: index
      }));

      setCourse({
        ...course,
        modules: reorderedModules
      });
    }

    toast.success('Module deleted successfully');
  };

  const handleAddLesson = async () => {
    if (!lessonData.title.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    if (!selectedModuleId) {
      toast.error('Please select a module');
      return;
    }

    // Mock lesson creation
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: lessonData.title,
      description: lessonData.description,
      type: lessonData.type,
      content: lessonData.content,
      order: 0,
      moduleId: selectedModuleId,
      duration: lessonData.duration,
      isRequired: lessonData.isRequired
    };

    if (course) {
      const updatedModules = course.modules.map(module => {
        if (module.id === selectedModuleId) {
          return {
            ...module,
            lessons: [...module.lessons, newLesson]
          };
        }
        return module;
      });

      setCourse({
        ...course,
        modules: updatedModules
      });
    }

    setLessonData({
      title: '',
      description: '',
      type: 'video',
      content: {},
      duration: 0,
      isRequired: true
    });
    setShowLessonModal(false);
    toast.success('Lesson added successfully');
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonData({
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      content: lesson.content,
      duration: lesson.duration || 0,
      isRequired: lesson.isRequired
    });
    setSelectedModuleId(lesson.moduleId);
    setShowLessonModal(true);
  };

  const handleUpdateLesson = async () => {
    if (!lessonData.title.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    if (!editingLesson) return;

    if (course) {
      const updatedModules = course.modules.map(module => {
        if (module.id === editingLesson.moduleId) {
          const updatedLessons = module.lessons.map(lesson => 
            lesson.id === editingLesson.id 
              ? { 
                  ...lesson, 
                  title: lessonData.title,
                  description: lessonData.description,
                  type: lessonData.type,
                  content: lessonData.content,
                  duration: lessonData.duration,
                  isRequired: lessonData.isRequired
                }
              : lesson
          );
          
          return {
            ...module,
            lessons: updatedLessons
          };
        }
        return module;
      });

      setCourse({
        ...course,
        modules: updatedModules
      });
    }

    setEditingLesson(null);
    setLessonData({
      title: '',
      description: '',
      type: 'video',
      content: {},
      duration: 0,
      isRequired: true
    });
    setShowLessonModal(false);
    toast.success('Lesson updated successfully');
  };

  const handleDeleteLesson = (lessonId: string, lessonTitle: string, moduleId: string) => {
    if (!confirm(`Are you sure you want to delete the lesson "${lessonTitle}"?`)) {
      return;
    }

    if (course) {
      const updatedModules = course.modules.map(module => {
        if (module.id === moduleId) {
          const updatedLessons = module.lessons.filter(lesson => lesson.id !== lessonId);
          return {
            ...module,
            lessons: updatedLessons
          };
        }
        return module;
      });

      setCourse({
        ...course,
        modules: updatedModules
      });
    }

    toast.success('Lesson deleted successfully');
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return PlayIcon;
      case 'text': return DocumentTextIcon;
      case 'pdf': return DocumentArrowDownIcon;
      case 'attachment': return PaperClipIcon;
      case 'quiz': return QuestionMarkCircleIcon;
      case 'reflection': return PencilSquareIcon;
      default: return DocumentTextIcon;
    }
  };

  const tabs = [
    { id: 'details', name: 'Course Details' },
    { id: 'content', name: 'Content & Modules' },
    { id: 'students', name: `Students${studentCount > 0 ? ` (${studentCount})` : ''}` },
    { id: 'settings', name: 'Settings' },
    { id: 'preview', name: 'Preview' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="space-y-6">
            <Input
              label="Course Title"
              value={courseData.title}
              onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter course title"
              required
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Course Description
              </label>
              <RichTextEditor
                value={courseData.description}
                onChange={(value) => setCourseData(prev => ({ ...prev, description: value }))}
                placeholder="Describe what students will learn in this course"
                minHeight="150px"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={courseData.tags.join(', ')}
                onChange={(e) => setCourseData(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                }))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="react, javascript, frontend"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Course Cover Image
              </label>
              <FileUploader
                accept="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
                maxFiles={1}
                legacyMode={false} // Use new UploadResult[] mode
                onUpload={async (uploadResults) => {
                  // Handle image upload
                  console.log('Cover image uploaded:', uploadResults[0]);
                  // TODO: Update course data with uploaded image URL
                  // The uploadResult contains the processed file information
                  // uploadResults[0].url contains the uploaded file URL
                }}
                dropzoneText="Upload a cover image for your course"
              />
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Course Modules
              </h3>
              <Button onClick={() => setShowModuleModal(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>

            {course?.modules.length ? (
              <div className="space-y-4">
                {course.modules.map((module, moduleIndex) => (
                  <Card key={module.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bars3Icon className="h-5 w-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              Module {moduleIndex + 1}: {module.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {module.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedModuleId(module.id);
                              setShowLessonModal(true);
                            }}
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Lesson
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditModule(module)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteModule(module.id, module.title)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>

                        </div>
                      </div>
                    </CardHeader>
                    {module.lessons.length > 0 && (
                      <CardContent>
                        <div className="space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => {
                            const Icon = getLessonIcon(lesson.type);
                            return (
                              <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <Icon className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {lessonIndex + 1}. {lesson.title}
                                    </p>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                      <span className="capitalize">{lesson.type}</span>
                                      {lesson.duration && (
                                        <>
                                          <span>•</span>
                                          <span>{lesson.duration} min</span>
                                        </>
                                      )}
                                      {lesson.isRequired && (
                                        <>
                                          <span>•</span>
                                          <span className="text-red-600">Required</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditLesson(lesson)}
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteLesson(lesson.id, lesson.title, lesson.moduleId)}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <PlusIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No modules yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start by adding your first module to organize your course content.
                </p>
                <Button onClick={() => setShowModuleModal(true)}>
                  Add First Module
                </Button>
              </div>
            )}
          </div>
        );

      case 'students':
        return (
          <div className="space-y-6">
            {isEditing && course ? (
              <>
                <StudentManagement 
                  courseId={course.id} 
                  onStudentCountChange={setStudentCount}
                />
                <AnnouncementForm courseId={course.id} />
              </>
            ) : (
              <div className="text-center py-12">
                <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Course Not Yet Created
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Save your course first to manage student enrollments.
                </p>
              </div>
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Course Status
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Control whether students can access this course
                  </p>
                </div>
                <select
                  value={courseData.status}
                  onChange={(e) => setCourseData(prev => ({ ...prev, status: e.target.value as 'draft' | 'live' }))}
                  className="px-3 py-2 border border-gray-3300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Track Progress
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monitor student progress through the course
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courseData.isTracked}
                    onChange={(e) => setCourseData(prev => ({ ...prev, isTracked: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Self-Paced Learning
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow students to progress at their own pace
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courseData.allowSelfPacing}
                    onChange={(e) => setCourseData(prev => ({ ...prev, allowSelfPacing: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Certificate on Completion
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Award a certificate when students complete the course
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courseData.requiresCertificate}
                    onChange={(e) => setCourseData(prev => ({ ...prev, requiresCertificate: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Graded Course
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Include assessments and grades for this course
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courseData.isGraded}
                    onChange={(e) => setCourseData(prev => ({ ...prev, isGraded: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Course Preview
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This is how your course will appear to students. Preview functionality would show the course player interface.
              </p>
            </div>
            <div className="flex justify-center">
              <Button variant="outline">
                <EyeIcon className="h-4 w-4 mr-2" />
                Open Full Preview
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isEditing ? 'Update your course content and settings' : 'Build an engaging learning experience'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/teacher/courses')}>
            Cancel
          </Button>
          <Button onClick={handleSaveCourse} loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Course'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <Card>
        <CardContent className="p-8">
          {renderTabContent()}
        </CardContent>
      </Card>

      {/* Add Module Modal */}
      <Modal
        isOpen={showModuleModal}
        onClose={() => {
          setShowModuleModal(false);
          setEditingModule(null);
          setModuleData({ title: '', description: '' });
        }}
        title={editingModule ? 'Edit Module' : 'Add New Module'}
      >
        <div className="space-y-4">
          <Input
            label="Module Title"
            value={moduleData.title}
            onChange={(e) => setModuleData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter module title"
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Module Description
            </label>
            <RichTextEditor
              value={moduleData.description}
              onChange={(value) => setModuleData(prev => ({ ...prev, description: value }))}
              placeholder="Describe what this module covers"
              minHeight="120px"
              showToolbar={false}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowModuleModal(false);
                setEditingModule(null);
                setModuleData({ title: '', description: '' });
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingModule ? handleUpdateModule : handleAddModule}>
              {editingModule ? 'Update Module' : 'Add Module'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal
        isOpen={showLessonModal}
        onClose={() => {
          setShowLessonModal(false);
          setEditingLesson(null);
          setLessonData({
            title: '',
            description: '',
            type: 'video',
            content: {},
            duration: 0,
            isRequired: true
          });
        }}
        title={editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Lesson Title"
            value={lessonData.title}
            onChange={(e) => setLessonData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter lesson title"
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lesson Description
            </label>
            <RichTextEditor
              value={lessonData.description}
              onChange={(value) => setLessonData(prev => ({ ...prev, description: value }))}
              placeholder="Brief description of the lesson"
              minHeight="100px"
              showToolbar={false}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lesson Type
              </label>
              <select
                value={lessonData.type}
                onChange={(e) => setLessonData(prev => ({ ...prev, type: e.target.value as any }))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="video">Video</option>
                <option value="text">Text Content</option>
                <option value="pdf">PDF Document</option>
                <option value="attachment">File Attachment</option>
                <option value="quiz">Knowledge Check</option>
                <option value="reflection">Reflection Exercise</option>
              </select>
            </div>

            <Input
              label="Duration (minutes)"
              type="number"
              value={lessonData.duration}
              onChange={(e) => setLessonData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
              placeholder="0"
            />
          </div>

          {/* Video-specific fields */}
          {lessonData.type === 'video' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Video Source
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                      lessonData.content?.type === 'upload' || !lessonData.content?.type
                        ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-200'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setLessonData(prev => ({
                      ...prev,
                      content: { ...prev.content, type: 'upload' }
                    }))}
                  >
                    Upload Video
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                      lessonData.content?.type === 'embed'
                        ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-200'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setLessonData(prev => ({
                      ...prev,
                      content: { ...prev.content, type: 'embed' }
                    }))}
                  >
                    Embed Video
                  </button>
                </div>
              </div>

              {lessonData.content?.type === 'upload' && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Video
                  </label>
                  <FileUploader
                    accept="video/*"
                    maxSize={100 * 1024 * 1024} // 100MB
                    maxFiles={1}
                    legacyMode={false}
                    onUpload={async (uploadResults) => {
                      const videoUrl = uploadResults[0].url;
                      setLessonData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          url: videoUrl,
                          filename: uploadResults[0].filename
                        }
                      }));
                    }}
                    dropzoneText="Upload a video file (MP4, MOV, AVI)"
                  />
                  {lessonData.content?.url && (
                    <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                      Video uploaded successfully: {lessonData.content.filename}
                    </div>
                  )}
                </div>
              )}

              {lessonData.content?.type === 'embed' && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Embed Video URL
                  </label>
                  <Input
                    type="text"
                    placeholder="https://www.youtube.com/embed/..."
                    value={lessonData.content?.embedUrl || ''}
                    onChange={(e) => setLessonData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        embedUrl: e.target.value
                      }
                    }))}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Supported platforms: YouTube, Vimeo, etc. Use the embed URL, not the watch URL.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={lessonData.isRequired}
              onChange={(e) => setLessonData(prev => ({ ...prev, isRequired: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 block text-sm text-gray-900 dark:text-white">
              This lesson is required for course completion
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowLessonModal(false);
                setEditingLesson(null);
                setLessonData({
                  title: '',
                  description: '',
                  type: 'video',
                  content: {},
                  duration: 0,
                  isRequired: true
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingLesson ? handleUpdateLesson : handleAddLesson}>
              {editingLesson ? 'Update Lesson' : 'Add Lesson'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
