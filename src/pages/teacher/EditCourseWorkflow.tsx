import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { Modal } from '../../components/ui/Modal';
import { CourseStatus, courseSettings, QuizQuestion,Lesson,Module } from '../../types';
import { FileUploader } from '../../components/ui/FileUploader';
import { createSmartSanitizedChangeHandler, sanitizeHTML, createSanitizedEditorChangeHandler } from '../../utils/sanitization';
import toast from 'react-hot-toast';
import { courseService } from '../../services/courseService';
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
import { useAuthStore } from '../../stores/authStore';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

type LessonType = 'video' | 'text' | 'pdf' | 'attachment' | 'quiz' | 'reflection';

interface LessonForm {
  id: string;
  lessonNumber: string;
  title: string;
  description: string;
  type: LessonType;
  duration: number;
  isRequired: boolean;
  videoUrl?: string;
  textContent?: string;
  pdfUrl?: string;
  attachmentUrl?: string;
  reflectionPrompt?: string;
  quiz?: {
    title: string;
    description: string;
    questions: Array<{
      id: string;
      question: string;
      type: 'multiple-choice' | 'short-text';
      options?: string[];
      correctAnswers: string[];
      points?: number;
      explanation?: string;
    }>;
    totalScore?: number;
    gradingPreferenceType?: 'graded' | 'raw';
    duration?: number | null;
    maxAttempts?: number | null;
    passingScore?: number | null;
    gradedCourse?: boolean; // Add this property to match API response
  };
}

interface ModuleForm {
  id: string;
  moduleNumber: string;
  title: string;
  description: string;
  lessons: LessonForm[];
}

export default function EditCourseWorkflow() {
  const { courseId } = useParams<{ courseId: string }>();
  const {user} = useAuthStore();
  const navigate = useNavigate();

  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
const [isSavingSetting, setIsSavingSetting] = useState(false);
const [isAddingLesson, setIsAddingLesson] = useState(false);
 const [isLoadingModules, setIsLoadingModules] = useState(false);
 const [selectedModuleNumber, setSelectedModuleNumber] = useState<number | null>(null);

 // Delete confirmation states
   const [showDeleteModuleModal, setShowDeleteModuleModal] = useState(false);
   const [showDeleteLessonModal, setShowDeleteLessonModal] = useState(false);
   const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

 

  const [activeTab, setActiveTab] = useState<'details' | 'content' | 'settings' | 'preview'>('details');

  const [courseDetails, setCourseDetails] = useState({
    courseTitle: '',
    description: '',
    coverImage: '',
    tags: [] as string[],
  });
  
  // Separate state for tags input to allow free typing
  const [tagsInput, setTagsInput] = useState('');

  const [settings, setSettings] = useState({
    courseStatus: 'draft' as CourseStatus,
    trackingProgress: true,
    selfPacedLearning: true,
    certificateOnCompletion: false,
    gradedCourse: false,
  });

  const [modules, setModules] = useState<ModuleForm[]>([]);

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [selectModule, setSelectModule] = useState<any[]>([]);
  const [selectCourseId, setSelectCourseId] = useState<string>('');
  const [moduleIds, setModuleIds] = useState([]);
  const [isSavingModule, setIsSavingModule] = useState(false);
    const [isDeletingLesson, setIsDeletingLesson] = useState(false);
  const [moduleData, setModuleData] = useState<{ moduleNumber: string; title: string; description: string }>({
    moduleNumber: '',
    title: '',
    description: '',
  });
  const [courseModules, setCourseModules] = useState([]);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLessonContext, setEditingLessonContext] = useState<{ moduleId: string; lessonId: string | null } | null>(null);
  const [lessonDraft, setLessonDraft] = useState<LessonForm>({
    id: '',
    lessonNumber: '',
    title: '',
    description: '',
    type: 'video',
    duration: 0,
    isRequired: true,
    videoUrl: '',
  });

  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [editingLesson, setEditingLesson] = useState<any>(null);

  // storing Ids for updating the form
  const [courseDetailsId, setCourseDetailsId] = useState<string>('');
  const [settingsId, setSettingsId] = useState<string>('');
  
  // Track if form has unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  const getEmptyContentForType = (type: string) => {
    switch (type) {
      case 'text':
        return { textContent: '' };
      case 'video':
        return { videoUrl: '' };
      case 'pdf':
        return { pdfUrl: '' };
      case 'attachment':
        return { attachmentUrl: '' };
      case 'quiz':
        return {
          quizData: {
            title: '',
            description: '',
            questions: [] as QuizQuestion[],
            gradedCourse: true,
            quizPassingScore: 70,
            duration: null as number | null,
            maxAttempts: 1,
          },
        };
      case 'reflection':
        return { reflectionPrompt: '' };
      default:
        return {};
    }
  };

  const [lessonData, setLessonData] = useState<any>({
    lessonNumber: '',
    title: '',
    description: '',
    type: 'video',
    content: {
      videoUrl: '',
      textContent: '',
      pdfUrl: '',
      attachmentUrl: '',
      quizData: {
        title: '',
        description: '',
        questions: [] as QuizQuestion[],
        gradedCourse: true,
        quizPassingScore: 70,
        duration: null as number | null,
        maxAttempts: 1,
      },
    },
    duration: 0,
    videoDuration: null as number | null,
    trackingProgress: true,
    imageFile: null as File | null,
  });

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

  // normalizing type of lesson for editing
  const normalizeLessonType = (type: string) => {
    if (type === 'textContent') return 'text';
    return type;
  };

  const hydrateContentByType = (lesson: any) => {
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

useEffect(() => {
  const fetchCourse = async () => {
    if (!courseId) {
      toast.error("Invalid course id");
      return;
    }

    try {
      setLoading(true);

      const response = await courseService.getCourseById(courseId);
      console.log('[EditCourseWorkflow] Fetched course:', response);

      const { course, content, settings, modules: modulesData } = response;

      // -------- DETAILS TAB --------
      setCourseDetails({
        courseTitle: course.title || "",
        description: course.description || "",
        coverImage: course.images?.[0] || "",
        tags: course.tags || [],
      });

      if (course.images?.length) {
        setCoverImagePreview(course.images[0]);
      }

      // -------- SETTINGS TAB --------
      if (settings) {
        setSettings({
          courseStatus: settings.courseStatus,
          trackingProgress: settings.trackingProgress,
          selfPacedLearning: settings.selfPacedLearning,
          certificateOnCompletion: settings.certificateOnCompletion,
          gradedCourse: settings.gradedCourse,
        });
      }


       // storing the ids for updaing the form 
      setCourseDetailsId(course.id);
      setSettingsId(settings.id);

      // -------- CONTENT TAB - Map modules and lessons --------
      if (modulesData?.length) {
        // Set the course ID for future operations
        setSelectCourseId(courseId);
        
        // Build module form with lessons from content
        const moduleMap: Record<string, ModuleForm> = {};
        
        modulesData.forEach((module: any) => {
          moduleMap[module.id.toString()] = {
            id: module.id.toString(),
            moduleNumber: (module as any).moduleNumber?.toString() || '',
            title: module.title,
            description: module.description,
            lessons: [],
          };
        });
        
        // Map content/lessons to their respective modules
        if (content?.length) {
          content.forEach((lesson: any) => {
            const moduleId = lesson.courseModuleId?.toString();
            
            if (moduleId && moduleMap[moduleId]) {
              // Cache quiz questions if this is a quiz lesson
              if (lesson.lessonType === 'quiz' && lesson.quizQuestions) {
                cacheQuizQuestions(lesson.id.toString(), lesson.quizQuestions);
                cacheRawQuizQuestions(lesson.id.toString(), JSON.stringify(lesson.quizQuestions));
              }
              
              moduleMap[moduleId].lessons.push({
                id: lesson.id.toString(),
                lessonNumber: (lesson as any).lessonNumber?.toString() || "",
                title: lesson.title,
                description: (lesson as any).lessonDescription || lesson.description || '',
                type: (lesson as any).lessonType === 'textContent' ? 'text' : (lesson as any).lessonType,
                duration: (lesson as any).videoDuration || (lesson as any).duration || 0,
                isRequired: (lesson as any).isRequired ?? true,
                videoUrl: (lesson as any).videoUrl,
                textContent: (lesson as any).textContent,
                pdfUrl: (lesson as any).pdfUrl,
                attachmentUrl: (lesson as any).fileAttachmentURL,
                reflectionPrompt: (lesson as any).reflectionPrompt,
                quiz: (lesson as any).quizQuestions ? {
                  title: lesson.title,
                  description: (lesson as any).lessonDescription,
                  questions: (lesson as any).quizQuestions,
                  totalScore: (lesson as any).quizTotalScore,
                  gradedCourse: true,
                  duration: (lesson as any).quizDuration,
                  maxAttempts: (lesson as any).quizMaxAttempts,
                  passingScore: (lesson as any).quizPassingScore,
                } : undefined,
              });
            }
          });
        }
        
        const modulesArray = Object.values(moduleMap);
        setModules(modulesArray);
        
        // ALSO update selectModule to match the expected format for rendering
        // Transform modules to include Contents array for the UI
        const selectModuleFormat = modulesData.map((module: any) => ({
          ...module,
          Contents: content?.filter((lesson: any) => lesson.courseModuleId === module.id) || [],
        }));
        setSelectModule(selectModuleFormat);
      } else if (content?.length) {
        // Fallback: group content by module if modules array is missing
        const moduleMap: Record<string, ModuleForm> = {};

        content.forEach((lesson: any) => {
          const moduleId = lesson.courseModuleId?.toString() || `mod-${lesson.courseModuleId}`;

          if (!moduleMap[moduleId]) {
            moduleMap[moduleId] = {
              id: moduleId,
              moduleNumber: lesson.moduleNumber?.toString() || "",
              title: `Module ${lesson.moduleNumber || moduleId}`,
              description: "",
              lessons: [],
            };
          }

          // Cache quiz questions if this is a quiz lesson
          if (lesson.lessonType === 'quiz' && lesson.quizQuestions) {
            cacheQuizQuestions(lesson.id.toString(), lesson.quizQuestions);
            cacheRawQuizQuestions(lesson.id.toString(), JSON.stringify(lesson.quizQuestions));
          }

          moduleMap[moduleId].lessons.push({
            id: lesson.id.toString(),
            lessonNumber: (lesson as any).lessonNumber?.toString() || "",
            title: lesson.title,
            description: (lesson as any).lessonDescription || lesson.description || '',
            type: (lesson as any).lessonType === 'textContent' ? 'text' : (lesson as any).lessonType,
            duration: (lesson as any).videoDuration || (lesson as any).duration || 0,
            isRequired: (lesson as any).isRequired ?? true,
            videoUrl: (lesson as any).videoUrl,
            textContent: (lesson as any).textContent,
            pdfUrl: (lesson as any).pdfUrl,
            attachmentUrl: (lesson as any).fileAttachmentURL,
            reflectionPrompt: (lesson as any).reflectionPrompt,
            quiz: (lesson as any).quizQuestions ? {
              title: lesson.title,
              description: (lesson as any).lessonDescription,
              questions: (lesson as any).quizQuestions,
              totalScore: (lesson as any).quizTotalScore,
              gradedCourse: true,
              duration: (lesson as any).quizDuration,
              maxAttempts: (lesson as any).quizMaxAttempts,
              passingScore: (lesson as any).quizPassingScore,
            } : undefined,
          });
        });

        const modulesArray = Object.values(moduleMap);
        setModules(modulesArray);
        
        // ALSO update selectModule to match the expected format for rendering
        const selectModuleFormat = modulesArray.map((module: any) => ({
          id: module.id,
          moduleNumber: parseInt(module.moduleNumber) || 0,
          title: module.title,
          description: module.description,
          Contents: module.lessons.map((lesson: any) => ({
            ...lesson,
            lessonType: lesson.type,
            moduleId: module.id,
          })),
        }));
        setSelectModule(selectModuleFormat);
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  fetchCourse();
}, [courseId]);

const fetchModulesByCourseId = async () => {
  try {
    setIsLoadingModules(true);
    const response = await courseService.getCreatedModules(courseDetailsId);
    console.log('[fetchModulesByCourseId] Raw API response:', response);
    
    setSelectModule(response || []);
    setCourseModules(response || []);
    
    if (response && response.length > 0) {
      const modulesArray: ModuleForm[] = response.map((module: any) => ({
        id: module.id.toString(),
        moduleNumber: (module as any).moduleNumber?.toString() || '',
        title: module.title,
        description: module.description,
        lessons: [],
      }));
      console.log('[fetchModulesByCourseId] Transformed modules for form:', modulesArray);
      setModules(modulesArray);
    } else {
      console.log('[fetchModulesByCourseId] No modules returned from API');
      setModules([]);
    }
  } catch (error: any) {
    console.log(error?.message ?? 'Failed to load module');
    toast.error('Failed to Load Module');
  } finally {
    setIsLoadingModules(false);
  }
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
      moduleNumber: parseInt(moduleData.moduleNumber) || 0,
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


  const handleCancel = () => {
    if (isDirty && !confirm('Discard your changes?')) return;
    navigate('/teacher/courses');
  };

  const handleAddModule = async () => {
      if (!moduleData.title.trim()) {
        toast.error('Module title is required');
        return;
      }
  
      if (!courseDetailsId) {
        toast.error('Please course details first');
      }
  
      const payload = {
        title: moduleData.title,
        description: moduleData.description,
        moduleNumber: moduleData.moduleNumber,
      };
      try {
        setIsSavingModule(true);
        const response = await courseService.createModules(payload, courseDetailsId);
        setShowModuleModal(false);
        toast.success('Module added successfully');
        setModuleData({ title: '', description: '', moduleNumber: '' });
  
        await fetchModulesByCourseId();
      } catch (error: any) {
        toast.error(error?.message ?? 'Failed to Add Module');
      } finally {
        setIsSavingModule(false);
      }
    };
  
    const handleEditModule = (module: any) => {
      setEditingModule(module);
      setModuleData({
        title: module.title,
        description: module.description,
        moduleNumber: (module as any).moduleNumber?.toString() || '',
      });
      setShowModuleModal(true);
    };

     const handleEditLesson = async (lesson: any) => {
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
         lessonNumber: (lessonToUse as any).lessonNumber?.toString() || '',
         title: lessonToUse.title || '',
         description: (lessonToUse as any).lessonDescription || lessonToUse.description || '', // Handle both field names
         type: uiType,
         content: hydratedContent,
         duration: (lessonToUse as any).videoDuration || (lessonToUse as any).duration || 0, // Handle both field names
         trackingProgress: (lessonToUse as any).isRequired ?? true,
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

  const openModuleModal = (moduleId?: string) => {
    if (moduleId) {
      const m = modules.find(x => x.id === moduleId);
      if (m) {
        setEditingModuleId(moduleId);
        setModuleData({ moduleNumber: m.moduleNumber, title: m.title, description: m.description });
      }
    } else {
      setEditingModuleId(null);
      setModuleData({ moduleNumber: '', title: '', description: '' });
    }
    setShowModuleModal(true);
  };

  const saveModule = () => {
    if (!moduleData.title.trim()) {
      toast.error('Module title is required');
      return;
    }
    if (editingModuleId) {
      setModules(prev =>
        prev.map(m =>
          m.id === editingModuleId
            ? { ...m, moduleNumber: moduleData.moduleNumber, title: moduleData.title, description: moduleData.description }
            : m
        )
      );
    } else {
      const id = `mod-${Date.now()}`;
      setModules(prev => [
        ...prev,
        {
          id,
          moduleNumber: moduleData.moduleNumber,
          title: moduleData.title,
          description: moduleData.description,
          lessons: [],
        },
      ]);
    }
    setShowModuleModal(false);
  };


  const handleAddLesson = async () => {
      try {
        if (!lessonData.title.trim()) {
          toast.error('Lesson Title is Required');
          return;
        }
  
        if (!selectCourseId || !selectedModuleId || !selectedModuleNumber) {
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
            break;
  
        default:
          break;
      }
  
        // for debugging
        for (const pair of formData.entries()) {
          console.log(pair[0], pair[1]);
        }
  
        const response = await courseService.createCourseContent(formData, courseDetailsId);
        console.log('CREATE LESSON RESPONSE:', response);
  
        const createdLesson = response.courseContent; // Use courseContent instead of content
        console.log('Created lesson data:', createdLesson);
  
        toast.success('Lesson created successfully');
        await fetchModulesByCourseId();
        setShowLessonModal(false);
      } catch (error: any) {
        toast.error(error?.message || 'Failed to create lesson');
      } finally {
        setIsAddingLesson(false);
      }
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
        appendInt('moduleNumber', selectedModuleNumber ?? undefined);
        appendInt('courseModuleId', parseInt(selectedModuleId) || 0);
        appendInt('organizationId', user?.organizationId ? parseInt(user.organizationId) : undefined);
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
        
  
        toast.success('Lesson updated successfully');
        await fetchModulesByCourseId();
        setEditingLesson(null);
        setShowLessonModal(false);
      } catch (error: any) {
        console.error(error);
        toast.error(error?.response?.data?.message || 'Failed to update lesson');
      } finally {
        setIsAddingLesson(false);
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



  const removeModule = (moduleId: string) => {
    if (!confirm('Remove this module?')) return;
    setModules(prev => prev.filter(m => m.id !== moduleId));
  };

  const hydrateLessonDraft = (l: any): LessonForm => {
    const rawType = l.lessonType || l.type || 'video';
    const type: LessonType = rawType === 'textContent' ? 'text' : rawType;
    const base: LessonForm = {
      id: l.id || '',
      lessonNumber: l.lessonNumber ? String(l.lessonNumber) : '',
      title: l.title || '',
      description: l.lessonDescription || l.description || '',
      type,
      duration: l.videoDuration ?? l.duration ?? 0,
      isRequired: l.isRequired ?? true,
    };
    switch (type) {
      case 'video':
        return { ...base, videoUrl: l.videoUrl || '' };
      case 'text':
        return { ...base, textContent: l.textContent || '' };
      case 'pdf':
        return { ...base, pdfUrl: l.pdfUrl || '' };
      case 'attachment':
        return { ...base, attachmentUrl: l.fileAttachmentURL || l.attachmentUrl || '' };
      case 'reflection':
        return { ...base, reflectionPrompt: l.reflectionPrompt || '' };
      case 'quiz':
        return {
          ...base,
          quiz: {
            title: l.title || '',
            description: l.lessonDescription || l.description || '',
            questions: Array.isArray(l.quizQuestions) ? l.quizQuestions : [],
            totalScore: l.quizTotalScore ?? 0,
            gradingPreferenceType: l.quizGradingPreferenceType ?? 'graded',
            duration: l.quizDuration ?? null,
            maxAttempts: l.quizMaxAttempts ?? 1,
            passingScore: l.quizPassingScore ?? null,
          },
        };
      default:
        return base;
    }
  };

  const openLessonModal = (moduleId: string, lessonId?: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    setSelectedModuleId(moduleId);
    if (lessonId) {
      const l = mod.lessons.find(x => x.id === lessonId);
      if (l) {
        // Hydrate to builder-style lessonData
        const t = l.type === 'text' ? 'text' : l.type;
        const base: any = {
          lessonNumber: l.lessonNumber || '',
          title: l.title || '',
          description: l.description || '',
          type: t,
          content: getEmptyContentForType(t),
          duration: l.duration || 0,
          videoDuration: l.duration || null,
          trackingProgress: l.isRequired ?? true,
          imageFile: null,
        };
        if (t === 'video') base.content.videoUrl = l.videoUrl || '';
        if (t === 'text') base.content.textContent = l.textContent || '';
        if (t === 'pdf') base.content.pdfUrl = l.pdfUrl || '';
        if (t === 'attachment') base.content.attachmentUrl = l.attachmentUrl || '';
        if (t === 'reflection') base.reflectionPrompt = l.reflectionPrompt || '';
        if (t === 'quiz') {
          base.content.quizData = {
            title: l.quiz?.title || l.title || '',
            description: l.quiz?.description || l.description || '',
            questions: l.quiz?.questions || [],
            gradedCourse: true,
            quizPassingScore: l.quiz?.passingScore ?? 70,
            duration: l.quiz?.duration ?? null,
            maxAttempts: l.quiz?.maxAttempts ?? 1,
          };
        }
        setLessonData(base);
        setEditingLesson(l);
        setEditingLessonContext({ moduleId, lessonId });
      }
    } else {
      setLessonData({
        lessonNumber: '',
        title: '',
        description: '',
        type: 'video',
        content: getEmptyContentForType('video'),
        duration: 0,
        videoDuration: null,
        trackingProgress: true,
        imageFile: null,
      });
      setEditingLesson(null);
      setEditingLessonContext({ moduleId, lessonId: null });
    }
    setShowLessonModal(true);
  };


  // Delete module functions
    const handleDeleteModuleClick = (moduleId: string, moduleTitle: string) => {
      // Create a temporary module object to store the ID for deletion
      setEditingModule({ id: moduleId, title: moduleTitle } as Module); // Store the module ID to be deleted
      setShowDeleteModuleModal(true);
    };
  
    const handleConfirmDeleteModule = async () => {
      if (!editingModule?.id){
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


  const handleUpdateCourseDetails = async () => {
    if (!courseDetailsId) {
      toast.error('No course details ID found');
      return;
    }

    // Validate required fields
    if (!courseDetails.courseTitle.trim()) {
      toast.error('Course title is required');
      return;
    }

    try {
      setLoading(true);

      // Prepare FormData for PATCH request
      const formData = new FormData();
      formData.append('courseTitle', courseDetails.courseTitle);
      formData.append('description', courseDetails.description);
      
      // Append tags (can be multiple)
      // Only append tags if there are any - don't send empty tags
      if (courseDetails.tags && courseDetails.tags.length > 0) {
        courseDetails.tags.forEach(tag => {
          formData.append('tags', tag);
        });
      }
      // If no tags, simply don't append anything - backend will keep existing tags or set to empty

      // Only append image if it's a new file upload
      // If coverImagePreview is a URL from server, don't re-upload
      // Backend will keep existing image if 'images' field is not provided
      if (coverImagePreview && !coverImagePreview.startsWith('http')) {
        // This is a local preview/blob, need actual file
        // For editing, we assume the image hasn't changed if it's a URL
        console.log('Skipping image upload - using existing server image');
      }
      // Note: To allow image updates, we would need to store the File object
      // For now, image updates are not supported in edit mode

      // Call the service
      const response = await courseService.updateCourseDetails(formData, courseDetailsId);
      console.log('[EditCourseWorkflow] Course details updated:', response);

      toast.success('Course details updated successfully');
    } catch (error: any) {
      console.error('[EditCourseWorkflow] Failed to update course details:', error);
      toast.error(error?.message || 'Failed to update course details');
    } finally {
      setLoading(false);
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
            Contents: module.Contents.filter((lesson: any) => lesson.id !== editingLesson.id)
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


const handleUpdateSettings = async () => {
  if (!settingsId) {
    toast.error('No settings ID found');
    return;
  }

  try {
    setIsSavingSetting(true);

    // Prepare payload for PATCH request
    const payload = {
      courseStatus: settings.courseStatus,
      trackingProgress: settings.trackingProgress,
      selfPacedLearning: settings.selfPacedLearning,
      certificateOnCompletion: settings.certificateOnCompletion,
      gradedCourse: settings.gradedCourse,
    };

    console.log('[EditCourseWorkflow] Updating settings:', payload);

    // Call the service
    const response = await courseService.updateCourseSettings(settingsId, payload);
    console.log('[EditCourseWorkflow] Settings updated:', response);

    toast.success('Settings updated successfully');
  } catch (error: any) {
    console.error('[EditCourseWorkflow] Failed to update settings:', error);
    toast.error(error?.message || 'Failed to update settings');
  } finally {
    setIsSavingSetting(false);
  }
};

  const saveLesson = () => {
    const ctx = editingLessonContext;
    if (!ctx) return;
    if (!lessonData.title?.trim()) {
      toast.error('Lesson title is required');
      return;
    }
    const t = lessonData.type;
    const newLesson: LessonForm = {
      id: ctx.lessonId || `les-${Date.now()}`,
      lessonNumber: lessonData.lessonNumber || '',
      title: lessonData.title || '',
      description: lessonData.description || '',
      type: t,
      duration: (lessonData.videoDuration ?? lessonData.duration) || 0,
      isRequired: !!lessonData.trackingProgress,
      videoUrl: t === 'video' ? (lessonData.content?.videoUrl || '') : undefined,
      textContent: t === 'text' ? (lessonData.content?.textContent || '') : undefined,
      pdfUrl: t === 'pdf' ? (lessonData.content?.pdfUrl || '') : undefined,
      attachmentUrl: t === 'attachment' ? (lessonData.content?.attachmentUrl || '') : undefined,
      reflectionPrompt: t === 'reflection' ? (lessonData.reflectionPrompt || '') : undefined,
      quiz: t === 'quiz'
        ? {
            title: lessonData.content?.quizData?.title || '',
            description: lessonData.content?.quizData?.description || '',
            questions: lessonData.content?.quizData?.questions || [],
            totalScore: undefined,
            gradingPreferenceType: lessonData.content?.quizData?.gradedCourse ? 'graded' : 'raw',
            duration: lessonData.content?.quizData?.duration ?? null,
            maxAttempts: lessonData.content?.quizData?.maxAttempts ?? 1,
            passingScore: lessonData.content?.quizData?.quizPassingScore ?? null,
          }
        : undefined,
    };
    setModules(prev => prev.map(m => {
      if (m.id !== ctx.moduleId) return m;
      if (ctx.lessonId) {
        return {
          ...m,
          lessons: m.lessons.map(l => (l.id === ctx.lessonId ? newLesson : l)),
        };
      }
      return { ...m, lessons: [...m.lessons, newLesson] };
    }));
    setShowLessonModal(false);
    setEditingLesson(null);
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    if (!confirm('Remove this lesson?')) return;
    setModules(prev =>
      prev.map(m => (m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m))
    );
  };


  // display the ids for updating
  console.log('Course Details ID:', courseDetailsId);
  console.log('Settings ID:', settingsId);
  console.log('selectCourseId', selectCourseId);
  

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

  const renderDetails = () => (
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
                   value={tagsInput}
                   onChange={e => {
                     setTagsInput(e.target.value);
                   }}
                   onKeyDown={e => {
                     if (e.key === ',') {
                       e.preventDefault();
                       const currentValue = tagsInput.trim();
                       if (currentValue && !courseDetails.tags.includes(currentValue)) {
                         setCourseDetails(prev => ({
                           ...prev,
                           tags: [...prev.tags, currentValue],
                         }));
                       }
                       setTagsInput('');
                     }
                   }}
                   onBlur={() => {
                     const currentValue = tagsInput.trim();
                     if (currentValue && !courseDetails.tags.includes(currentValue)) {
                       setCourseDetails(prev => ({
                         ...prev,
                         tags: [...prev.tags, currentValue],
                       }));
                     }
                     setTagsInput('');
                   }}
                   className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="Type tags and press comma to add them"
                 />
                 {/* Display current tags */}
                 {courseDetails.tags.length > 0 && (
                   <div className="flex flex-wrap gap-2 mt-2">
                     {courseDetails.tags.map((tag, index) => (
                       <span
                         key={index}
                         className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                       >
                         {tag}
                         <button
                           type="button"
                           onClick={() => {
                             setCourseDetails(prev => ({
                               ...prev,
                               tags: prev.tags.filter((_, i) => i !== index),
                             }));
                           }}
                           className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
                         >
                           ×
                         </button>
                       </span>
                     ))}
                   </div>
                 )}
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
                       const uploadResult = files[0];
                       // For modern mode, files are already UploadResult objects
                       // We need to store them as-is for later use
                                         
                       // Update your course details state with the URL
                       setCourseDetails(prev => ({
                         ...prev,
                         images: uploadResult.url || '',
                       }));
                                         
                       // Generate a preview URL for the image
                       const previewUrl = uploadResult.publicUrl || uploadResult.url;
                       setCoverImagePreview(previewUrl);
                     }
                   }}
                 />
               </div>
   
               <div className="flex justify-end">
                  <Button onClick={handleUpdateCourseDetails} loading={loading}>
                   Update Course Details
                 </Button>
               </div>
             </div>
           );
  

  const renderContent = () => (
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
                                <div dangerouslySetInnerHTML={{__html: sanitizeHTML(module?.description ?? 'N/A')}} />
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedModuleId(module.id);
                                setSelectedModuleNumber((module as any).moduleNumber || null);
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
                      {module.Contents?.length > 0 && (
                        <CardContent>
                          <div className="space-y-2">
                            {module.Contents.map((lesson: any, lessonIndex: number) => {
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
                                        {(lesson as any).lessonNumber ?? 0}. {(lesson as any).title ?? 'N/A'}
                                      </p>
                                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="capitalize">{(lesson as any).lessonType}</span>
                                        {(lesson as any).videoDuration !== null &&
                                          (lesson as any).videoDuration !== undefined && (
                                            <>
                                              <span className="font-medium text-black">•</span>
                                              <span>{(lesson as any).videoDuration}min</span>
                                            </>
                                          )}
                                        {(lesson as any).isRequired && (
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
                                        handleDeleteLessonClick((lesson as any).id, (lesson as any).title, (lesson as any).moduleId)
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


// real lesson form with all fields and content types
const renderLessonForm = () => {  
    return (
      <div className="space-y-6">
        <Input
          label="Lesson Number"
          value={lessonData.lessonNumber}
          onChange={e => setLessonData((prev:any) => ({ ...prev, lessonNumber: e.target.value }))}
          placeholder="Enter lesson Number"
          required
        />

        <Input
          label="Lesson Title"
          value={lessonData.title}
          onChange={e => setLessonData((prev:any) => ({ ...prev, title: e.target.value }))}
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
              e => setLessonData((prev:any) => ({ ...prev, description: e.target.value })),
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

              setLessonData((prev:any) => {
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
              setLessonData((prev:any) => ({
                ...prev,
                imageFile: uploadResults[0] || null, // Use entire UploadResult object
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
              setLessonData((prev:any) => ({ 
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
                  setLessonData((prev:any) => ({
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
                  setLessonData((prev:any) => ({ 
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
                  setLessonData((prev:any) => ({
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
                setLessonData((prev:any) => ({
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
                  setLessonData((prev:any) => ({
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
                  setLessonData((prev:any) => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      pdfUrl: uploadResults[0]?.originalName || '', // Use filename, not blob URL
                      pdfUpload: uploadResults[0]?.metadata?.originalFileObject || null, // Get File from metadata
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
                  setLessonData((prev:any) => ({
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
                  setLessonData((prev:any) => ({
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
                  setLessonData((prev:any) => ({
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
                    setLessonData((prev:any) => ({
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
                    setLessonData((prev:any) => ({
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
                    setLessonData((prev:any) => ({
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
                    setLessonData((prev:any) => ({
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
                    setLessonData((prev:any) => ({
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
                    setLessonData((prev:any) => ({
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
                      setLessonData((prev:any) => ({
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
                  {lessonData.content.quizData.questions.map((question: any, index: number) => (
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
                                  setLessonData((prev:any) => ({
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
                                  setLessonData((prev:any) => ({
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
                                  (q: QuizQuestion) => q.id !== question.id
                                );
                                setLessonData((prev:any) => ({
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
                              setLessonData((prev:any) => ({
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
                                    type: e.target.value as 'multiple-choice' | 'easy',
                                    correctAnswers: e.target.value === 'multiple-choice' ? '' : [],
                                  };

                                  // Reset options if switching to short-text
                                  if (e.target.value === 'easy') {
                                    delete updatedQuestion.options;
                                  } else {
                                    updatedQuestion.options = ['', ''];
                                  }

                                  newQuestions[index] = updatedQuestion;
                                  setLessonData((prev:any) => ({
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
                                <option value="easy">Short Text Answer</option>
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
                                  setLessonData((prev:any) => ({
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
                                    setLessonData((prev:any) => ({
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

                              {(question.options || []).map((option: string, optionIndex: number) => (
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
                                      setLessonData((prev:any) => ({
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

                                      setLessonData((prev:any) => ({
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
                                          (_: string, i: number) => i !== optionIndex
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

                                        setLessonData((prev:any) => ({
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
                                  setLessonData((prev:any) => ({
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
                                setLessonData((prev:any) => ({
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
                  setLessonData((prev:any) => ({
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
                setLessonData((prev:any) => ({ ...prev, trackingProgress: e.target.checked }))
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

  const renderSettings = () => (
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
                      value={settings.courseStatus}
  onChange={e =>
    setSettings(prev => ({
      ...prev,
      courseStatus: e.target.value as CourseStatus,
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
                        checked={settings.trackingProgress}
                        onChange={e =>
                          setSettings(prev => ({ ...prev, trackingProgress: e.target.checked }))
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
                        checked={settings.selfPacedLearning}
                        onChange={e =>
                          setSettings(prev => ({ ...prev, selfPacedLearning: e.target.checked }))
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
                        checked={settings.certificateOnCompletion}
                        onChange={e =>
                          setSettings(prev => ({
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
                        checked={settings.gradedCourse}
                        onChange={e =>
                          setSettings(prev => ({ ...prev, gradedCourse: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
    
                <div className="flex justify-end">
                  <Button
                    onClick={handleUpdateSettings}
                    loading={isSavingSetting}
                    disabled={isSavingSetting}
                  >
                    {isSavingSetting ? 'Updating...' : 'Update Settings'}
                  </Button>
                </div>
              </div>
  );
 
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{courseId ? 'Edit Course' : 'Create Course'}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Update your course content and settings</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'details', name: 'Course Details' },
            { id: 'content', name: 'Content & Modules' },
            { id: 'settings', name: 'Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

      <Card>
        <CardContent className="p-8">
          {activeTab === 'details' && renderDetails()}
          {activeTab === 'content' && renderContent()}
          {activeTab === 'settings' && renderSettings()}
        </CardContent>
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
                     setModuleData({ title: '', description: '', moduleNumber: '' });
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
                      confirmText= {isDeletingLesson ? 'Deleting...' : 'Delete Lesson'}
                      cancelText="Cancel"
                      confirmVariant="danger"
                    />
    </div>
  );
}
