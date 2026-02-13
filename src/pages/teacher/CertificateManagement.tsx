import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { certificateService } from '../../services/certificateService';
import { Course,CertificateElementDTO } from '../../types';
import { 
  TrophyIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  DocumentArrowDownIcon,
  SwatchIcon,
  PhotoIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { courseService } from '../../services/courseService';

interface CertificateElement {
  id: string;
  type: 'text' | 'image';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  color?: string;
  fontWeight?: 'normal' | 'bold';
}

interface CertificateTemplate {
  id: string;
  courseId: string;
  courseTitle: string; 
  name: string;
  backgroundColor: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  borderColor: string;
  fontFamily: string;
  logoUrl?: string;
  backgroundUrl?: string;
  customText: string;
  borderStyle: 'none' | 'simple' | 'ornate' | 'modern';
  elements: CertificateElement[];
}

interface CourseApiResponse {
  id: number;
  course: {
    id: number;
    title: string;
    description: string;
    tags?: string[];
    images?: string[];
  };
  modules: any[];
  settings: {
    certificateOnCompletion: boolean;
    trackingProgress: boolean;
    selfPacedLearning: boolean;
  };
  teacher: {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
    organizationId: string;
  };
  createdAt: string;
  updatedAt: string;
}


export default function CertificateManagement() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isFetchingTemplates, setIsFetchingTemplates] = useState(false); // ✅ NEW
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false); // ✅ NEW
    const [isUpdatingTemplate, setIsUpdatingTemplate] = useState(false); // ✅ NEW for update

 const [templateData, setTemplateData] = useState({
  courseId: '',
  name: '',
  accentColor: '#0099FF',
  textColor: '#111111',
  fontFamily: 'Open Sans',
  borderStyle: 'simple' as 'simple' | 'modern' | 'ornate',
  customText: 'This default template was automatically generated upon creation.',
  backgroundUrl: '',
  logoUrl: '',
  elements: [] as CertificateElement[],
});


const mapApiTemplateToUi = (tpl: any): CertificateTemplate => ({
    id: String(tpl.id),
    courseId: String(tpl.courseId),
    courseTitle: tpl.CourseDescription?.courseTitle ?? 'Unknown Course',
    name: tpl.templateName,
    backgroundColor: tpl.accentColor,
    primaryColor: tpl.defaultTextColor,
    accentColor: tpl.accentColor,
    textColor: tpl.defaultTextColor,
    borderColor: tpl.defaultTextColor,
    fontFamily: tpl.fontFamily,
    customText: tpl.customText,
    borderStyle: tpl.borderStyle.toLowerCase(),
    elements: tpl.content.map((el: any) => ({
      id: el.certificateId.toLowerCase(),
      type: 'text',
      content: el.textSource,
      x: el.positionX,
      y: el.positionY,
      width: el.width,
      height: el.height,
      fontSize: el.fontSize,
      color: el.textColor,
    })),
  });


  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
  if (!user) return;

  try {
    const rawCourses = await courseService.loadAllCourses();

    const normalizedCourses: Course[] = rawCourses.map((item: CourseApiResponse) => ({
      id: String(item.id),
      courseId: String(item.course.id),
      title: item.course.title,
      description: item.course.description,
      tags: [],
      status: 'published',
      trackingProgress: item.settings.trackingProgress,
      selfPacedLearning: item.settings.selfPacedLearning,
      certificateOnCompletion: item.settings.certificateOnCompletion,
      gradedCourse: false,
      teacherId: String(item.teacher?.id ?? ''),
      modules: item.modules ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    setCourses(normalizedCourses);


    setIsFetchingTemplates(true);
     const response = await certificateService.getCertificateTemplate();

     const mapped = response.map(mapApiTemplateToUi)
    setTemplates(mapped);

  } catch (error) {
    console.error('Failed to load certificate data:', error);
  } finally {
    setIsFetchingTemplates(false);
    setLoading(false);
  }
};


  console.log('Loaded USER:', user?.id);
  console.log('Loaded USER:', user);

  const mapElementsToDTO = (): CertificateElementDTO[] =>
  templateData.elements
    .filter(el => el.type === 'text')
    .map(el => ({
      certificateId: el.id.toUpperCase(),
      textSource: el.content,
      textColor: el.color ?? null,
      fontSize: el.fontSize ?? 16,
      width: el.width,
      height: el.height,
      positionX: el.x,
      positionY: el.y,
    }));



const handleEditTemplate = (template: CertificateTemplate) => {
  setEditingTemplate(template);
  
  // Map template data to form state
  setTemplateData({
    courseId: template.courseId,
    name: template.name,
    accentColor: template.accentColor,
    textColor: template.textColor,
    fontFamily: template.fontFamily,
    borderStyle: template.borderStyle as 'simple' | 'modern' | 'ornate',
    customText: template.customText,
    backgroundUrl: template.backgroundUrl || '',
    logoUrl: template.logoUrl || '',
    elements: template.elements.length > 0 ? template.elements : getDefaultElements(),
  });
  
  setShowTemplateModal(true);
};

const handleCreateTemplate = async () => {
  if (!templateData.courseId || !templateData.name) {
    toast.error('Template name and course are required');
    return;
  }

  try {
    setIsCreatingTemplate(true);
    const formData = new FormData();

    formData.append('templateName', templateData.name);
    formData.append('courseId', Number(templateData.courseId).toString());
    formData.append('accentColor', templateData.accentColor);
    formData.append('defaultTextColor', templateData.textColor);
    formData.append(
      'borderStyle',
      templateData.borderStyle.charAt(0).toUpperCase() +
        templateData.borderStyle.slice(1)
    );
    formData.append('fontFamily', templateData.fontFamily);
    formData.append('customText', templateData.customText);

    if (backgroundFile) {
      formData.append('backgroundImage', backgroundFile);
    }

    if (logoFile) {
      formData.append('logoUpload', logoFile);
    }

    formData.append(
      'content',
      JSON.stringify(mapElementsToDTO())
    );

    console.log('POST TEMPLATE PAYLOAD');
for (const [key, value] of formData.entries()) {
  console.log(key, value);
}


    await certificateService.createCourseCertificate(formData);

    toast.success('Certificate template created successfully');
    
    // reload templates after creation
    await loadData();


    setShowTemplateModal(false);
    setBackgroundFile(null);
    setLogoFile(null);
    resetTemplateData();


  } catch (error: any) {
    toast.error(error.message || 'Failed to create certificate template');
  }finally {
    setIsCreatingTemplate(false);
  }
};

const handleUpdateTemplate = async () => {
  if (!editingTemplate || !templateData.name) {
    toast.error('Template name is required');
    return;
  }

  try {
    setIsUpdatingTemplate(true);
    const formData = new FormData();

    formData.append('templateName', templateData.name);
    formData.append('accentColor', templateData.accentColor);
    formData.append('defaultTextColor', templateData.textColor);
    formData.append(
      'borderStyle',
      templateData.borderStyle.charAt(0).toUpperCase() +
        templateData.borderStyle.slice(1)
    );
    formData.append('fontFamily', templateData.fontFamily);
    formData.append('customText', templateData.customText);

    if (backgroundFile) {
      formData.append('backgroundImage', backgroundFile);
    }

    if (logoFile) {
      formData.append('logoUpload', logoFile);
    }

    formData.append(
      'content',
      JSON.stringify(mapElementsToDTO())
    );

    console.log('PUT TEMPLATE PAYLOAD');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    await certificateService.updateCourseCertificate(formData, editingTemplate.id);

    toast.success('Certificate template updated successfully');
    
    // reload templates after update
    await loadData();

    setShowTemplateModal(false);
    setEditingTemplate(null);
    setBackgroundFile(null);
    setLogoFile(null);
    resetTemplateData();

  } catch (error: any) {
    toast.error(error.message || 'Failed to update certificate template');
  } finally {
    setIsUpdatingTemplate(false);
  }
};

const resetTemplateData = () => {
  setTemplateData({
    courseId: '',
    name: '',
    accentColor: '#0099FF',
    textColor: '#111111',
    fontFamily: 'Open Sans',
    borderStyle: 'simple',
    customText: 'This default template was automatically generated upon creation.',
    backgroundUrl: '',
    logoUrl: '',
    elements: [],
  });
};


  const getDefaultElements = (): CertificateElement[] => {
    const elements: CertificateElement[] = [
      {
        id: 'title',
        type: 'text',
        content: 'CERTIFICATE OF COMPLETION',
        x: 200,
        y: 80,
        width: 400,
        height: 50,
        fontSize: 32,
        color: '#3B82F6',
        fontWeight: 'bold'
      },
      {
        id: 'student-name',
        type: 'text',
        content: '[Student Name]',
        x: 250,
        y: 160,
        width: 300,
        height: 40,
        fontSize: 24,
        color: '#374151',
        fontWeight: 'bold'
      },
      {
        id: 'custom-text',
        type: 'text',
        content: templateData.customText,
        x: 200,
        y: 220,
        width: 400,
        height: 30,
        fontSize: 16,
        color: '#374151'
      },
      {
        id: 'course-name',
        type: 'text',
        content: '[Course Name]',
        x: 250,
        y: 260,
        width: 300,
        height: 30,
        fontSize: 20,
        color: '#3B82F6',
        fontWeight: 'bold'
      },
      {
        id: 'organization-date',
        type: 'text',
        content: 'Awarded on [Date] by [Organization]',
        x: 200,
        y: 320,
        width: 400,
        height: 30,
        fontSize: 16,
        color: '#6B7280'
      },
      {
        id: 'credential-id',
        type: 'text',
        content: 'Credential ID: [ID]',
        x: 200,
        y: 400,
        width: 400,
        height: 20,
        fontSize: 12,
        color: '#1e40af'
      }
    ];

    // Add logo element if logoUrl exists
    if (templateData.logoUrl) {
      elements.push({
        id: 'logo',
        type: 'image',
        content: templateData.logoUrl,
        x: 30,
        y: 30,
        width: 100,
        height: 100
      });
    }

    return elements;
  };

  const handleGenerateCertificate = async (courseId: string, studentId: string) => {
    try {
      // TODO: Replace with real API call to POST /api/certificates
      toast.success('Certificate generated successfully');
    } catch (error) {
      toast.error('Failed to generate certificate');
    }
  };

  const handlePreviewExistingTemplate = async (template: CertificateTemplate) => {
    try {
      setIsGeneratingPreview(true);
      
      const certificateData = {
        studentName: 'John Student',
        courseName: template.courseTitle || 'Sample Course',
        organizationName: user?.organizationDetails?.name || 'Your Organization',
        completionDate: new Date(),
        issueDate: new Date(),
        credentialId: 'CERT-PREVIEW-001',
        verificationUrl: `${window.location.origin}/verify/CERT-PREVIEW-001`
      };

      const design = {
        id: 'preview',
        name: 'Preview Design',
        template: template.borderStyle as any,
        backgroundColor: template.backgroundColor,
        primaryColor: template.primaryColor,
        accentColor: template.accentColor,
        textColor: template.textColor,
        borderStyle: template.borderStyle,
        fontFamily: template.fontFamily,
        fontSize: { title: 36, subtitle: 24, body: 16, footer: 12 },
        layout: {
          orientation: 'landscape' as const,
          width: 800,
          height: 600,
          margins: { top: 50, right: 50, bottom: 50, left: 50 }
        },
        borderColor: template.borderColor,
        backgroundUrl: template.backgroundUrl,
        logo: template.logoUrl ? {
          url: template.logoUrl,
          width: 100,
          height: 100,
          position: 'top-left' as const
        } : undefined
      };

      const url = await certificateService.generateCertificate(certificateData, design);
      setPreviewUrl(url);
      setShowPreviewModal(true);
    } catch (error) {
      toast.error('Failed to generate preview');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handlePreviewCertificate = async () => {
    try {
      setIsGeneratingPreview(true);
      
      const certificateData = {
        studentName: 'John Student',
        courseName: getCourseTitle(templateData.courseId) || 'Sample Course',
        organizationName: user?.organizationDetails?.name || 'Your Organization',
        completionDate: new Date(),
        issueDate: new Date(),
        credentialId: 'CERT-PREVIEW-001',
        verificationUrl: `${window.location.origin}/verify/CERT-PREVIEW-001`
      };

      const design = {
        id: 'preview',
        name: 'Preview Design',
        template: templateData.borderStyle as any,
        backgroundColor: templateData.accentColor,
        primaryColor: templateData.textColor,
        accentColor: templateData.accentColor,
        textColor: templateData.textColor,
        borderStyle: templateData.borderStyle,
        fontFamily: templateData.fontFamily,
        fontSize: { title: 36, subtitle: 24, body: 16, footer: 12 },
        layout: {
          orientation: 'landscape' as const,
          width: 800,
          height: 600,
          margins: { top: 50, right: 50, bottom: 50, left: 50 }
        },
        borderColor: templateData.borderStyle,
        backgroundUrl: templateData.backgroundUrl,
        logo: templateData.logoUrl ? {
          url: templateData.logoUrl,
          width: 100,
          height: 100,
          position: 'top-left' as const
        } : undefined
      };

      const url = await certificateService.generateCertificate(certificateData, design);
      setPreviewUrl(url);
      setShowPreviewModal(true);
    } catch (error) {
      toast.error('Failed to generate preview');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBackgroundFile(file);
      // For preview purposes, create a local URL
      const localUrl = URL.createObjectURL(file);
      setTemplateData(prev => ({ ...prev, backgroundUrl: localUrl }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      // For preview purposes, create a local URL
      const localUrl = URL.createObjectURL(file);
      setTemplateData(prev => {
        // Check if logo element already exists
        const logoElementIndex = prev.elements.findIndex(el => el.id === 'logo');
        
        if (logoElementIndex >= 0) {
          // Update existing logo element
          const updatedElements = [...prev.elements];
          updatedElements[logoElementIndex] = {
            ...updatedElements[logoElementIndex],
            content: localUrl
          };
          
          return {
            ...prev,
            logoUrl: localUrl,
            elements: updatedElements
          };
        } else {
          // Add new logo element
          const newLogoElement: CertificateElement = {
            id: 'logo',
            type: 'image',
            content: localUrl,
            x: 20,
            y: 20,
            width: 80,
            height: 80
          };
          
          return {
            ...prev,
            logoUrl: localUrl,
            elements: [...prev.elements, newLogoElement]
          };
        }
      });
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const element = templateData.elements.find(el => el.id === elementId);
    if (element) {
      setDragOffset({
        x: e.clientX - element.x,
        y: e.clientY - element.y
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    
    setTemplateData(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === selectedElement 
          ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) } 
          : el
      )
    }));
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleElementResize = (elementId: string, width: number, height: number) => {
    setTemplateData(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId 
          ? { ...el, width: Math.max(20, width), height: Math.max(10, height) } 
          : el
      )
    }));
  };

  const handleElementFontSizeChange = (elementId: string, fontSize: number) => {
    setTemplateData(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId 
          ? { ...el, fontSize: Math.max(8, fontSize) } 
          : el
      )
    }));
  };

  const handleElementContentChange = (elementId: string, content: string) => {
    setTemplateData(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId 
          ? { ...el, content } 
          : el
      )
    }));
  };

  console.log('Courses in CertificateManagement:', courses);

const getCourseTitle = (id: string) => {
  const course = courses.find(c => c.id === id);
  return course?.title ?? 'Unknown Course';
};





  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Certificate Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Design certificate templates and generate certificates for students
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTemplate(null);
            resetTemplateData();
            setTemplateData(prev => ({
              ...prev,
              elements: getDefaultElements(),
            }));
            setShowTemplateModal(true);
          }}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Certificate Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {  isFetchingTemplates ? (<p className="text-gray-500">Loading certificate templates…</p>): templates.length === 0 ? (<p className="text-gray-500">No certificate templates created yet.</p>) : templates.map(template => (
          <Card key={template.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${template.primaryColor}20` }}
                >
                  <TrophyIcon className="h-6 w-6" style={{ color: template.primaryColor }} />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {template.courseTitle ?? "unknown course"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Background:</span>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: template.backgroundColor }}
                    />
                    <span className="text-gray-900 dark:text-white font-mono text-xs">
                      {template.backgroundColor}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Primary Color:</span>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: template.primaryColor }}
                    />
                    <span className="text-gray-900 dark:text-white font-mono text-xs">
                      {template.primaryColor}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePreviewExistingTemplate(template)}
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Preview
                </Button> */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditTemplate(template)}
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {/* <Button size="sm">
                  <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                  Generate
                </Button> */}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create Template Card */}
        <Card
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          onClick={() => {
            setEditingTemplate(null);
            resetTemplateData();
            setTemplateData(prev => ({
              ...prev,
              elements: getDefaultElements(),
            }));
            setShowTemplateModal(true);
          }}
        >
          <CardContent className="p-6 cursor-pointer">
            <div className="text-center">
              <PlusIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Create New Template
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Design a certificate template for your courses
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setEditingTemplate(null);
          setBackgroundFile(null);
          setLogoFile(null);
          resetTemplateData();
        }}
        title={editingTemplate ? 'Edit Certificate Template' : 'Create Certificate Template'}
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Template Name"
              value={templateData.name}
              onChange={e => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., React Course Certificate"
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Course
              </label>
              <select
                value={templateData.courseId}
                onChange={e => setTemplateData(prev => ({ ...prev, courseId: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600
             rounded-lg shadow-sm bg-white dark:bg-gray-800
             text-gray-900 dark:text-white
             focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="text-gray-900 bg-white">
                  Select a course
                </option>

                {courses.map(course => (
                  <option
                    key={course.id}
                    value={course.id}
                    className="text-gray-900 bg-white"
                  >
                    {course.title ?? "Untitled Course"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Background Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={templateData.accentColor}
                  onChange={e =>
                    setTemplateData(prev => ({ ...prev, accentColor: e.target.value }))
                  }
                  className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <Input
                  value={templateData.accentColor}
                  onChange={e =>
                    setTemplateData(prev => ({ ...prev, accentColor: e.target.value }))
                  }
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={templateData.textColor}
                  onChange={e =>
                    setTemplateData(prev => ({ ...prev, textColor: e.target.value }))
                  }
                  className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <Input
                  value={templateData.textColor}
                  onChange={e =>
                    setTemplateData(prev => ({ ...prev, textColor: e.target.value }))
                  }
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Accent Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={templateData.accentColor}
                  onChange={e =>
                    setTemplateData(prev => ({ ...prev, accentColor: e.target.value }))
                  }
                  className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <Input
                  value={templateData.accentColor}
                  onChange={e =>
                    setTemplateData(prev => ({ ...prev, accentColor: e.target.value }))
                  }
                  placeholder="#1e40af"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Text Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={templateData.textColor}
                  onChange={e => setTemplateData(prev => ({ ...prev, textColor: e.target.value }))}
                  className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <Input
                  value={templateData.textColor}
                  onChange={e => setTemplateData(prev => ({ ...prev, textColor: e.target.value }))}
                  placeholder="#374151"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Border Style
              </label>
              <select
                value={templateData.borderStyle}
                onChange={e =>
                  setTemplateData(prev => ({ ...prev, borderStyle: e.target.value as any }))
                }
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="none">None</option>
                <option value="simple">Simple</option>
                <option value="ornate">Ornate</option>
                <option value="modern">Modern</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Font Family
              </label>
              <select
                value={templateData.fontFamily}
                onChange={e => setTemplateData(prev => ({ ...prev, fontFamily: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Roboto">Roboto</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Merriweather">Merriweather</option>
                <option value="Lora">Lora</option>
                <option value="Open Sans">Open Sans</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Custom Text
            </label>
            <textarea
              value={templateData.customText}
              onChange={e => {
                setTemplateData(prev => ({ ...prev, customText: e.target.value }));
                // Update the custom text element
                const customTextElement = templateData.elements.find(el => el.id === 'custom-text');
                if (customTextElement) {
                  handleElementContentChange('custom-text', e.target.value);
                }
              }}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Text that appears on the certificate"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Background Image (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                <PhotoIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Upload a custom background image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="hidden"
                  id="background-upload"
                />
                <label htmlFor="background-upload">
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    Choose File
                  </Button>
                </label>
                {backgroundFile && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Selected: {backgroundFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Logo Upload (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                <PhotoIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Upload organization logo
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    Choose File
                  </Button>
                </label>
                {logoFile && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Selected: {logoFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Certificate Editor */}
          <div
            className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${isFullscreen ? 'fixed inset-0 z-50 overflow-auto' : ''}`}
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Certificate Editor</h4>
              <div className="flex space-x-2">
                {isFullscreen && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setIsFullscreen(false);
                      toast.success('Certificate design saved successfully');
                    }}
                  >
                    Save & Exit
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? (
                    <>
                      <ArrowsPointingInIcon className="h-4 w-4 mr-1" />
                      Exit Fullscreen
                    </>
                  ) : (
                    <>
                      <ArrowsPointingOutIcon className="h-4 w-4 mr-1" />
                      Fullscreen
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className={`flex flex-col gap-6 ${isFullscreen ? 'h-[calc(100vh-120px)]' : ''}`}>
              {/* Canvas Area - Made larger with better aspect ratio */}
              <div
                ref={canvasRef}
                className={`relative border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white overflow-hidden shadow-lg ${isFullscreen ? 'h-3/4' : 'h-[500px]'}`}
                style={{
                  backgroundColor: templateData.accentColor,
                  backgroundImage: templateData.backgroundUrl
                    ? `url(${templateData.backgroundUrl})`
                    : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              >
                {templateData.elements.map(element => (
                  <div
                    key={element.id}
                    className={`absolute border-2 ${
                      selectedElement === element.id
                        ? 'border-blue-500'
                        : 'border-transparent hover:border-gray-300'
                    } cursor-move`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      color: element.color || templateData.textColor,
                      fontSize: element.fontSize,
                      fontWeight: element.fontWeight,
                      fontFamily: templateData.fontFamily,
                    }}
                    onMouseDown={e => handleElementMouseDown(e, element.id)}
                  >
                    {element.type === 'text' ? (
                      <div className="w-full h-full flex items-center justify-center p-1">
                        {element.content}
                      </div>
                    ) : (
                      <img
                        src={element.content}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    )}

                    {selectedElement === element.id && (
                      <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-blue-500 rounded-full cursor-se-resize border-2 border-white shadow"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Properties Panel - Now below the certificate */}
              <div className="space-y-4">
                <h5 className="font-medium text-gray-900 dark:text-white">Element Properties</h5>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Properties Form */}
                  <div className="lg:col-span-2">
                    {selectedElement ? (
                      <div className="space-y-4 bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Content
                          </label>
                          <Input
                            value={
                              templateData.elements.find(el => el.id === selectedElement)
                                ?.content || ''
                            }
                            onChange={e =>
                              handleElementContentChange(selectedElement, e.target.value)
                            }
                            placeholder="Element content"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Font Size
                          </label>
                          <input
                            type="range"
                            min="8"
                            max="72"
                            value={
                              templateData.elements.find(el => el.id === selectedElement)
                                ?.fontSize || 16
                            }
                            onChange={e =>
                              handleElementFontSizeChange(selectedElement, parseInt(e.target.value))
                            }
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                            {templateData.elements.find(el => el.id === selectedElement)
                              ?.fontSize || 16}
                            px
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Width
                            </label>
                            <Input
                              type="number"
                              value={
                                templateData.elements.find(el => el.id === selectedElement)
                                  ?.width || 100
                              }
                              onChange={e =>
                                handleElementResize(
                                  selectedElement,
                                  parseInt(e.target.value),
                                  templateData.elements.find(el => el.id === selectedElement)
                                    ?.height || 50
                                )
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Height
                            </label>
                            <Input
                              type="number"
                              value={
                                templateData.elements.find(el => el.id === selectedElement)
                                  ?.height || 50
                              }
                              onChange={e =>
                                handleElementResize(
                                  selectedElement,
                                  templateData.elements.find(el => el.id === selectedElement)
                                    ?.width || 100,
                                  parseInt(e.target.value)
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Reset selected element position to default
                              const element = templateData.elements.find(
                                el => el.id === selectedElement
                              );
                              if (element) {
                                const defaultElements = getDefaultElements();
                                const defaultElement = defaultElements.find(
                                  el => el.id === selectedElement
                                );
                                if (defaultElement) {
                                  setTemplateData(prev => ({
                                    ...prev,
                                    elements: prev.elements.map(el =>
                                      el.id === selectedElement
                                        ? { ...el, x: defaultElement.x, y: defaultElement.y }
                                        : el
                                    ),
                                  }));
                                }
                              }
                            }}
                          >
                            Reset Position
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow text-center">
                        <ArrowsPointingInIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-300">
                          Select an element on the certificate to edit its properties
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Canvas Controls */}
                  <div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                      <h6 className="font-medium text-gray-900 dark:text-white mb-2">
                        Canvas Controls
                      </h6>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Center all elements
                            setTemplateData(prev => ({
                              ...prev,
                              elements: prev.elements.map(el => ({
                                ...el,
                                x: (800 - el.width) / 2,
                                y:
                                  el.id === 'title'
                                    ? 80
                                    : el.id === 'student-name'
                                      ? 160
                                      : el.id === 'custom-text'
                                        ? 220
                                        : el.id === 'course-name'
                                          ? 260
                                          : el.id === 'organization-date'
                                            ? 320
                                            : el.id === 'credential-id'
                                              ? 400
                                              : el.id === 'logo'
                                                ? 30
                                                : el.y,
                              })),
                            }));
                          }}
                        >
                          Center Elements
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
  <Button
    variant="outline"
    onClick={() => {
      setShowTemplateModal(false);
      setEditingTemplate(null);
      setBackgroundFile(null);
      setLogoFile(null);
      resetTemplateData();
    }}
    disabled={isCreatingTemplate || isUpdatingTemplate}
  >
    Cancel
  </Button>

  {/* <Button
    variant="outline"
    onClick={handlePreviewCertificate}
    disabled={isCreatingTemplate || isUpdatingTemplate || isGeneratingPreview}
  >
    {isGeneratingPreview ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
        Generating...
      </>
    ) : (
      <>
        <EyeIcon className="h-4 w-4 mr-2" />
        Preview
      </>
    )}
  </Button> */}

  <Button
    onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
    disabled={isCreatingTemplate || isUpdatingTemplate}
  >
    {isCreatingTemplate || isUpdatingTemplate
      ? editingTemplate
        ? 'Updating...'
        : 'Creating...'
      : editingTemplate
        ? 'Update Template'
        : 'Create Template'}
  </Button>
</div>
      </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
        }}
        title="Certificate Preview"
        size="xl"
      >
        <div className="space-y-6">
          {isGeneratingPreview ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Generating preview...</span>
            </div>
          ) : previewUrl ? (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center p-4">
                <img 
                  src={previewUrl} 
                  alt="Certificate Preview" 
                  className="max-w-full h-auto shadow-lg"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPreviewModal(false);
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = previewUrl;
                    link.download = 'certificate-preview.png';
                    link.click();
                  }}
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Failed to generate preview</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}