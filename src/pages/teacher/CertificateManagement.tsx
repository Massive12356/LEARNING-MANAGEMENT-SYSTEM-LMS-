import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { mockApi } from '../../services/mockApi';
import { Course, Certificate } from '../../types';
import { 
  TrophyIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  DocumentArrowDownIcon,
  SwatchIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CertificateTemplate {
  id: string;
  courseId: string;
  name: string;
  backgroundColor: string;
  primaryColor: string;
  logoUrl?: string;
  customText: string;
}

export default function CertificateManagement() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);

  const [templateData, setTemplateData] = useState({
    courseId: '',
    name: '',
    backgroundColor: '#ffffff',
    primaryColor: '#3B82F6',
    customText: 'has successfully completed the course'
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [coursesData, templatesData] = await Promise.all([
        mockApi.getCourses({ teacherId: user.id }),
        mockApi.getCertificateTemplates(user.id)
      ]);
      
      setCourses(coursesData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load certificate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateData.courseId || !templateData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // TODO: Replace with real API call to POST /api/certificate-templates
      const newTemplate: CertificateTemplate = {
        id: `template-${Date.now()}`,
        ...templateData
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      setTemplateData({
        courseId: '',
        name: '',
        backgroundColor: '#ffffff',
        primaryColor: '#3B82F6',
        customText: 'has successfully completed the course'
      });
      setShowTemplateModal(false);
      toast.success('Certificate template created successfully');
    } catch (error) {
      toast.error('Failed to create certificate template');
    }
  };

  const handleGenerateCertificate = async (courseId: string, studentId: string) => {
    try {
      // TODO: Replace with real API call to POST /api/certificates
      await mockApi.generateCertificate(studentId, courseId);
      toast.success('Certificate generated successfully');
    } catch (error) {
      toast.error('Failed to generate certificate');
    }
  };

  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Unknown Course';
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
            Certificate Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Design certificate templates and generate certificates for students
          </p>
        </div>
        <Button onClick={() => setShowTemplateModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Certificate Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${template.primaryColor}20` }}
                >
                  <TrophyIcon 
                    className="h-6 w-6"
                    style={{ color: template.primaryColor }}
                  />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getCourseTitle(template.courseId)}
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
                <Button variant="outline" size="sm">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm">
                  <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create Template Card */}
        <Card 
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
          onClick={() => setShowTemplateModal(true)}
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
        onClose={() => setShowTemplateModal(false)}
        title={editingTemplate ? 'Edit Certificate Template' : 'Create Certificate Template'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Template Name"
              value={templateData.name}
              onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., React Course Certificate"
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Course
              </label>
              <select
                value={templateData.courseId}
                onChange={(e) => setTemplateData(prev => ({ ...prev, courseId: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
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
                  value={templateData.backgroundColor}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <Input
                  value={templateData.backgroundColor}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, backgroundColor: e.target.value }))}
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
                  value={templateData.primaryColor}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <Input
                  value={templateData.primaryColor}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Custom Text
            </label>
            <textarea
              value={templateData.customText}
              onChange={(e) => setTemplateData(prev => ({ ...prev, customText: e.target.value }))}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Text that appears on the certificate"
            />
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
              <Button variant="outline" size="sm">
                Choose File
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Certificate Preview
            </h4>
            <div 
              className="p-6 rounded-lg border-4 text-center"
              style={{ 
                backgroundColor: templateData.backgroundColor,
                borderColor: templateData.primaryColor 
              }}
            >
              <div className="mb-4">
                <h3 
                  className="text-2xl font-bold mb-2"
                  style={{ color: templateData.primaryColor }}
                >
                  CERTIFICATE OF COMPLETION
                </h3>
                <p className="text-gray-600">This is to certify that</p>
              </div>
              
              <div className="my-6">
                <div 
                  className="text-xl font-bold border-b-2 inline-block pb-1"
                  style={{ borderColor: templateData.primaryColor }}
                >
                  [Student Name]
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-2">{templateData.customText}</p>
                <p 
                  className="text-lg font-semibold"
                  style={{ color: templateData.primaryColor }}
                >
                  [{getCourseTitle(templateData.courseId) || 'Course Name'}]
                </p>
              </div>
              
              <div className="text-sm text-gray-500">
                Awarded on [Date] by [Organization]
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );

}