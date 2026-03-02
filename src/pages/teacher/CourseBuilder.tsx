// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { createSmartSanitizedChangeHandler, sanitizeHTML, createSanitizedEditorChangeHandler } from '../../utils/sanitization';

import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { FileUploader } from '../../components/ui/FileUploader';
import { StudentManagement } from '../../components/teacher/StudentManagement';
import { AnnouncementForm } from '../../components/teacher/AnnouncementForm';
import { mockApi } from '../../services/mockApi';
import { UploadResult } from '../../services/fileUploadService';
import {
  Course,
  Module,
  Lesson,
  QuizQuestion,
  CourseStatus,
  courseSettings,
  createCoursePayload,
} from '../../types';
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
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { courseService } from '../../services/courseService';
import { clear } from 'console';

// Helper function to manage localStorage for course builder state
const COURSE_BUILDER_STORAGE_KEY = 'courseBuilderState';

const saveCourseBuilderState = state => {
  try {
    // Don't save file objects as they can't be serialized
    const stateToSave = {
      ...state,
      courseDetails: {
        ...state.courseDetails,
        images: null, // File objects cannot be serialized
      },
    };
    sessionStorage.setItem(COURSE_BUILDER_STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Failed to save course builder state:', error);
  }
};

const loadCourseBuilderState = () => {
  try {
    const savedState = sessionStorage.getItem(COURSE_BUILDER_STORAGE_KEY);
    console.log('Loaded course builder state:', JSON.parse(savedState));
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error('Failed to load course builder state:', error);
    return null;
  }
};

const clearCourseBuilderState = () => {
  try {
    sessionStorage.removeItem(COURSE_BUILDER_STORAGE_KEY);
    sessionStorage.removeItem('settingID');
    sessionStorage.removeItem('currentCourseId');
  } catch (error) {
    console.error('Failed to clear course builder state:', error);
  }
};

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

  // Delete confirmation states
  const [showDeleteModuleModal, setShowDeleteModuleModal] = useState(false);
  const [showDeleteLessonModal, setShowDeleteLessonModal] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');

  // Function to check if form is empty
  const isFormEmpty = () => {
    // Check course details
    const isCourseDetailsEmpty = !courseDetails.courseTitle.trim() &&
      !courseDetails.description.trim() &&
      (!courseDetails.images || courseDetails.images === null) &&
      (!courseDetails.tags || courseDetails.tags.length === 0);

    // Check if modules exist
    const hasModules = selectModule && selectModule.length > 0;

    // Check if any settings have been changed from defaults
    const isSettingsEmpty = courseData.courseStatus === 'draft' &&
      courseData.trackingProgress === true &&
      courseData.selfPacedLearning === true &&
      courseData.certificateOnCompletion === false &&
      courseData.gradedCourse === false;

    return isCourseDetailsEmpty && !hasModules && isSettingsEmpty;
  };
  const [studentCount, setStudentCount] = useState(0);
  const [selectCourseId, setSelectCourseId] = useState<string>(initialState.selectCourseId || ''); // holds course id after creation
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isSavingModule, setIsSavingModule] = useState(false);
  const [isGettingModule, setIsGettingModule] = useState(false);
  const [selectModule, setSelectModule] = useState<any[]>([]);
  const [selectedModuleNumber, setSelectedModuleNumber] = useState<number | null>(null);
  const [isSavingSetting, setIsSavingSetting] = useState(false);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [courseSettingId, setCourseSettingId] = useState<number | null>(initialState.courseSettingId || null);

  // Cache for storing created/updated lesson data for editing
  const [lessonCache, setLessonCache] = useState<Record<string, Lesson>>({});

  // Cache for storing quiz questions specifically
  const [quizQuestionsCache, setQuizQuestionsCache] = useState<Record<string, QuizQuestion[]>>({});

  // Cache for storing the raw quiz questions JSON that was sent to backend
  const [rawQuizQuestionsCache, setRawQuizQuestionsCache] = useState<Record<string, string>>({});

  // Function to cache lesson data
  const cacheLessonData = (lesson: Lesson) => {
    setLessonCache(prev => ({
      ...prev,
      [lesson.id]: lesson
    }));
    console.log('Cached lesson data for ID:', lesson.id, lesson);
  };

  // Function to cache quiz questions separately
  const cacheQuizQuestions = (lessonId: string, questions: QuizQuestion[]) => {
    setQuizQuestionsCache(prev => ({
      ...prev,
      [lessonId]: questions
    }));
    console.log('Cached quiz questions for lesson ID:', lessonId, questions);
  };

  // Function to cache raw quiz questions JSON
  const cacheRawQuizQuestions = (lessonId: string, questionsJson: string) => {
    setRawQuizQuestionsCache(prev => ({
      ...prev,
      [lessonId]: questionsJson
    }));
    console.log('Cached raw quiz questions for lesson ID:', lessonId, questionsJson);
  };
  const [courseModules, setCourseModules] = useState([]);
  const [moduleIds, setModuleIds] = useState([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);

  // Load initial state from localStorage or use defaults
  const getInitialState = () => {
    const savedState = loadCourseBuilderState();
    if (savedState && !courseId) {
      // Restore state only for new courses, not when editing existing ones
      return {
        courseData: savedState.courseData || {
          title: '',
          description: '',
          tags: [],
          courseStatus: 'draft',
          trackingProgress: true,
          selfPacedLearning: true,
          certificateOnCompletion: false,
          gradedCourse: false,
          coverImage: '',
        },
        courseDetails: savedState.courseDetails || {
          courseTitle: '',
          description: '',
          images: null,
          tags: [],
          courseStatus: 'draft',
        },
        moduleData: savedState.moduleData || [],
        lessonData: savedState.lessonData || {
          lessonNumber: '',
          title: '',
          lessonDescription: '',
          type: 'video',
          content: {
            videoUrl: '',
            textContent: '',
            pdfUrl: '',
            pdfUpload: null,
            attachmentUrl: '',
            quizData: {
              id: '',
              title: '',
              description: '',
              questions: [],
              gradedCourse: true,
              quizPassingScore: 70,
              duration: null,
              maxAttempts: 1,
            },
            reflectionPrompt: '',
          },
          duration: 0,
          isRequired: true,
          imageFile: null,
        },
      };
    }

    // Default state for new courses or when no saved state
    return {
      courseData: {
        title: '',
        description: '',
        tags: [] as string[],
        courseStatus: 'draft' as CourseStatus,
        trackingProgress: true,
        selfPacedLearning: true,
        certificateOnCompletion: false,
        gradedCourse: false,
        coverImage: '', // Add this line to store the cover image URL
      },
      courseDetails: {
        courseTitle: '',
        description: '',
        images: null as File | null,
        tags: [] as string[],
      },
      moduleData: [],
      lessonData: {
        lessonNumber: '',
        title: '',
        LessonDescription: '',
        type: 'video' as 'video' | 'textContent' | 'pdf' | 'attachment' | 'quiz' | 'reflection',
        content: {
          videoUrl: '',
          textContent: '',
          pdfUrl: '',
          pdfUpload: null,
          attachmentUrl: '',
          quizData: {
            id: '',
            title: '',
            description: '',
            questions: [] as QuizQuestion[],
            gradedCourse: true,
            quizPassingScore: 70,
            duration: null,
            maxAttempts: 1,
          },
          reflectionPrompt: '',
        } as any,
        duration: 0,
        isRequired: true,
        imageFile: null,
      },
      selectCourseId: sessionStorage.getItem('currentCourseId') || '',
      courseSettingId: sessionStorage.getItem('settingID') ? Number(sessionStorage.getItem('settingID')) : null,
    };
  };

  const initialState = getInitialState();
  const [courseData, setCourseData] = useState(initialState.courseData);
  const [courseDetails, setCourseDetails] = useState(initialState.courseDetails);
  const [moduleData, setModuleData] = useState<any[]>(initialState.moduleData);
  const [lessonData, setLessonData] = useState(initialState.lessonData);

  // Debug lessonData changes
  useEffect(() => {
    console.log('lessonData updated:', lessonData);
  }, [lessonData]);
  const isEditingExisting = !!courseId;

  // Save state to localStorage whenever it changes (but not for editing existing courses)
  useEffect(() => {
    if (!isEditingExisting) {
      const stateToSave = {
        courseData,
        courseDetails,
        moduleData,
        lessonData,
      };
      saveCourseBuilderState(stateToSave);
    }
  }, [courseData, courseDetails, moduleData, lessonData, isEditingExisting]);

  console.log("UserDetails:", user);

  useEffect(() => {
    if (isEditingExisting) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      const response = await courseService.getCourseById(courseId);
      console.log('[CourseBuilder] LOAD COURSE RESPONSE:', response);

      if (response) {
        // Map Course Details
        const courseInfo = response.course;
        setCourseDetails({
          courseTitle: courseInfo.title || '',
          description: courseInfo.description || '',
          images: null, // File object can't be restored from URL
          tags: courseInfo.tags || [],
        });

        if (courseInfo.images && courseInfo.images.length > 0) {
          setCoverImagePreview(courseInfo.images[0]);
        }

        // Map Course Settings
        const settings = response.settings;
        setCourseData({
          title: courseInfo.title || '',
          description: courseInfo.description || '',
          tags: courseInfo.tags || [],
          courseStatus: settings.courseStatus || 'draft',
          trackingProgress: settings.trackingProgress ?? true,
          selfPacedLearning: settings.selfPacedLearning ?? true,
          certificateOnCompletion: settings.certificateOnCompletion ?? false,
          gradedCourse: settings.gradedCourse ?? false,
          coverImage: courseInfo.images?.[0] || '',
        });

        // Map Modules and IDs
        const rawModules = response.modules || [];
        const modules = rawModules.map((m: any) => ({
          ...m,
          Contents: m.contents || m.Contents || [],
        }));
        setSelectModule(modules);
        setCourseModules(modules);
        const ids = modules.map((m: any) => m.id);
        setModuleIds(ids);

        // Map Other IDs
        setSelectCourseId(courseInfo.id.toString());
        setCourseSettingId(settings.id);

        // Sync Session Storage
        sessionStorage.setItem('currentCourseId', courseInfo.id.toString());
        sessionStorage.setItem('settingID', settings.id.toString());
      }
    } catch (error: any) {
      console.error('Failed to load course:', error);
      toast.error(error.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourseDetails = async () => {
    if (!courseDetails.courseTitle.trim()) {
      toast.error('Course title is required');
      return;
    }

    // In edit mode, we might not have a new image file, just the existing preview.
    if (!courseDetails.images && !coverImagePreview) {
      toast.error('Course image is required');
      return;
    }

    // prepare course data to send backend
    const payload = new FormData();
    payload.append('courseTitle', courseDetails.courseTitle);
    payload.append('description', courseDetails.description);

    // Only append image if a new one was selected
    if (courseDetails.images) {
      payload.append('images', courseDetails.images);
    }

    courseDetails.tags.forEach(tag => {
      payload.append('tags', tag);
    });

    try {
      setLoading(true);
      const response = await courseService.createCourseDetials(payload);
      toast.success('Course Details created');
      console.log('CREATE COURSE RAW RESPONSE:', response);

      // value that holds the course id
      const courseId = response.courseDescription.id;
      // sets the id onto the local  state
      setSelectCourseId(courseId);

      // save Id in localstorage
      sessionStorage.setItem('currentCourseId', courseId.toString());

      // Update courseData with details from courseDetails
      setCourseData(prev => ({
        ...prev,
        title: courseDetails.courseTitle,
        description: courseDetails.description,
        tags: [...courseDetails.tags],
      }));

      // Don't clear courseDetails here, keep it for persistence
      // setCourseDetails will be cleared only after final course creation
      setCoverImagePreview(null);
      return courseId;
    } catch (error: any) {
      console.log(error?.message || 'Failed to post details');
      toast.error(error?.message || 'Failed to create course details');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async () => {
    // In a real implementation, this would save the modules and lessons to separate tables
    toast.success('Content saved successfully');
  };

  const handleFinalSave = async (overriddenSettingsId?: number, overriddenCourseId?: string) => {
    if (isEditingExisting) {
      // In edit mode, redirect to handleSaveAll which handles the monolithic save
      return handleSaveAll();
    }

    if (!courseDetails?.courseTitle.trim()) {
      toast.error('Course title is required');
      return;
    }

    if (!moduleIds.length) {
      toast.error('At least one module is required');
      return;
    }

    setFinalSaving(true);
    try {
      // New course — link courseId + settingsId + moduleIds
      const activeCourseId = overriddenCourseId || selectCourseId;
      const createPayload: createCoursePayload = {
        courseId: Number(activeCourseId),
        courseSettingsId: overriddenSettingsId || courseSettingId,
        courseModuleId: moduleIds,
      };
      console.log('[handleFinalSave] CREATE payload:', createPayload);
      await courseService.createCourse(createPayload);
      toast.success('Course created successfully!');
      resetCourseBuilder();
    } catch (error) {
      console.error('Failed to save course:', error);
      toast.error('Failed to save course. Please try again.');
    } finally {
      setFinalSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setFinalSaving(true);
    try {
      if (isEditingExisting) {
        // Monolithic Edit: Single PATCH endpoint with all data
        const formData = new FormData();
        formData.append('courseTitle', courseDetails.courseTitle);
        formData.append('description', courseDetails.description);
        courseDetails.tags.forEach(tag => formData.append('tags', tag));

        if (courseDetails.images) {
          formData.append('images', courseDetails.images);
        }

        const settings = {
          courseStatus: courseData.courseStatus,
          trackingProgress: courseData.trackingProgress,
          selfPacedLearning: courseData.selfPacedLearning,
          certificateOnCompletion: courseData.certificateOnCompletion,
          gradedCourse: courseData.gradedCourse,
        };
        formData.append('courseSettings', JSON.stringify(settings));

        // Modules - linking the IDs in the same request
        moduleIds.forEach(id => formData.append('courseModuleId', id.toString()));

        console.log('[handleSaveAll] Monolithic EDIT payload:', {
          title: courseDetails.courseTitle,
          settings,
          moduleIds
        });

        await courseService.editCourse(courseId, formData);
        toast.success('All changes saved successfully');
      } else {
        // New Course: Still requires sequential steps to get IDs from backend
        // unless a monolithic create endpoint is implemented. 
        // We'll keep this logic but provide a single interaction.
        const latestCourseId = await handleSaveCourseDetails();
        const latestSettingsId = await handleSaveSettings(latestCourseId);
        await handleFinalSave(latestSettingsId, latestCourseId);
        toast.success('Course created and saved successfully');
      }
    } catch (error: any) {
      console.error('[handleSaveAll] Error:', error);
      toast.error(error.message || 'Failed to save all changes');
    } finally {
      setFinalSaving(false);
    }
  };

  const handleSaveSettings = async (overriddenCourseId?: string) => {
    // When editing, use the courseId from the URL; when creating, use the one returned after createCourseDetails
    const activeCourseId = overriddenCourseId || (isEditingExisting ? courseId : selectCourseId);
    if (!activeCourseId) {
      toast.error('Please create course details first');
      return;
    }

    const payload: courseSettings = {
      courseStatus: courseData.courseStatus,
      trackingProgress: courseData.trackingProgress,
      selfPacedLearning: courseData.selfPacedLearning,
      certificateOnCompletion: courseData.certificateOnCompletion,
      gradedCourse: courseData.gradedCourse,
    };
    try {
      setIsSavingSetting(true);
      const response = await courseService.courseSettings(activeCourseId, payload);

      const settingsId = response.courseSettings.id;
      setCourseSettingId(settingsId);
      sessionStorage.setItem('settingID', settingsId);
      toast.success('Settings Saved');
      return settingsId;
    } catch (error: any) {
      toast.error(error?.message || 'Failed to Save Settings');
      throw error; // Rethrow so handleSaveAll knows it failed
    } finally {
      setIsSavingSetting(false);
    }
  };

  const handleAddModule = async () => {
    if (!moduleData.title.trim()) {
      toast.error('Module title is required');
      return;
    }

    // When editing use the URL courseId; when creating use selectCourseId
    const activeCourseId = isEditingExisting ? courseId : selectCourseId;
    if (!activeCourseId) {
      toast.error('Please create course details first');
      return;
    }

    const payload = {
      title: moduleData.title,
      description: moduleData.description,
      moduleNumber: moduleData.moduleNumber,
    };
    try {
      setIsSavingModule(true);
      const response = await courseService.createModules(payload, activeCourseId);
      setShowModuleModal(false);
      toast.success('Module added successfully');
      setModuleData({ title: '', description: '', moduleNumber: '' });
      await fetchModulesByCourseId();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to Add Module');
    } finally {
      setIsSavingModule(false);
    }
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setModuleData({
      title: module.title,
      description: module.description,
      moduleNumber: module.moduleNumber,
    });
    setShowModuleModal(true);
  };

  const handleUpdateModule = async () => {
    if (!moduleIds) {
      toast.error('Please create course details first');
      return;
    }
    if (!moduleData.title.trim()) {
      toast.error('Module title is required');
      return;
    }

    if (!editingModule) return;

    const payload = {
      moduleNumber: moduleData.moduleNumber,
      title: moduleData.title,
      description: moduleData.description,
      courseContentId: moduleIds,
    };

    setIsSavingModule(true);

    try {
      const response = await courseService.editModule(editingModule.id, payload);
      await fetchModulesByCourseId();
      setEditingModule(null);
      setModuleData({ title: '', description: '', moduleNumber: '' });
      setShowModuleModal(false);
      toast.success('Module updated successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update module');
    } finally {
      setIsSavingModule(false);
    }
  };

  console.log('module id to edit', editingModule?.id);

  const handleDeleteModule = (moduleId: string, moduleTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the module "${moduleTitle}"? This will also delete all lessons in this module.`
      )
    ) {
      return;
    }

    if (course) {
      const updatedModules = course.modules.filter(module => module.id !== moduleId);

      // Update order of remaining modules
      const reorderedModules = updatedModules.map((module, index) => ({
        ...module,
        order: index,
      }));

      setCourse({
        ...course,
        modules: reorderedModules,
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

        if (
          !question.correctAnswer ||
          typeof question.correctAnswer !== 'string' ||
          !question.correctAnswer.trim()
        ) {
          toast.error(`Question ${i + 1} must have a correct answer selected`);
          return false;
        }

        if (!question.options.includes(question.correctAnswer)) {
          toast.error(`Question ${i + 1} correct answer must match one of the options`);
          return false;
        }
      } else if (question.type === 'short-text') {
        if (
          !question.correctAnswer ||
          (Array.isArray(question.correctAnswer) && question.correctAnswer.length === 0)
        ) {
          toast.error(`Question ${i + 1} must have at least one correct answer`);
          return false;
        }
      }
    }

    return true;
  };

  const handleAddLesson = async () => {
    try {
      if (!lessonData.title.trim()) {
        toast.error('Lesson Title is Required');
        return;
      }

      const activeCourseId = isEditingExisting ? courseId : selectCourseId;
      if (!activeCourseId || !selectedModuleId || !selectedModuleNumber) {
        toast.error('Course or Module is missing');
        return;
      }

      setIsAddingLesson(true);

      const backendLessonType = lessonData.type === 'text' ? 'textContent' : lessonData.type;

      const formData = new FormData();

      // ===== BASE REQUIRED FIELDS =====
      formData.append('title', lessonData.title);
      formData.append('lessonType', backendLessonType);
      formData.append('lessonDescription', lessonData.description);
      formData.append('moduleNumber', String(selectedModuleNumber));
      formData.append('courseModuleId', String(selectedModuleId));
      formData.append('lessonNumber', lessonData.lessonNumber);
      formData.append('duration', String(lessonData.duration || 0)); // Add lesson duration
      formData.append('isRequired', String(lessonData.trackingProgress)); // Add isRequired field
      // ===== ALWAYS SEND IMAGES =====
      if (lessonData.imageFile) {
        formData.append('images', lessonData.imageFile);
      } else {
        formData.append('images', '');
      }

      // ===== FILE / IMAGE (VERY IMPORTANT) =====
      if (lessonData.imageFile) {
        switch (backendLessonType) {
          case 'video':
            formData.append('videoUpload', lessonData.imageFile);
            break;

          case 'pdf':
            formData.append('pdfUpload', lessonData.imageFile);
            break;

          case 'attachment':
          case 'textContent':
            formData.append('attachmentFile', lessonData.imageFile);
            break;

          default:
            formData.append('images', lessonData.imageFile);
        }
      }

      // ===== TYPE-SPECIFIC DATA =====
      switch (backendLessonType) {
        case 'video':
          formData.append('videoUrl', lessonData.content.videoUrl);
          formData.append('videoDuration', String(lessonData.videoDuration || 0));
          break;

        case 'pdf':
          formData.append('pdfUrl', lessonData.content.pdfUrl);
          if (lessonData.content.pdfUpload instanceof File) {
            formData.append('pdfUpload', lessonData.content.pdfUpload);
          }
          break;

        case 'attachment':
          formData.append('fileAttachmentURL', lessonData.content.attachmentUrl);
          break;

        case 'textContent':
          formData.append('textContent', lessonData.content.textContent);
          break;

        case 'quiz':
          // Add quiz questions to FormData
          const quizQuestionsJson = JSON.stringify(lessonData.content.quizData.questions);
          console.log('Sending quiz questions to backend:', quizQuestionsJson);
          formData.append('quizQuestions', quizQuestionsJson);
          formData.append('quizTotalScore', String(lessonData.content.quizData.totalScore || 0));
          formData.append(
            'quizGradingPreferenceType',
            lessonData.content.quizData.gradedCourse ? 'graded' : 'raw'
          );
          // Add quiz-specific properties that were missing
          formData.append('quizDuration', String(lessonData.content.quizData.duration || null));
          formData.append('quizMaxAttempts', String(lessonData.content.quizData.maxAttempts || 1));
          formData.append('quizPassingScore', String(lessonData.content.quizData.quizPassingScore || null));

          // Cache the raw quiz questions for editing
          if (editingLesson?.id) {
            cacheRawQuizQuestions(editingLesson.id, quizQuestionsJson);
          }
          break;

        case 'reflection':
          formData.append('reflectionPrompt', lessonData.content.reflectionPrompt);
          break;
      }

      // for debugging
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await courseService.createCourseContent(formData, activeCourseId);
      console.log('CREATE LESSON RESPONSE:', response);

      const createdLesson = response.courseContent; // Use courseContent instead of content
      console.log('Created lesson data:', createdLesson);

      // Cache the created lesson data for future editing
      if (createdLesson && createdLesson.id) {
        cacheLessonData(createdLesson);

        // Also cache quiz questions if this is a quiz lesson
        if (lessonData.type === 'quiz' && createdLesson.quizQuestions) {
          cacheQuizQuestions(createdLesson.id, createdLesson.quizQuestions);
          // Cache the raw questions JSON that was returned
          const rawQuestions = JSON.stringify(createdLesson.quizQuestions);
          cacheRawQuizQuestions(createdLesson.id, rawQuestions);
        }
      }

      toast.success('Lesson created successfully');
      await fetchModulesByCourseId();
      resetLessonForm();
      setShowLessonModal(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create lesson');
    } finally {
      setIsAddingLesson(false);
    }
  };

  // normalizing type of lesson for editing
  const normalizeLessonType = (type: string) => {
    if (type === 'textContent') return 'text';
    return type;
  };

  const getEmptyContentForType = (type: string) => {
    switch (type) {
      case 'text':
        return { textContent: '' };
      case 'video':
        return { videoUrl: '' };
      case 'pdf':
        return { pdfUrl: '', pdfUpload: null };
      case 'attachment':
        return { attachmentUrl: '' };
      case 'quiz':
        return {
          quizData: {
            title: '',
            description: '',
            questions: [],
            gradedCourse: true,
            quizPassingScore: 70,
            duration: null,
            maxAttempts: 1,
          },
        };
      case 'reflection':
        return { reflectionPrompt: '' };
      default:
        return {};
    }
  };

  const hydrateContentByType = (lesson: Lesson) => {
    console.log('Hydrating content for lesson type:', lesson.lessonType);
    console.log('Full lesson object:', lesson);

    switch (lesson.lessonType) {
      case 'textContent':
        const textResult = { textContent: lesson.textContent || '' };
        console.log('Text content result:', textResult);
        return textResult;

      case 'video':
        const videoResult = { videoUrl: lesson.videoUrl || '' };
        console.log('Video content result:', videoResult);
        return videoResult;

      case 'pdf':
        const pdfResult = { pdfUrl: lesson.pdfUrl || '', pdfUpload: null };
        console.log('PDF content result:', pdfResult);
        return pdfResult;

      case 'attachment':
        const attachmentResult = { attachmentUrl: lesson.fileAttachmentURL || lesson.attachmentUrl || '' };
        console.log('Attachment content result:', attachmentResult);
        return attachmentResult;

      case 'quiz':
        // Handle quiz data from the lesson object - prioritize response data
        let questionsToUse: QuizQuestion[] = [];

        // Try raw cached questions first (from response)
        if (lesson.id && rawQuizQuestionsCache[lesson.id]) {
          try {
            questionsToUse = JSON.parse(rawQuizQuestionsCache[lesson.id]);
            console.log('Using raw cached questions:', questionsToUse);
          } catch (e) {
            console.error('Failed to parse cached questions:', e);
          }
        }

        // Fallback to lesson.quizQuestions from response data
        if (questionsToUse.length === 0 && lesson.quizQuestions) {
          questionsToUse = lesson.quizQuestions;
          console.log('Using lesson.quizQuestions:', questionsToUse);
        }

        // Final fallback to other caches
        if (questionsToUse.length === 0) {
          const cachedQuestions = lesson.id ? quizQuestionsCache[lesson.id] : null;
          questionsToUse = cachedQuestions || [];
        }

        const quizResult = {
          quizData: {
            title: lesson.title || '',
            description: lesson.lessonDescription || lesson.description || '',
            questions: questionsToUse,
            gradedCourse: true, // Default value since not in response
            quizPassingScore: lesson.quizPassingScore ?? 70,
            duration: lesson.quizDuration ?? null,
            maxAttempts: lesson.quizMaxAttempts ?? 1,
          },
        };
        console.log('Quiz content result:', quizResult);
        return quizResult;

      case 'reflection':
        const reflectionResult = {
          reflectionPrompt: lesson.reflectionPrompt || '',
        };
        console.log('Reflection content result:', reflectionResult);
        return reflectionResult;

      default:
        console.log('Unknown lesson type, returning empty object');
        return {};
    }
  };



  const handleEditLesson = async (lesson: Lesson) => {
    console.log('=== EDIT LESSON START ===');
    console.log('Received lesson:', lesson);
    console.log('Lesson type:', lesson.lessonType);
    console.log('Lesson content:', lesson.content);

    // First set the editing lesson
    setEditingLesson(lesson);
    console.log('Set editingLesson to:', lesson);

    const uiType = lesson.lessonType === 'textContent' ? 'text' : lesson.lessonType;
    console.log('UI Type mapped to:', uiType);

    // Check if we have cached data for this lesson
    const cachedLesson = lessonCache[lesson.id];
    console.log('Cached lesson data:', cachedLesson);

    // Use cached data if available, otherwise use the passed lesson data
    const lessonToUse = cachedLesson || lesson;
    console.log('Using lesson data:', lessonToUse);

    // Get the hydrated content
    const hydratedContent = hydrateContentByType(lessonToUse);
    console.log('Hydrated content:', hydratedContent);

    const newLessonData = {
      lessonNumber: lessonToUse.lessonNumber?.toString() || '',
      title: lessonToUse.title || '',
      description: lessonToUse.lessonDescription || lessonToUse.description || '', // Handle both field names
      type: uiType,
      content: hydratedContent,
      duration: lessonToUse.videoDuration || lessonToUse.duration || 0, // Handle both field names
      trackingProgress: lessonToUse.isRequired ?? true,
      imageFile: null, // Reset image file for editing
    };

    console.log('Prepared lesson data:', newLessonData);

    // Set the lesson data
    setLessonData(newLessonData);
    console.log('Set lessonData state');

    // Set the module selection
    setSelectedModuleId(lessonToUse.moduleId || lesson.moduleId);
    console.log('Set selectedModuleId to:', lessonToUse.moduleId || lesson.moduleId);

    // Open the modal after a small delay to ensure all state updates
    setTimeout(() => {
      console.log('About to open modal');
      console.log('Current lessonData:', newLessonData);
      console.log('Current editingLesson:', lesson);
      setShowLessonModal(true);
      console.log('Modal opened');
      console.log('=== EDIT LESSON END ===');
    }, 100); // Increased delay to 100ms
  };


  const handleUpdateLesson = async () => {
    try {
      // ===== BASIC VALIDATION =====
      if (!lessonData.title?.trim()) {
        toast.error('Lesson Title is Required');
        return;
      }

      if (!editingLesson?.id) {
        toast.error('No lesson selected for update');
        return;
      }

      setIsAddingLesson(true);

      // ===== MAP UI TYPE → BACKEND TYPE =====
      const backendLessonType = lessonData.type === 'text' ? 'textContent' : lessonData.type;

      const formData = new FormData();

      // ===== HELPERS =====
      const appendString = (key: string, value?: string) => {
        if (typeof value === 'string' && value.trim() !== '') {
          formData.append(key, value);
        }
      };

      const appendInt = (key: string, value?: number) => {
        if (typeof value === 'number' && !Number.isNaN(value)) {
          formData.append(key, String(value));
        }
      };

      // ===== BASE FIELDS =====
      appendString('title', lessonData.title);
      appendString('lessonType', backendLessonType);
      appendString('lessonDescription', lessonData.description);

      appendInt('lessonNumber', parseInt(lessonData.lessonNumber) || 0);
      appendInt('moduleNumber', selectedModuleNumber);
      appendInt('courseModuleId', selectedModuleId);
      appendInt('organizationId', user?.organizationId);
      appendInt('duration', lessonData.duration); // Add lesson duration
      formData.append('isRequired', String(lessonData.trackingProgress)); // Add isRequired field

      // ===== FILE UPLOAD (ONLY IF CHANGED) =====
      if (lessonData.imageFile instanceof File) {
        switch (backendLessonType) {
          case 'video':
            formData.append('videoUpload', lessonData.imageFile);
            break;

          case 'pdf':
            formData.append('pdfUpload', lessonData.imageFile);
            break;

          case 'attachment':
            formData.append('attachmentFile', lessonData.imageFile);
            break;

          default:
            break;
        }
      }

      // ===== TYPE-SPECIFIC PAYLOAD =====
      switch (backendLessonType) {
        case 'textContent':
          appendString('textContent', lessonData.content.textContent);
          break;

        case 'video':
          appendString('videoUrl', lessonData.content.videoUrl);
          appendInt('videoDuration', lessonData.videoDuration);
          break;

        case 'pdf':
          appendString('pdfUrl', lessonData.content.pdfUrl);
          if (lessonData.content.pdfUpload instanceof File) {
            formData.append('pdfUpload', lessonData.content.pdfUpload);
          }
          break;

        case 'attachment':
          appendString('fileAttachmentURL', lessonData.content.attachmentUrl);
          break;

        case 'quiz':
          formData.append(
            'quizQuestions',
            JSON.stringify(lessonData.content.quizData?.questions ?? [])
          );

          appendInt('quizTotalScore', lessonData.content.quizData?.totalScore);

          appendString(
            'quizGradingPreferenceType',
            lessonData.content.quizData?.gradedCourse ? 'graded' : 'raw'
          );

          // Add quiz-specific properties that were missing
          appendInt('quizDuration', lessonData.content.quizData?.duration);
          appendInt('quizMaxAttempts', lessonData.content.quizData?.maxAttempts);
          appendInt('quizPassingScore', lessonData.content.quizData?.quizPassingScore);
          break;

        case 'reflection':
          appendString('reflectionPrompt', lessonData.content.reflectionPrompt);
          break;
      }

      // ===== DEBUG (KEEP UNTIL STABLE) =====
      for (const [key, value] of formData.entries()) {
        console.log('[UPDATE PAYLOAD]', key, value);
      }

      // ===== API CALL =====
      const response = await courseService.editCourseContent(formData, editingLesson.id);
      console.log('UPDATE LESSON RESPONSE:', response);

      // Cache the updated lesson data for future editing
      if (response && response.id) {
        cacheLessonData(response);

        // Also cache quiz questions if this is a quiz lesson
        if (lessonData.type === 'quiz' && response.quizQuestions) {
          cacheQuizQuestions(response.id, response.quizQuestions);
          // Cache the raw questions JSON that was returned
          const rawQuestions = JSON.stringify(response.quizQuestions);
          cacheRawQuizQuestions(response.id, rawQuestions);
        }
      }

      toast.success('Lesson updated successfully');

      await fetchModulesByCourseId();
      resetLessonForm();
      setEditingLesson(null);
      setShowLessonModal(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to update lesson');
    } finally {
      setIsAddingLesson(false);
    }
  };

  console.log('setting editing Lesson Id: ', editingLesson?.id);

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
            lessons: updatedLessons,
          };
        }
        return module;
      });

      setCourse({
        ...course,
        modules: updatedModules,
      });
    }

    toast.success('Lesson deleted successfully');
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return PlayIcon;
      case 'textContent':
        return DocumentTextIcon;
      case 'pdf':
        return DocumentArrowDownIcon;
      case 'attachment':
        return PaperClipIcon;
      case 'quiz':
        return QuestionMarkCircleIcon;
      case 'reflection':
        return PencilSquareIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const fetchModulesByCourseId = async () => {
    const activeCourseId = isEditingExisting ? courseId : selectCourseId;
    if (!activeCourseId) return;
    try {
      setIsLoadingModules(true);
      const response = await courseService.getCreatedModules(activeCourseId);
      const rawModules = response || [];
      const modules = rawModules.map((m: any) => ({
        ...m,
        Contents: m.contents || m.Contents || [],
      }));
      setSelectModule(modules);
      setCourseModules(modules);
      // Keep moduleIds in sync so the final save endpoint gets all IDs
      const ids = modules.map((m: any) => m.id);
      setModuleIds(ids);
    } catch (error: any) {
      console.log(error?.message || 'Failed to load module');
      toast.error('Failed to Load Module');
    } finally {
      setIsLoadingModules(false);
    }
  };

  const resetLessonForm = () => {
    setLessonData({
      title: '',
      description: '',
      type: 'video',
      content: {
        videoUrl: '',
        textContent: '',
        pdfUrl: '',
        pdfUpload: null,
        attachmentUrl: '',
        quizData: {
          id: '',
          title: '',
          description: '',
          questions: [],
          gradedCourse: true,
          quizPassingScore: 70,
          duration: null,
          maxAttempts: 1,
        },
        reflectionPrompt: '',
      },
      duration: 0,
      isRequired: true,
      imageFile: null,
    });
  };

  const resetCourseBuilder = () => {
    clearCourseBuilderState();

    // reset all react states
    setCourseData({
      title: '',
      description: '',
      tags: [] as string[],
      courseStatus: 'draft' as CourseStatus,
      trackingProgress: true,
      selfPacedLearning: true,
      certificateOnCompletion: false,
      gradedCourse: false,
      coverImage: '',
    });

    setCourseDetails({
      courseTitle: '',
      description: '',
      images: null as File | null,
      tags: [],
    });

    setModuleData([]);

    setLessonData({
      lessonNumber: '',
      title: '',
      lessonDescription: '',
      type: 'video' as 'video' | 'textContent' | 'pdf' | 'attachment' | 'quiz' | 'reflection',
      content: {
        videoUrl: '',
        textContent: '',
        pdfUrl: '',
        pdfUpload: null,
        attachmentUrl: '',
        quizData: {
          id: '',
          title: '',
          description: '',
          questions: [] as QuizQuestion[],
          gradedCourse: true,
          quizPassingScore: 70,
          duration: null,
          maxAttempts: 1,
        },
        reflectionPrompt: '',
      } as any,
      duration: 0,
      isRequired: true,
      imageFile: null,
    });

    setCourse(null);
    setCourseSettingId(null);
    setModuleIds([]);
    setSelectCourseId('');
    setSelectModule([]);
    setSelectedModuleId('');
    setSelectedModuleNumber(null);
    setEditingModule(null);
    setEditingLesson(null);
    setCoverImagePreview(null);
    setActiveTab('details');

    // Reset modal states
    setShowModuleModal(false);
    setShowLessonModal(false);
  };

  console.log('local ID:', selectCourseId);
  console.log('Show Module Data:', selectModule);
  console.log('Local storage:', sessionStorage.getItem('currentCourseId'));
  console.log('module ID:', selectedModuleId);
  console.log('Local courseSettingId ID:', courseSettingId);
  console.log('sessionStorage course settingId', sessionStorage.getItem('settingID'));
  console.log('Module IDS', moduleIds);

  // on component mount get the course Id
  useEffect(() => {
    const savedCourseId = sessionStorage.getItem('currentCourseId');
    const savedSettingsId = sessionStorage.getItem('settingID');
    if (savedCourseId) {
      setSelectCourseId(savedCourseId.toString());
    }

    if (savedSettingsId) {
      setCourseSettingId(savedSettingsId);
    }
  }, []);

  useEffect(() => {
    if (!selectCourseId) return;

    fetchModulesByCourseId(selectCourseId);
  }, [selectCourseId]);

  useEffect(() => {
    if (courseModules?.length) {
      const ids = courseModules.map(module => module.id);
      setModuleIds(ids);
    }
  }, [courseModules]);

  // Delete module functions
  const handleDeleteModuleClick = (moduleId: string, moduleTitle: string) => {
    // Create a temporary module object to store the ID for deletion
    setEditingModule({ id: moduleId, title: moduleTitle } as Module); // Store the module ID to be deleted
    setShowDeleteModuleModal(true);
  };

  const handleConfirmDeleteModule = async () => {
    if (!editingModule?.id) {
      toast.error('No module selected for deletion');
      return;
    }

    try {
      // First, delete all lessons within the module
      const module = selectModule.find(m => m.id === editingModule.id);
      if (module && module.Contents && module.Contents.length > 0) {
        // Delete each lesson in the module
        for (const lesson of module.Contents) {
          try {
            await courseService.deleteLesson(lesson.id);
          } catch (lessonError) {
            console.error(`Failed to delete lesson ${lesson.id}:`, lessonError);
            // Continue with other lessons even if one fails
          }
        }

        // Fetch updated module data to ensure backend has processed the lesson deletions
        await fetchModulesByCourseId();

        // Wait a moment to ensure the backend syncs the deletion
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Then delete the module
      await courseService.deleteModule(editingModule.id);

      // Update local state
      const updatedModules = selectModule.filter(module => module.id !== editingModule.id);
      setSelectModule(updatedModules);

      await fetchModulesByCourseId();

      toast.success('Module deleted successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete module');
    } finally {
      setShowDeleteModuleModal(false);
      setEditingModule(null);
    }
  };

  // Delete lesson functions
  const handleDeleteLessonClick = (lessonId: string, lessonTitle: string, moduleId: string) => {
    // Create a temporary lesson object to store the ID for deletion
    setEditingLesson({ id: lessonId, title: lessonTitle, moduleId } as Lesson); // Store the lesson ID to be deleted
    setShowDeleteLessonModal(true);
  };

  const handleConfirmDeleteLesson = async () => {
    if (!editingLesson?.id) {
      toast.error('No lesson selected for deletion');
      return;
    }

    try {
      setIsDeletingLesson(true);
      // Call your delete lesson API here
      await courseService.deleteLesson(editingLesson.id);

      // Update local state
      const updatedModules = selectModule.map(module => {
        if (module.id === editingLesson.moduleId) {
          return {
            ...module,
            Contents: module.Contents.filter(lesson => lesson.id !== editingLesson.id)
          };
        }
        return module;
      });

      setSelectModule(updatedModules);

      await fetchModulesByCourseId();

      toast.success('Lesson deleted successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete lesson');
    } finally {
      setShowDeleteLessonModal(false);
      setEditingLesson(null);
      setIsDeletingLesson(false);
    }
  };

  const tabs = [
    { id: 'details', name: 'Course Details' },
    { id: 'content', name: 'Content & Modules' },
    { id: 'settings', name: 'Settings' },
    { id: 'preview', name: 'Preview & Publish' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="space-y-6">
            <Input
              label="Course Title"
              value={courseDetails.courseTitle}
              onChange={e => setCourseDetails(prev => ({ ...prev, courseTitle: e.target.value }))}
              placeholder="Enter course title"
              required
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Course Description
              </label>
              <RichTextEditor
                value={courseDetails.description}
                onChange={value => setCourseDetails(prev => ({ ...prev, description: value }))}
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
                value={courseDetails.tags.join(', ')}
                onChange={e =>
                  setCourseDetails(prev => ({
                    ...prev,
                    tags: e.target.value
                      .split(',')
                      .map(tag => tag.trim())
                      .filter(Boolean),
                  }))
                }
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
                maxSize={5 * 1024 * 1024}
                maxFiles={1}
                autoUpload={false}
                onUpload={files => {
                  if (files && files.length > 0) {
                    const file = files[0];
                    const originalFile = file?.originalFile || file?.file || null;

                    if (originalFile) {
                      // Update your course details state
                      setCourseDetails(prev => ({
                        ...prev,
                        images: originalFile,
                      }));

                      // Generate a preview URL for the image
                      const previewUrl = URL.createObjectURL(originalFile);
                      setCoverImagePreview(previewUrl);
                    }
                  }
                }}
              />
            </div>

            {/* Save button removed - using Save All Changes in header */}
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Course Modules</h3>
              <Button onClick={() => {
                setShowModuleModal(true);
                setModuleData({ title: '', description: '', moduleNumber: '' });
              }} disabled={isLoadingModules}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>

            {isLoadingModules ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center justify-between animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="h-5 w-5 bg-gray-300 rounded" />
                          <div className="space-y-2">
                            <div className="h-4 w-48 bg-gray-300 rounded" />
                            <div className="h-3 w-64 bg-gray-200 rounded" />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-8 w-24 bg-gray-300 rounded" />
                          <div className="h-8 w-8 bg-gray-300 rounded" />
                          <div className="h-8 w-8 bg-gray-300 rounded" />
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : selectModule?.length > 0 ? (
              <div className="space-y-4">
                {selectModule.map(module => (
                  <Card key={module.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bars3Icon className="h-5 w-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              Module {module?.moduleNumber}: {module?.title ?? 'N/A'}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(module?.description ?? 'N/A') }} />
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedModuleId(module.id);
                              setSelectedModuleNumber(module.moduleNumber);
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
                            onClick={() => handleDeleteModuleClick(module.id, module.title)}
                          >
                            <TrashIcon className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {module.Contents.length > 0 && (
                      <CardContent>
                        <div className="space-y-2">
                          {module.Contents.map((lesson, lessonIndex) => {
                            const Icon = getLessonIcon(lesson.lessonType);
                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <Icon className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {lesson?.lessonNumber ?? 0}. {lesson?.title ?? 'N/A'}
                                    </p>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                      <span className="capitalize">{lesson?.lessonType}</span>
                                      {lesson?.videoDuration !== null &&
                                        lesson?.videoDuration !== undefined && (
                                          <>
                                            <span className="font-medium text-black">•</span>
                                            <span>{Math.ceil(lesson.videoDuration / 60)}min</span>
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
                                    onClick={async () => {
                                      console.log('=== EDIT BUTTON CLICKED ===');
                                      console.log('Lesson data being passed:', lesson);
                                      console.log('Lesson keys:', Object.keys(lesson));
                                      console.log('Lesson values:', lesson);
                                      await handleEditLesson(lesson);
                                    }}
                                  >
                                    <PencilIcon className="h-4 w-4 text-green-700" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteLessonClick(lesson.id, lesson.title, lesson.moduleId)
                                    }
                                  >
                                    <TrashIcon className="h-4 w-4 text-red-600" />
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
                <Button onClick={() => setShowModuleModal(true)}>Add First Module</Button>
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
                  <h4 className="font-medium text-gray-900 dark:text-white">Course Status</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Control whether students can access this course
                  </p>
                </div>
                <select
                  value={courseData.courseStatus}
                  onChange={e =>
                    setCourseData(prev => ({
                      ...prev,
                      courseStatus: e.target.value as courseSettings,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Track Progress</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monitor student progress through the course
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courseData.trackingProgress}
                    onChange={e =>
                      setCourseData(prev => ({ ...prev, trackingProgress: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Self-Paced Learning</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow students to progress at their own pace
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courseData.selfPacedLearning}
                    onChange={e =>
                      setCourseData(prev => ({ ...prev, selfPacedLearning: e.target.checked }))
                    }
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
                    checked={courseData.certificateOnCompletion}
                    onChange={e =>
                      setCourseData(prev => ({
                        ...prev,
                        certificateOnCompletion: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Graded Course</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Include assessments and grades for this course
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courseData.gradedCourse}
                    onChange={e =>
                      setCourseData(prev => ({ ...prev, gradedCourse: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              {/* Save button removed - using Save All Changes in header */}
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
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Course Details
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Title</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {courseDetails?.courseTitle || 'Untitled Course'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${courseData?.courseStatus === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                          {courseData?.courseStatus === 'published' ? 'published' : 'draft'}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                        <div
                          className="font-medium text-gray-900 dark:text-white prose max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHTML(courseDetails?.description || 'No description provided'),
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tags</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {courseDetails?.tags.length > 0 ? (
                            courseDetails?.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
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
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Course Content
                  </h4>
                  {selectModule?.length > 0 ? (
                    <div className="space-y-4">
                      {selectModule?.map((module, moduleIndex) => (
                        <div
                          key={module.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              Module {moduleIndex + 1}: {module?.title ?? 'N/A'}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(module?.description || 'No description') }} />
                            </p>
                          </div>
                          <div className="p-4">
                            {module.Contents && module.Contents.length > 0 ? (
                              <div className="space-y-3">
                                {module.Contents.map((lesson, lessonIndex) => {
                                  const Icon = getLessonIcon(lesson.lessonType);
                                  return (
                                    <div
                                      key={lesson.id}
                                      className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                                    >
                                      <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                          {lesson?.lessonNumber ?? 0}. {lesson.title ?? "N/A"}
                                        </p>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                          <span className="capitalize">{lesson.lessonType}</span>
                                          {lesson?.videoDuration !== null &&
                                            lesson?.videoDuration !== undefined && (
                                              <>
                                                <span className="font-medium text-black">•</span>
                                                <span>
                                                  {Math.ceil(lesson?.videoDuration / 60)}min
                                                </span>
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
                                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                                            <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(lesson.description) }} />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm italic">
                                No lessons in this module
                              </p>
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
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Course Settings
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Track Progress
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Monitor student progress
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${courseData.trackingProgress
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {courseData.trackingProgress ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Self-Paced Learning
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Students progress at their own pace
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${courseData.selfPacedLearning
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {courseData.selfPacedLearning ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Certificate on Completion
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Award certificate upon completion
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${courseData.certificateOnCompletion
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {courseData.certificateOnCompletion ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Graded Course</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Include assessments and grades
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${courseData.gradedCourse
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {courseData.gradedCourse ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setActiveTab('details')}>
                Back to Editing
              </Button>
              <Button
                onClick={() => isEditingExisting ? handleSaveAll() : handleFinalSave()}
                loading={finalSaving}
                className="bg-green-600 hover:bg-green-700"
                disabled={finalSaving}
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                {finalSaving
                  ? isEditingExisting
                    ? 'Updating Course...'
                    : 'Creating Course...'
                  : isEditingExisting
                    ? 'Update Course'
                    : 'Create Course'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderLessonForm = () => {
    // console.log('=== RENDER LESSON FORM ===');
    // console.log('lessonData:', lessonData);
    // console.log('editingLesson:', editingLesson);
    // console.log('selectedModuleId:', selectedModuleId);

    return (
      <div className="space-y-6">
        <Input
          label="Lesson Number"
          value={lessonData.lessonNumber}
          onChange={e => setLessonData(prev => ({ ...prev, lessonNumber: e.target.value }))}
          placeholder="Enter lesson Number"
          required
        />

        <Input
          label="Lesson Title"
          value={lessonData.title}
          onChange={e => setLessonData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter lesson title"
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Lesson Description
          </label>
          <textarea
            value={lessonData.description}
            onChange={createSmartSanitizedChangeHandler(
              e => setLessonData(prev => ({ ...prev, description: e.target.value })),
              true
            )}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Briefly describe what students will learn in this lesson"
          />
        </div>

        {/* Module Selection (readonly when editing) */}
        {editingLesson ? (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Module
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
              {selectModule.find(m => m.id === selectedModuleId)?.title || 'Unknown Module'}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Module
            </label>
            <select
              value={selectedModuleId}
              onChange={e => setSelectedModuleId(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a module</option>
              {selectModule.map(module => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Lesson Type
          </label>
          <select
            value={lessonData.type}
            onChange={e => {
              const newType = e.target.value;

              setLessonData(prev => {
                if (prev.type === newType) {
                  return prev; // 🚫 DO NOTHING
                }

                return {
                  ...prev,
                  type: newType,
                  content: getEmptyContentForType(newType),
                };
              });
            }}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="video">Video</option>
            <option value="text">Text Content</option>
            <option value="pdf">PDF Document</option>
            <option value="quiz">Quiz</option>
            {/* <option value="attachment">File Attachment</option> */}
            {/* <option value="reflection">Reflection</option> */}
          </select>
        </div>

        {/* Lesson Thumbnail/Image Upload */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Lesson Thumbnail (Optional)
          </label>
          <FileUploader
            accept="image/*"
            maxSize={5 * 1024 * 1024} // 5MB
            maxFiles={1}
            legacyMode={false}
            onUpload={async uploadResults => {
              console.log('Thumbnail uploaded:', uploadResults[0]);
              setLessonData(prev => ({
                ...prev,
                imageFile: uploadResults[0]?.originalFile || null,
              }));
            }}
            dropzoneText="Upload a thumbnail image (JPG, PNG, GIF)"
          />
          {lessonData.imageFile && (
            <p className="text-sm text-green-600 dark:text-green-400">
              ✓ Thumbnail selected: {lessonData.imageFile.name}
            </p>
          )}
        </div>

        {/* Lesson Duration */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Estimated Duration (minutes)
          </label>
          <input
            type="number"
            value={lessonData.duration ?? ''}
            onChange={e => {
              const value = e.target.value;
              setLessonData(prev => ({
                ...prev,
                duration: value === '' ? 0 : parseInt(value) || 0
              }));
            }}
            min="0"
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Estimated time to complete this lesson"
          />
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
                onChange={e =>
                  setLessonData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      videoUrl: e.target.value,
                    },
                  }))
                }
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
                value={lessonData.videoDuration ?? ''}
                onChange={e => {
                  const value = e.target.value;
                  setLessonData(prev => ({
                    ...prev,
                    videoDuration: value === '' ? null : parseInt(value) || 0
                  }));
                }}
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
                onUpload={async uploadResults => {
                  // Handle video upload
                  console.log('Video uploaded:', uploadResults[0]);
                  setLessonData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      videoUrl: uploadResults[0]?.url || '',
                    },
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
              onChange={value =>
                setLessonData(prev => ({
                  ...prev,
                  content: {
                    ...prev.content,
                    textContent: value,
                  },
                }))
              }
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
                onChange={e =>
                  setLessonData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      pdfUrl: e.target.value,
                    },
                  }))
                }
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
                onUpload={async uploadResults => {
                  // Handle PDF upload
                  console.log('PDF uploaded:', uploadResults[0]);
                  setLessonData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      pdfUrl: uploadResults[0]?.url || '',
                      pdfUpload: uploadResults[0]?.originalFile || null,
                    },
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
                onChange={e =>
                  setLessonData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      attachmentUrl: e.target.value,
                    },
                  }))
                }
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
                onUpload={async uploadResults => {
                  // Handle file upload
                  console.log('File uploaded:', uploadResults[0]);
                  setLessonData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      attachmentUrl: uploadResults[0]?.url || '',
                    },
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Quiz Title"
                value={lessonData.content.quizData.title}
                onChange={e =>
                  setLessonData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      quizData: {
                        ...prev.content.quizData,
                        title: e.target.value,
                      },
                    },
                  }))
                }
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
                  value={lessonData.content.quizData.quizPassingScore ?? ''}
                  onChange={e => {
                    const value = e.target.value;
                    setLessonData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        quizData: {
                          ...prev.content.quizData,
                          quizPassingScore: value === '' ? null : parseInt(value) || 70,
                        },
                      },
                    }));
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={lessonData.content.quizData.duration ?? ''}
                  onChange={e => {
                    const value = e.target.value;
                    setLessonData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        quizData: {
                          ...prev.content.quizData,
                          duration: value === '' ? null : parseInt(value) || 30,
                        },
                      },
                    }));
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maximum Attempts
                </label>
                <input
                  type="number"
                  min="1"
                  value={lessonData.content.quizData.maxAttempts ?? ''}
                  onChange={e => {
                    const value = e.target.value;
                    setLessonData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        quizData: {
                          ...prev.content.quizData,
                          maxAttempts: value === '' ? null : parseInt(value) || 3,
                        },
                      },
                    }));
                  }}
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
                onChange={createSmartSanitizedChangeHandler(
                  e =>
                    setLessonData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        quizData: {
                          ...prev.content.quizData,
                          description: e.target.value,
                        },
                      },
                    })),
                  true
                )}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what this quiz covers..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={lessonData.content.quizData.gradedCourse}
                  onChange={e =>
                    setLessonData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        quizData: {
                          ...prev.content.quizData,
                          gradedCourse: e.target.checked,
                        },
                      },
                    }))
                  }
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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Questions</h3>
                <Button
                  onClick={() => {
                    const newQuestion: QuizQuestion = {
                      id: `question-${Date.now()}`,
                      question: '',
                      type: 'multiple-choice',
                      options: ['', ''],
                      correctAnswers: [],
                      explanation: '',
                      points: 1,
                    };
                    setLessonData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        quizData: {
                          ...prev.content.quizData,
                          questions: [...prev.content.quizData.questions, newQuestion],
                        },
                      },
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
                        correctAnswers: [],
                        explanation: '',
                        points: 1,
                      };
                      setLessonData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          quizData: {
                            ...prev.content.quizData,
                            questions: [...prev.content.quizData.questions, newQuestion],
                          },
                        },
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
                                  [newQuestions[index - 1], newQuestions[index]] = [
                                    newQuestions[index],
                                    newQuestions[index - 1],
                                  ];
                                  setLessonData(prev => ({
                                    ...prev,
                                    content: {
                                      ...prev.content,
                                      quizData: {
                                        ...prev.content.quizData,
                                        questions: newQuestions,
                                      },
                                    },
                                  }));
                                }
                              }}
                              disabled={index === 0}
                              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                if (index < lessonData.content.quizData.questions.length - 1) {
                                  const newQuestions = [...lessonData.content.quizData.questions];
                                  [newQuestions[index], newQuestions[index + 1]] = [
                                    newQuestions[index + 1],
                                    newQuestions[index],
                                  ];
                                  setLessonData(prev => ({
                                    ...prev,
                                    content: {
                                      ...prev.content,
                                      quizData: {
                                        ...prev.content.quizData,
                                        questions: newQuestions,
                                      },
                                    },
                                  }));
                                }
                              }}
                              disabled={index === lessonData.content.quizData.questions.length - 1}
                              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                const newQuestions = lessonData.content.quizData.questions.filter(
                                  q => q.id !== question.id
                                );
                                setLessonData(prev => ({
                                  ...prev,
                                  content: {
                                    ...prev.content,
                                    quizData: {
                                      ...prev.content.quizData,
                                      questions: newQuestions,
                                    },
                                  },
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
                            onChange={e => {
                              const newQuestions = [...lessonData.content.quizData.questions];
                              newQuestions[index] = {
                                ...newQuestions[index],
                                question: e.target.value,
                              };
                              setLessonData(prev => ({
                                ...prev,
                                content: {
                                  ...prev.content,
                                  quizData: {
                                    ...prev.content.quizData,
                                    questions: newQuestions,
                                  },
                                },
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
                                onChange={e => {
                                  const newQuestions = [...lessonData.content.quizData.questions];
                                  const updatedQuestion = {
                                    ...newQuestions[index],
                                    type: e.target.value as 'multiple-choice' | 'short-text',
                                    correctAnswers: e.target.value === 'multiple-choice' ? '' : [],
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
                                        questions: newQuestions,
                                      },
                                    },
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
                                value={question.points ?? ''}
                                onChange={e => {
                                  const value = e.target.value;
                                  const newQuestions = [...lessonData.content.quizData.questions];
                                  newQuestions[index] = {
                                    ...newQuestions[index],
                                    points: value === '' ? 1 : parseInt(value) || 1,
                                  };
                                  setLessonData(prev => ({
                                    ...prev,
                                    content: {
                                      ...prev.content,
                                      quizData: {
                                        ...prev.content.quizData,
                                        questions: newQuestions,
                                      },
                                    },
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
                                      options: [...(newQuestions[index].options || []), ''],
                                    };
                                    setLessonData(prev => ({
                                      ...prev,
                                      content: {
                                        ...prev.content,
                                        quizData: {
                                          ...prev.content.quizData,
                                          questions: newQuestions,
                                        },
                                      },
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
                                    checked={(question.correctAnswers || []).includes(option)}
                                    onChange={() => {
                                      const newQuestions = [
                                        ...lessonData.content.quizData.questions,
                                      ];
                                      newQuestions[index] = {
                                        ...newQuestions[index],
                                        correctAnswers: [option],
                                      };
                                      setLessonData(prev => ({
                                        ...prev,
                                        content: {
                                          ...prev.content,
                                          quizData: {
                                            ...prev.content.quizData,
                                            questions: newQuestions,
                                          },
                                        },
                                      }));
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={e => {
                                      const newOptions = [...(question.options || [])];
                                      newOptions[optionIndex] = e.target.value;

                                      const newQuestions = [
                                        ...lessonData.content.quizData.questions,
                                      ];
                                      newQuestions[index] = {
                                        ...newQuestions[index],
                                        options: newOptions,
                                      };

                                      // Update correct answer if it was this option
                                      const wasCorrect = (question.correctAnswers || []).includes(
                                        option
                                      );

                                      newQuestions[index] = {
                                        ...newQuestions[index],
                                        options: newOptions,
                                        correctAnswers: wasCorrect
                                          ? [e.target.value]
                                          : question.correctAnswers,
                                      };

                                      setLessonData(prev => ({
                                        ...prev,
                                        content: {
                                          ...prev.content,
                                          quizData: {
                                            ...prev.content.quizData,
                                            questions: newQuestions,
                                          },
                                        },
                                      }));
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  <button
                                    onClick={() => {
                                      if ((question.options?.length || 0) > 2) {
                                        const newOptions = (question.options || []).filter(
                                          (_, i) => i !== optionIndex
                                        );
                                        const newQuestions = [
                                          ...lessonData.content.quizData.questions,
                                        ];
                                        newQuestions[index] = {
                                          ...newQuestions[index],
                                          options: newOptions,
                                        };

                                        // Update correct answer if it was this option
                                        if (question.correctAnswers === option) {
                                          newQuestions[index] = {
                                            ...newQuestions[index],
                                            correctAnswers: newOptions[0] || '',
                                          };
                                        }

                                        setLessonData(prev => ({
                                          ...prev,
                                          content: {
                                            ...prev.content,
                                            quizData: {
                                              ...prev.content.quizData,
                                              questions: newQuestions,
                                            },
                                          },
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
                                value={
                                  Array.isArray(question.correctAnswers)
                                    ? question.correctAnswers.join('\n')
                                    : ''
                                }
                                onChange={createSmartSanitizedChangeHandler(e => {
                                  const answers = e.target.value
                                    .split('\n')
                                    .filter(a => a.trim() !== '');
                                  const newQuestions = [...lessonData.content.quizData.questions];
                                  newQuestions[index] = {
                                    ...newQuestions[index],
                                    correctAnswers: answers,
                                  };
                                  setLessonData(prev => ({
                                    ...prev,
                                    content: {
                                      ...prev.content,
                                      quizData: {
                                        ...prev.content.quizData,
                                        questions: newQuestions,
                                      },
                                    },
                                  }));
                                }, false)}
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
                              onChange={createSmartSanitizedChangeHandler(e => {
                                const newQuestions = [...lessonData.content.quizData.questions];
                                newQuestions[index] = {
                                  ...newQuestions[index],
                                  explanation: e.target.value,
                                };
                                setLessonData(prev => ({
                                  ...prev,
                                  content: {
                                    ...prev.content,
                                    quizData: {
                                      ...prev.content.quizData,
                                      questions: newQuestions,
                                    },
                                  },
                                }));
                              }, true)}
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
              onChange={createSmartSanitizedChangeHandler(
                e =>
                  setLessonData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      reflectionPrompt: e.target.value,
                    },
                  })),
                true
              )}
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
              checked={lessonData.trackingProgress}
              onChange={e =>
                setLessonData(prev => ({ ...prev, trackingProgress: e.target.checked }))
              }
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
                      gradedCourse: true,
                      passingScore: 70,
                    },
                    reflectionPrompt: '',
                  },
                  duration: 0,
                  isRequired: true,
                  imageFile: null,
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingLesson ? handleUpdateLesson : handleAddLesson}
              loading={isAddingLesson}
              disabled={isAddingLesson}
            >
              {isAddingLesson
                ? editingLesson
                  ? 'Updating...'
                  : 'Adding...'
                : editingLesson
                  ? 'Update Lesson'
                  : 'Add Lesson'}
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
            {isEditingExisting ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isEditingExisting
              ? 'Update your course content and settings'
              : 'Build an engaging learning experience'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleSaveAll}
            loading={finalSaving}
            className="bg-green-600 hover:bg-green-700 shadow-md"
            disabled={finalSaving}
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            {finalSaving
              ? isEditingExisting
                ? 'Updating Course...'
                : 'Saving Course...'
              : isEditingExisting
                ? 'Save All Changes'
                : 'Save Course'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (isFormEmpty()) {
                // If form is empty, navigate directly without confirmation
                resetCourseBuilder();
                navigate('/teacher/courses');
              } else {
                // If form has data, show confirmation modal
                setShowCancelConfirmation(true);
              }
            }}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
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
        <CardContent className="p-8">{renderTabContent()}</CardContent>
      </Card>

      {/* Add Module Modal */}
      <Modal
        isOpen={showModuleModal}
        onClose={() => {
          setShowModuleModal(false);
          setEditingModule(null);
          setModuleData({ title: '', description: '', moduleNumber: '' });
        }}
        title={editingModule ? 'Edit Module' : 'Add New Module'}
      >
        <div className="space-y-4">
          <Input
            label="Module Number"
            value={moduleData.moduleNumber}
            onChange={e => setModuleData(prev => ({ ...prev, moduleNumber: e.target.value }))}
            placeholder="Enter module Number"
          />
          <Input
            label="Module Title"
            value={moduleData.title}
            onChange={e => setModuleData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter module title"
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Module Description
            </label>
            <RichTextEditor
              value={moduleData.description}
              onChange={createSanitizedEditorChangeHandler(value =>
                setModuleData(prev => ({ ...prev, description: value }))
              )}
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
            <Button
              onClick={editingModule ? handleUpdateModule : handleAddModule}
              disabled={isSavingModule} // optional, disable while saving
              className="flex items-center justify-center space-x-2"
            >
              {isSavingModule && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                    d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 11-8 8z"
                  ></path>
                </svg>
              )}

              <span>
                {isSavingModule
                  ? editingModule
                    ? 'Updating Module...'
                    : 'Creating Module...'
                  : editingModule
                    ? 'Update Module'
                    : 'Add Module'}
              </span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal
        isOpen={showLessonModal}
        onClose={() => {
          console.log('=== MODAL CLOSING ===');
          console.log('Current lessonData before close:', lessonData);
          setShowLessonModal(false);
          setEditingLesson(null);
          console.log('=== MODAL CLOSED ===');
        }}
        title={editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
        size="lg"
      >
        {renderLessonForm()}
      </Modal>

      {/* Delete Module Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteModuleModal}
        onClose={() => {
          setShowDeleteModuleModal(false);
          setEditingModule(null);
        }}
        onConfirm={handleConfirmDeleteModule}
        title="Delete Module"
        message={`Are you sure you want to delete the module "${editingModule?.title}"? This action cannot be undone and will also delete all lessons within this module.`}
        confirmText="Delete Module"
        cancelText="Cancel"
        confirmVariant="danger"
      />

      {/* Delete Lesson Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteLessonModal}
        onClose={() => {
          setShowDeleteLessonModal(false);
          setEditingLesson(null);
        }}
        onConfirm={handleConfirmDeleteLesson}
        title="Delete Lesson"
        message={`Are you sure you want to delete the lesson "${editingLesson?.title}"? This action cannot be undone.`}
        confirmText={isDeletingLesson ? 'Deleting...' : 'Delete Lesson'}
        cancelText="Cancel"
        confirmVariant="danger"
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmDialog
        isOpen={showCancelConfirmation}
        onClose={() => {
          setShowCancelConfirmation(false);
        }}
        onConfirm={async () => {
          await resetCourseBuilder();
          navigate('/teacher/courses');
        }}
        title="Confirm Cancel"
        message="Are you sure you want to cancel? All unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Continue Editing"
        confirmVariant="danger"
      />
    </div>
  );
}
