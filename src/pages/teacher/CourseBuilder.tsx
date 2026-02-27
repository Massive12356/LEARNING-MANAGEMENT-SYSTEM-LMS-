// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
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
import { Course, Module, Lesson, QuizQuestion } from '../../types';
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
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function CourseBuilder() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [finalSaving, setFinalSaving] = useState(false);
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
    isGraded: false,
    coverImage: '' // Add this line to store the cover image URL
  });

  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null); // State for cover image preview

  const [moduleData, setModuleData] = useState({
    title: '',
    description: ''
  });

  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    type: 'video' as 'video' | 'text' | 'pdf' | 'attachment' | 'quiz' | 'reflection',
    content: {
      videoUrl: '',
      textContent: '',
      pdfUrl: '',
      attachmentUrl: '',
      quizData: {
        id: '',
        title: '',
        description: '',
        questions: [] as QuizQuestion[],
        isGraded: true,
        passingScore: 70
      },
      reflectionPrompt: ''
    } as any,
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
      // Set cover image preview if there's a cover image
      if (courseData.coverImage) {
        setCoverImagePreview(courseData.coverImage);
      }
    } catch (error) {
      console.error('Failed to load course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  // Load demo data for new courses
  useEffect(() => {
    if (!isEditing) {
      // Set demo course data
      setCourseData({
        title: 'Web Development Fundamentals - Editable Template',
        description: '<p>This is a pre-created course template that you can customize for your students. It includes modules on HTML, CSS, and JavaScript fundamentals.</p><p><strong>How to use this template:</strong></p><ul><li>Edit the course title and description to match your needs</li><li>Modify the content of existing lessons</li><li>Add new lessons or modules</li><li>Change the order of modules and lessons</li><li>Upload your own videos and resources</li></ul>',
        tags: ['html', 'css', 'javascript', 'web development', 'beginner'],
        status: 'draft',
        isTracked: true,
        allowSelfPacing: true,
        requiresCertificate: true,
        isGraded: true
      });
      // Set cover image preview for demo course
      setCoverImagePreview('https://picsum.photos/800/450?random=4');

      // Set demo modules and lessons if it's a new course
      const demoCourse: Course = {
        id: 'demo-course',
        title: 'Web Development Fundamentals - Editable Template',
        description: '<p>This is a pre-created course template that you can customize for your students. It includes modules on HTML, CSS, and JavaScript fundamentals.</p>',
        coverImage: 'https://picsum.photos/800/450?random=4',
        tags: ['html', 'css', 'javascript', 'web development', 'beginner'],
        status: 'draft',
        isTracked: true,
        allowSelfPacing: true,
        requiresCertificate: true,
        isGraded: true,
        organizationId: '',
        teacherId: '',
        modules: [
          {
            id: 'module-1-template',
            title: 'HTML Basics',
            description: 'Learn the fundamentals of HTML markup',
            order: 0,
            courseId: 'demo-course',
            lessons: [
              {
                id: 'lesson-1-template',
                title: 'Introduction to HTML',
                description: 'Understanding the structure of web pages',
                type: 'video',
                content: {
                  videoUrl: 'https://www.youtube.com/watch?v=Ihy0QziLDf0',
                  duration: 15
                },
                order: 0,
                moduleId: 'module-1-template',
                duration: 15,
                isRequired: true
              },
              {
                id: 'lesson-2-template',
                title: 'HTML Text Elements',
                description: 'Working with headings, paragraphs, and text formatting',
                type: 'text',
                content: {
                  textContent: '<h3>HTML Text Elements</h3><p>In this lesson, we\'ll explore the various text elements available in HTML.</p><h4>Headings</h4><p>HTML provides six levels of headings, from <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code>.</p><h4>Paragraphs</h4><p>Paragraphs are defined with the <code>&lt;p&gt;</code> tag.</p>'
                },
                order: 1,
                moduleId: 'module-1-template',
                duration: 10,
                isRequired: true
              }
            ]
          },
          {
            id: 'module-2-template',
            title: 'CSS Styling',
            description: 'Style your web pages with CSS',
            order: 1,
            courseId: 'demo-course',
            lessons: [
              {
                id: 'lesson-3-template',
                title: 'CSS Basics',
                description: 'Introduction to Cascading Style Sheets',
                type: 'video',
                content: {
                  videoUrl: 'https://www.youtube.com/watch?v=1PnVor36_40',
                  duration: 20
                },
                order: 0,
                moduleId: 'module-2-template',
                duration: 20,
                isRequired: true
              },
              {
                id: 'lesson-4-template',
                title: 'Layout Techniques',
                description: 'Modern CSS layout with Flexbox and Grid',
                type: 'pdf',
                content: {
                  pdfUrl: 'https://css-tricks.com/wp-content/uploads/2018/03/CSS-Tricks-CSS-Layout-Landscapes.pdf'
                },
                order: 1,
                moduleId: 'module-2-template',
                duration: 25,
                isRequired: true
              }
            ]
          },
          {
            id: 'module-3-template',
            title: 'JavaScript Fundamentals',
            description: 'Add interactivity to your websites',
            order: 2,
            courseId: 'demo-course',
            lessons: [
              {
                id: 'lesson-5-template',
                title: 'JavaScript Variables and Data Types',
                description: 'Learn about variables and data types in JavaScript',
                type: 'video',
                content: {
                  videoUrl: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
                  duration: 18
                },
                order: 0,
                moduleId: 'module-3-template',
                duration: 18,
                isRequired: true
              },
              {
                id: 'lesson-6-template',
                title: 'DOM Manipulation',
                description: 'Interacting with HTML elements using JavaScript',
                type: 'text',
                content: {
                  textContent: '<h3>DOM Manipulation</h3><p>The Document Object Model (DOM) is a programming interface for web documents.</p><p>It represents the page so that programs can change the document structure, style, and content.</p>'
                },
                order: 1,
                moduleId: 'module-3-template',
                duration: 15,
                isRequired: true
              }
            ]
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setCourse(demoCourse);
    }
  }, [isEditing]);


  const handleFinalSave = async () => {
    if (!courseData.title.trim()) {
      toast.error('Course title is required');
      return;
    }

    setFinalSaving(true);
    try {
      // For new courses, create the course first
      let courseIdToUse = course?.id;

      if (!isEditing || !course) {
        // Create new course
        const newCourse = await mockApi.createCourse({
          ...courseData,
          teacherId: user!.id,
          modules: course?.modules || []
        });
        courseIdToUse = newCourse.id;
        setCourse(newCourse);
        navigate(`/teacher/courses/${newCourse.id}/edit`);
      } else {
        // Update existing course with all data
        const updatedCourse = await mockApi.updateCourse(course.id, {
          ...courseData,
          modules: course.modules
        });
        setCourse(updatedCourse);
      }

      toast.success(isEditing ? 'Course updated successfully!' : 'Course created successfully!');

      // Optionally redirect to course list
      // navigate('/teacher/courses');
    } catch (error) {
      console.error('Failed to save course:', error);
      toast.error('Failed to save course. Please try again.');
    } finally {
      setFinalSaving(false);
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

  const validateQuizData = (quizData: any) => {
    if (!quizData.title.trim()) {
      toast.error('Quiz title is required');
      return false;
    }

    if (quizData.questions.length === 0) {
      toast.error('At least one question is required');
      return false;
    }

    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i];
      if (!question.question.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return false;
      }

      if (question.type === 'multiple-choice') {
        if (!question.options || question.options.length < 2) {
          toast.error(`Question ${i + 1} must have at least 2 options`);
          return false;
        }

        if (!question.options.some(option => option.trim() !== '')) {
          toast.error(`Question ${i + 1} must have at least one non-empty option`);
          return false;
        }

        if (!question.correctAnswer || typeof question.correctAnswer !== 'string' || !question.correctAnswer.trim()) {
          toast.error(`Question ${i + 1} must have a correct answer selected`);
          return false;
        }

        if (!question.options.includes(question.correctAnswer)) {
          toast.error(`Question ${i + 1} correct answer must match one of the options`);
          return false;
        }
      } else if (question.type === 'short-text') {
        if (!question.correctAnswer || (Array.isArray(question.correctAnswer) && question.correctAnswer.length === 0)) {
          toast.error(`Question ${i + 1} must have at least one correct answer`);
          return false;
        }
      }
    }

    return true;
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

    // Validate quiz data if it's a quiz lesson
    if (lessonData.type === 'quiz') {
      if (!validateQuizData(lessonData.content.quizData)) {
        return;
      }
    }

    // Create lesson based on type
    let lessonContent = {};
    switch (lessonData.type) {
      case 'video':
        lessonContent = {
          videoUrl: lessonData.content.videoUrl,
          duration: lessonData.duration
        };
        break;
      case 'text':
        lessonContent = {
          textContent: lessonData.content.textContent
        };
        break;
      case 'pdf':
        lessonContent = {
          pdfUrl: lessonData.content.pdfUrl
        };
        break;
      case 'attachment':
        lessonContent = {
          attachmentUrl: lessonData.content.attachmentUrl
        };
        break;
      case 'quiz':
        lessonContent = {
          quizData: lessonData.content.quizData
        };
        break;
      case 'reflection':
        lessonContent = {
          reflectionPrompt: lessonData.content.reflectionPrompt
        };
        break;
    }

    // Mock lesson creation
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: lessonData.title,
      description: lessonData.description,
      type: lessonData.type,
      content: lessonContent,
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
      content: {
        videoUrl: '',
        textContent: '',
        pdfUrl: '',
        attachmentUrl: '',
        quizData: {
          id: '',
          title: '',
          description: '',
          questions: [] as QuizQuestion[],
          isGraded: true,
          passingScore: 70
        },
        reflectionPrompt: ''
      },
      duration: 0,
      isRequired: true
    });
    setShowLessonModal(false);
    toast.success('Lesson added successfully');
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);

    // Initialize content based on lesson type
    let content = {
      videoUrl: '',
      textContent: '',
      pdfUrl: '',
      attachmentUrl: '',
      quizData: {
        id: '',
        title: '',
        description: '',
        questions: [] as QuizQuestion[],
        isGraded: true,
        passingScore: 70
      },
      reflectionPrompt: ''
    };

    switch (lesson.type) {
      case 'video':
        content.videoUrl = lesson.content?.videoUrl || '';
        break;
      case 'text':
        content.textContent = lesson.content?.textContent || '';
        break;
      case 'pdf':
        content.pdfUrl = lesson.content?.pdfUrl || '';
        break;
      case 'attachment':
        content.attachmentUrl = lesson.content?.attachmentUrl || '';
        break;
      case 'quiz':
        content.quizData = lesson.content?.quizData || {
          id: '',
          title: '',
          description: '',
          questions: [],
          isGraded: true,
          passingScore: 70
        };
        break;
      case 'reflection':
        content.reflectionPrompt = lesson.content?.reflectionPrompt || '';
        break;
    }

    setLessonData({
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      content: content,
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

    // Validate quiz data if it's a quiz lesson
    if (lessonData.type === 'quiz') {
      if (!validateQuizData(lessonData.content.quizData)) {
        return;
      }
    }

    // Create lesson based on type
    let lessonContent = {};
    switch (lessonData.type) {
      case 'video':
        lessonContent = {
          videoUrl: lessonData.content.videoUrl,
          duration: lessonData.duration
        };
        break;
      case 'text':
        lessonContent = {
          textContent: lessonData.content.textContent
        };
        break;
      case 'pdf':
        lessonContent = {
          pdfUrl: lessonData.content.pdfUrl
        };
        break;
      case 'attachment':
        lessonContent = {
          attachmentUrl: lessonData.content.attachmentUrl
        };
        break;
      case 'quiz':
        lessonContent = {
          quizData: lessonData.content.quizData
        };
        break;
      case 'reflection':
        lessonContent = {
          reflectionPrompt: lessonData.content.reflectionPrompt
        };
        break;
    }

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
                content: lessonContent,
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
      content: {
        videoUrl: '',
        textContent: '',
        pdfUrl: '',
        attachmentUrl: '',
        quizData: {
          id: '',
          title: '',
          description: '',
          questions: [] as QuizQuestion[],
          isGraded: true,
          passingScore: 70
        },
        reflectionPrompt: ''
      },
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
    { id: 'settings', name: 'Settings' },
    { id: 'preview', name: 'Preview & Publish' }
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
              {coverImagePreview && (
                <div className="mb-4">
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}
              <FileUploader
                accept="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
                maxFiles={1}
                legacyMode={false}
                onUpload={async (uploadResults) => {
                  // Handle image upload
                  console.log('Cover image uploaded:', uploadResults[0]);
                  // Update course data with uploaded image URL
                  if (uploadResults[0]) {
                    setCourseData(prev => ({ ...prev, coverImage: uploadResults[0].url }));
                    setCoverImagePreview(uploadResults[0].url); // Set preview
                  }
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
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Course Preview
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Review all course details before publishing
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Course Details */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Course Details</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Title</p>
                        <p className="font-medium text-gray-900 dark:text-white">{courseData.title || 'Untitled Course'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${courseData.status === 'live' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {courseData.status === 'live' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                        <div className="font-medium text-gray-900 dark:text-white prose max-w-none" dangerouslySetInnerHTML={{ __html: courseData.description || 'No description provided' }} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tags</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {courseData.tags.length > 0 ? (
                            courseData.tags.map((tag, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">No tags</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Content */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Course Content</h4>
                  {course?.modules && course.modules.length > 0 ? (
                    <div className="space-y-4">
                      {course.modules.map((module, moduleIndex) => (
                        <div key={module.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              Module {moduleIndex + 1}: {module.title}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {module.description || 'No description'}
                            </p>
                          </div>
                          <div className="p-4">
                            {module.lessons && module.lessons.length > 0 ? (
                              <div className="space-y-3">
                                {module.lessons.map((lesson, lessonIndex) => {
                                  const Icon = getLessonIcon(lesson.type);
                                  return (
                                    <div key={lesson.id} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                      <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                          {lessonIndex + 1}. {lesson.title}
                                        </p>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                                        {lesson.description && (
                                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                                            {lesson.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm italic">No lessons in this module</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                      <p className="text-gray-500">No modules created yet</p>
                    </div>
                  )}
                </div>

                {/* Course Settings */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Course Settings</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Track Progress</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Monitor student progress</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${courseData.isTracked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {courseData.isTracked ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Self-Paced Learning</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Students progress at their own pace</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${courseData.allowSelfPacing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {courseData.allowSelfPacing ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Certificate on Completion</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Award certificate upon completion</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${courseData.requiresCertificate ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {courseData.requiresCertificate ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Graded Course</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Include assessments and grades</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${courseData.isGraded ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {courseData.isGraded ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab('details')}
              >
                Back to Editing
              </Button>
              <Button
                onClick={handleFinalSave}
                loading={finalSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Course' : 'Create Course'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderLessonForm = () => {
    return (
      <div className="space-y-6">
        <Input
          label="Lesson Title"
          value={lessonData.title}
          onChange={(e) => setLessonData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter lesson title"
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Lesson Description
          </label>
          <textarea
            value={lessonData.description}
            onChange={(e) => setLessonData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Briefly describe what students will learn in this lesson"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Lesson Type
          </label>
          <select
            value={lessonData.type}
            onChange={(e) => setLessonData(prev => ({
              ...prev,
              type: e.target.value as any,
              content: {
                videoUrl: '',
                textContent: '',
                pdfUrl: '',
                attachmentUrl: '',
                quizData: {
                  id: '',
                  title: '',
                  description: '',
                  questions: [] as QuizQuestion[],
                  isGraded: true,
                  passingScore: 70
                },
                reflectionPrompt: ''
              }
            }))}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="video">Video</option>
            <option value="text">Text Content</option>
            <option value="pdf">PDF Document</option>
            <option value="attachment">File Attachment</option>
            <option value="quiz">Quiz</option>
            <option value="reflection">Reflection</option>
          </select>
        </div>

        {lessonData.type === 'video' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Video URL
              </label>
              <input
                type="text"
                value={lessonData.content.videoUrl || ''}
                onChange={(e) => setLessonData(prev => ({
                  ...prev,
                  content: {
                    ...prev.content,
                    videoUrl: e.target.value
                  }
                }))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supports YouTube, Vimeo, or direct video links
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Video Duration (minutes)
              </label>
              <input
                type="number"
                value={lessonData.duration || ''}
                onChange={(e) => setLessonData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                min="0"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Estimated time to complete"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Or Upload Video
              </label>
              <FileUploader
                accept="video/*"
                maxSize={100 * 1024 * 1024} // 100MB
                maxFiles={1}
                legacyMode={false}
                onUpload={async (uploadResults) => {
                  // Handle video upload
                  console.log('Video uploaded:', uploadResults[0]);
                  setLessonData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      videoUrl: uploadResults[0]?.url || ''
                    }
                  }));
                }}
                dropzoneText="Upload a video file (MP4, MOV, AVI)"
              />
            </div>
          </div>
        )}

        {lessonData.type === 'text' && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Text Content
            </label>
            <RichTextEditor
              value={lessonData.content.textContent || ''}
              onChange={(value) => setLessonData(prev => ({
                ...prev,
                content: {
                  ...prev.content,
                  textContent: value
                }
              }))}
              placeholder="Write your lesson content here..."
              minHeight="200px"
            />
          </div>
        )}

        {lessonData.type === 'pdf' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                PDF URL
              </label>
              <input
                type="text"
                value={lessonData.content.pdfUrl || ''}
                onChange={(e) => setLessonData(prev => ({
                  ...prev,
                  content: {
                    ...prev.content,
                    pdfUrl: e.target.value
                  }
                }))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/document.pdf"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Or Upload PDF
              </label>
              <FileUploader
                accept=".pdf"
                maxSize={50 * 1024 * 1024} // 50MB
                maxFiles={1}
                legacyMode={false}
                onUpload={async (uploadResults) => {
                  // Handle PDF upload
                  console.log('PDF uploaded:', uploadResults[0]);
                  setLessonData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      pdfUrl: uploadResults[0]?.url || ''
                    }
                  }));
                }}
                dropzoneText="Upload a PDF document"
              />
            </div>
          </div>
        )}

        {lessonData.type === 'attachment' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Attachment URL
              </label>
              <input
                type="text"
                value={lessonData.content.attachmentUrl || ''}
                onChange={(e) => setLessonData(prev => ({
                  ...prev,
                  content: {
                    ...prev.content,
                    attachmentUrl: e.target.value
                  }
                }))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/resource.zip"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Or Upload File
              </label>
              <FileUploader
                accept="*"
                maxSize={100 * 1024 * 1024} // 100MB
                maxFiles={1}
                legacyMode={false}
                onUpload={async (uploadResults) => {
                  // Handle file upload
                  console.log('File uploaded:', uploadResults[0]);
                  setLessonData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      attachmentUrl: uploadResults[0]?.url || ''
                    }
                  }));
                }}
                dropzoneText="Upload any file type"
              />
            </div>
          </div>
        )}

        {lessonData.type === 'quiz' && (
          <div className="space-y-6">
            {/* Quiz Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Quiz Title"
                value={lessonData.content.quizData.title}
                onChange={(e) => setLessonData(prev => ({
                  ...prev,
                  content: {
                    ...prev.content,
                    quizData: {
                      ...prev.content.quizData,
                      title: e.target.value
                    }
                  }
                }))}
                placeholder="Enter quiz title"
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={lessonData.content.quizData.passingScore}
                  onChange={(e) => setLessonData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      quizData: {
                        ...prev.content.quizData,
                        passingScore: parseInt(e.target.value) || 70
                      }
                    }
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Quiz Description
              </label>
              <textarea
                value={lessonData.content.quizData.description}
                onChange={(e) => setLessonData(prev => ({
                  ...prev,
                  content: {
                    ...prev.content,
                    quizData: {
                      ...prev.content.quizData,
                      description: e.target.value
                    }
                  }
                }))}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what this quiz covers..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={lessonData.content.quizData.isGraded}
                  onChange={(e) => setLessonData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      quizData: {
                        ...prev.content.quizData,
                        isGraded: e.target.checked
                      }
                    }
                  }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  This quiz is graded
                </span>
              </label>
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Questions
                </h3>
                <Button
                  onClick={() => {
                    const newQuestion: QuizQuestion = {
                      id: `question-${Date.now()}`,
                      question: '',
                      type: 'multiple-choice',
                      options: ['', ''],
                      correctAnswer: '',
                      explanation: ''
                    };
                    setLessonData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        quizData: {
                          ...prev.content.quizData,
                          questions: [...prev.content.quizData.questions, newQuestion]
                        }
                      }
                    }));
                  }}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {lessonData.content.quizData.questions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <QuestionMarkCircleIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No questions yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Add your first question to get started.
                  </p>
                  <Button
                    onClick={() => {
                      const newQuestion: QuizQuestion = {
                        id: `question-${Date.now()}`,
                        question: '',
                        type: 'multiple-choice',
                        options: ['', ''],
                        correctAnswer: '',
                        explanation: ''
                      };
                      setLessonData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          quizData: {
                            ...prev.content.quizData,
                            questions: [...prev.content.quizData.questions, newQuestion]
                          }
                        }
                      }));
                    }}
                  >
                    Add First Question
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {lessonData.content.quizData.questions.map((question, index) => (
                    <Card key={question.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Question {index + 1}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                if (index > 0) {
                                  const newQuestions = [...lessonData.content.quizData.questions];
                                  [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
                                  setLessonData(prev => ({
                                    ...prev,
                                    content: {
                                      ...prev.content,
                                      quizData: {
                                        ...prev.content.quizData,
                                        questions: newQuestions
                                      }
                                    }
                                  }));
                                }
                              }}
                              disabled={index === 0}
                              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                if (index < lessonData.content.quizData.questions.length - 1) {
                                  const newQuestions = [...lessonData.content.quizData.questions];
                                  [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
                                  setLessonData(prev => ({
                                    ...prev,
                                    content: {
                                      ...prev.content,
                                      quizData: {
                                        ...prev.content.quizData,
                                        questions: newQuestions
                                      }
                                    }
                                  }));
                                }
                              }}
                              disabled={index === lessonData.content.quizData.questions.length - 1}
                              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                const newQuestions = lessonData.content.quizData.questions.filter(q => q.id !== question.id);
                                setLessonData(prev => ({
                                  ...prev,
                                  content: {
                                    ...prev.content,
                                    quizData: {
                                      ...prev.content.quizData,
                                      questions: newQuestions
                                    }
                                  }
                                }));
                              }}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Question Text */}
                          <Input
                            label="Question"
                            value={question.question}
                            onChange={(e) => {
                              const newQuestions = [...lessonData.content.quizData.questions];
                              newQuestions[index] = {
                                ...newQuestions[index],
                                question: e.target.value
                              };
                              setLessonData(prev => ({
                                ...prev,
                                content: {
                                  ...prev.content,
                                  quizData: {
                                    ...prev.content.quizData,
                                    questions: newQuestions
                                  }
                                }
                              }));
                            }}
                            placeholder="Enter your question"
                          />

                          {/* Question Type */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Question Type
                              </label>
                              <select
                                value={question.type}
                                onChange={(e) => {
                                  const newQuestions = [...lessonData.content.quizData.questions];
                                  const updatedQuestion = {
                                    ...newQuestions[index],
                                    type: e.target.value as 'multiple-choice' | 'short-text',
                                    correctAnswer: e.target.value === 'multiple-choice' ? '' : []
                                  };

                                  // Reset options if switching to short-text
                                  if (e.target.value === 'short-text') {
                                    delete updatedQuestion.options;
                                  } else {
                                    updatedQuestion.options = ['', ''];
                                  }

                                  newQuestions[index] = updatedQuestion;
                                  setLessonData(prev => ({
                                    ...prev,
                                    content: {
                                      ...prev.content,
                                      quizData: {
                                        ...prev.content.quizData,
                                        questions: newQuestions
                                      }
                                    }
                                  }));
                                }}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="multiple-choice">Multiple Choice</option>
                                <option value="short-text">Short Text Answer</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Points
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={question.points || 1}
                                onChange={(e) => {
                                  const newQuestions = [...lessonData.content.quizData.questions];
                                  newQuestions[index] = {
                                    ...newQuestions[index],
                                    points: parseInt(e.target.value) || 1
                                  };
                                  setLessonData(prev => ({
                                    ...prev,
                                    content: {
                                      ...prev.content,
                                      quizData: {
                                        ...prev.content.quizData,
                                        questions: newQuestions
                                      }
                                    }
                                  }));
                                }}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>

                          {/* Options for Multiple Choice */}
                          {question.type === 'multiple-choice' && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Options
                                </label>
                                <button
                                  onClick={() => {
                                    const newQuestions = [...lessonData.content.quizData.questions];
                                    newQuestions[index] = {
                                      ...newQuestions[index],
                                      options: [...(newQuestions[index].options || []), '']
                                    };
                                    setLessonData(prev => ({
                                      ...prev,
                                      content: {
                                        ...prev.content,
                                        quizData: {
                                          ...prev.content.quizData,
                                          questions: newQuestions
                                        }
                                      }
                                    }));
                                  }}
                                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                  <PlusIcon className="h-4 w-4 mr-1" />
                                  Add Option
                                </button>
                              </div>

                              {(question.options || []).map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`correct-answer-${question.id}`}
                                    checked={question.correctAnswer === option}
                                    onChange={() => {
                                      const newQuestions = [...lessonData.content.quizData.questions];
                                      newQuestions[index] = {
                                        ...newQuestions[index],
                                        correctAnswer: option
                                      };
                                      setLessonData(prev => ({
                                        ...prev,
                                        content: {
                                          ...prev.content,
                                          quizData: {
                                            ...prev.content.quizData,
                                            questions: newQuestions
                                          }
                                        }
                                      }));
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...(question.options || [])];
                                      newOptions[optionIndex] = e.target.value;

                                      const newQuestions = [...lessonData.content.quizData.questions];
                                      newQuestions[index] = {
                                        ...newQuestions[index],
                                        options: newOptions
                                      };

                                      // Update correct answer if it was this option
                                      if (question.correctAnswer === option) {
                                        newQuestions[index] = {
                                          ...newQuestions[index],
                                          correctAnswer: e.target.value
                                        };
                                      }

                                      setLessonData(prev => ({
                                        ...prev,
                                        content: {
                                          ...prev.content,
                                          quizData: {
                                            ...prev.content.quizData,
                                            questions: newQuestions
                                          }
                                        }
                                      }));
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  <button
                                    onClick={() => {
                                      if ((question.options?.length || 0) > 2) {
                                        const newOptions = (question.options || []).filter((_, i) => i !== optionIndex);
                                        const newQuestions = [...lessonData.content.quizData.questions];
                                        newQuestions[index] = {
                                          ...newQuestions[index],
                                          options: newOptions
                                        };

                                        // Update correct answer if it was this option
                                        if (question.correctAnswer === option) {
                                          newQuestions[index] = {
                                            ...newQuestions[index],
                                            correctAnswer: newOptions[0] || ''
                                          };
                                        }

                                        setLessonData(prev => ({
                                          ...prev,
                                          content: {
                                            ...prev.content,
                                            quizData: {
                                              ...prev.content.quizData,
                                              questions: newQuestions
                                            }
                                          }
                                        }));
                                      }
                                    }}
                                    disabled={(question.options?.length || 0) <= 2}
                                    className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Correct Answers for Short Text */}
                          {question.type === 'short-text' && (
                            <div className="space-y-1">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Correct Answers (one per line)
                              </label>
                              <textarea
                                value={Array.isArray(question.correctAnswer) ? question.correctAnswer.join('\n') : ''}
                                onChange={(e) => {
                                  const answers = e.target.value.split('\n').filter(a => a.trim() !== '');
                                  const newQuestions = [...lessonData.content.quizData.questions];
                                  newQuestions[index] = {
                                    ...newQuestions[index],
                                    correctAnswer: answers
                                  };
                                  setLessonData(prev => ({
                                    ...prev,
                                    content: {
                                      ...prev.content,
                                      quizData: {
                                        ...prev.content.quizData,
                                        questions: newQuestions
                                      }
                                    }
                                  }));
                                }}
                                rows={3}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter correct answers, one per line"
                              />
                            </div>
                          )}

                          {/* Explanation */}
                          <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Explanation (optional)
                            </label>
                            <textarea
                              value={question.explanation || ''}
                              onChange={(e) => {
                                const newQuestions = [...lessonData.content.quizData.questions];
                                newQuestions[index] = {
                                  ...newQuestions[index],
                                  explanation: e.target.value
                                };
                                setLessonData(prev => ({
                                  ...prev,
                                  content: {
                                    ...prev.content,
                                    quizData: {
                                      ...prev.content.quizData,
                                      questions: newQuestions
                                    }
                                  }
                                }));
                              }}
                              rows={2}
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Explain why this is the correct answer..."
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {lessonData.type === 'reflection' && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reflection Prompt
            </label>
            <textarea
              value={lessonData.content.reflectionPrompt || ''}
              onChange={(e) => setLessonData(prev => ({
                ...prev,
                content: {
                  ...prev.content,
                  reflectionPrompt: e.target.value
                }
              }))}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ask students to reflect on what they've learned..."
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={lessonData.isRequired}
              onChange={(e) => setLessonData(prev => ({ ...prev, isRequired: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              This lesson is required
            </span>
          </label>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowLessonModal(false);
                setEditingLesson(null);
                setLessonData({
                  title: '',
                  description: '',
                  type: 'video',
                  content: {
                    videoUrl: '',
                    textContent: '',
                    pdfUrl: '',
                    attachmentUrl: '',
                    quizData: {
                      id: '',
                      title: '',
                      description: '',
                      questions: [] as QuizQuestion[],
                      isGraded: true,
                      passingScore: 70
                    },
                    reflectionPrompt: ''
                  },
                  duration: 0,
                  isRequired: true
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingLesson ? handleUpdateLesson : handleAddLesson}
            >
              {editingLesson ? 'Update Lesson' : 'Add Lesson'}
            </Button>
          </div>
        </div>
      </div>
    );
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
          <Button
            onClick={() => handleFinalSave()}
            loading={finalSaving}
            className="px-6"
          >
            {finalSaving ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Course')}
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
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
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
      {showLessonModal && (
        <Modal
          isOpen={showLessonModal}
          onClose={() => {
            setShowLessonModal(false);
            setEditingLesson(null);
            setLessonData({
              title: '',
              description: '',
              type: 'video',
              content: {
                videoUrl: '',
                textContent: '',
                pdfUrl: '',
                attachmentUrl: '',
                quizData: {
                  id: '',
                  title: '',
                  description: '',
                  questions: [] as QuizQuestion[],
                  isGraded: true,
                  passingScore: 70
                },
                reflectionPrompt: ''
              },
              duration: 0,
              isRequired: true
            });
          }}
          title={editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
          size="lg"
        >
          {renderLessonForm()}
        </Modal>
      )}

    </div>
  );
}
