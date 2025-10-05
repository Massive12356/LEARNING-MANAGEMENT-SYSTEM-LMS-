import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { mockApi } from '../../services/mockApi';
import { EmailTemplate } from '../../types';
import { 
  EnvelopeIcon,
  EyeIcon,
  DocumentTextIcon,
  UserIcon,
  KeyIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function EmailTemplateEditor() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [templateData, setTemplateData] = useState({
    subject: '',
    body: ''
  });

  const templateTypes = [
    {
      type: 'welcome',
      name: 'Welcome Email',
      description: 'Sent to new users after registration',
      icon: UserIcon,
      variables: ['firstName', 'lastName', 'organizationName', 'email']
    },
    {
      type: 'password-reset',
      name: 'Password Reset',
      description: 'Sent when users request password reset',
      icon: KeyIcon,
      variables: ['firstName', 'organizationName', 'resetLink', 'email']
    },
    {
      type: 'course-completion',
      name: 'Course Completion',
      description: 'Sent when users complete a course',
      icon: AcademicCapIcon,
      variables: ['firstName', 'courseName', 'organizationName', 'certificateAvailable']
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templatesData = await mockApi.getEmailTemplates();
      setTemplates(templatesData);
      
      // Select first template by default
      if (templatesData.length > 0) {
        selectTemplate(templatesData[0]);
      }
    } catch (error) {
      console.error('Failed to load email templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setTemplateData({
      subject: template.subject,
      body: template.body
    });
    setPreviewMode(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setSaving(true);
    try {
      await mockApi.updateEmailTemplate(selectedTemplate.id, templateData);
      
      // Update local state
      setTemplates(prev => prev.map(t => 
        t.id === selectedTemplate.id 
          ? { ...t, ...templateData }
          : t
      ));
      
      toast.success('Email template saved successfully');
    } catch (error) {
      toast.error('Failed to save email template');
    } finally {
      setSaving(false);
    }
  };

  const getPreviewContent = () => {
    if (!selectedTemplate) return { subject: '', body: '' };

    const sampleData: Record<string, string> = {
      firstName: 'John',
      lastName: 'Doe',
      organizationName: 'TechEd Academy',
      email: 'john.doe@example.com',
      resetLink: 'https://example.com/reset-password/token123',
      courseName: 'Complete React Development Course',
      certificateAvailable: 'true'
    };

    let previewSubject = templateData.subject;
    let previewBody = templateData.body;

    // Replace variables with sample data
    Object.entries(sampleData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      previewSubject = previewSubject.replace(new RegExp(placeholder, 'g'), value);
      previewBody = previewBody.replace(new RegExp(placeholder, 'g'), value);
    });

    return { subject: previewSubject, body: previewBody };
  };

  const insertVariable = (variable: string) => {
    const placeholder = `{{${variable}}}`;
    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = templateData.body;
      const before = text.substring(0, start);
      const after = text.substring(end);
      
      setTemplateData(prev => ({
        ...prev,
        body: before + placeholder + after
      }));
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const preview = getPreviewContent();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Email Template Editor
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Customize email templates sent to users for various system events
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Template List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Email Templates
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {templateTypes.map((templateType) => {
                  const template = templates.find(t => t.type === templateType.type);
                  const Icon = templateType.icon;
                  const isSelected = selectedTemplate?.type === templateType.type;
                  
                  return (
                    <button
                      key={templateType.type}
                      onClick={() => template && selectTemplate(template)}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${
                          isSelected ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium ${
                            isSelected ? 'text-blue-600' : 'text-gray-900 dark:text-white'
                          }`}>
                            {templateType.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {templateType.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          {selectedTemplate ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {templateTypes.find(t => t.type === selectedTemplate.type)?.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {templateTypes.find(t => t.type === selectedTemplate.type)?.description}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    {previewMode ? 'Edit' : 'Preview'}
                  </Button>
                  <Button onClick={handleSave} loading={saving}>
                    Save Template
                  </Button>
                </div>
              </div>

              {previewMode ? (
                /* Preview Mode */
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Email Preview
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Subject:
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {preview.subject}
                        </div>
                      </div>
                      <div className="whitespace-pre-line text-gray-900 dark:text-white">
                        {preview.body}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Edit Mode */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Template Content
                        </h3>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Input
                          label="Email Subject"
                          value={templateData.subject}
                          onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Enter email subject"
                        />

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Body
                          </label>
                          <textarea
                            id="email-body"
                            value={templateData.body}
                            onChange={(e) => setTemplateData(prev => ({ ...prev, body: e.target.value }))}
                            rows={12}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                            placeholder="Enter email content..."
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    {/* Available Variables */}
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Available Variables
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to insert into template
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedTemplate.variables.map((variable) => (
                            <button
                              key={variable}
                              onClick={() => insertVariable(variable)}
                              className="w-full text-left p-2 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <code className="text-blue-600 dark:text-blue-400">
                                {`{{${variable}}}`}
                              </code>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Template Tips */}
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Template Tips
                        </h3>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-start space-x-2">
                            <DocumentTextIcon className="h-4 w-4 mt-0.5 text-blue-600" />
                            <p>Use variables like <code className="text-blue-600">{'{{firstName}}'}</code> to personalize emails</p>
                          </div>
                          <div className="flex items-start space-x-2">
                            <EnvelopeIcon className="h-4 w-4 mt-0.5 text-blue-600" />
                            <p>Keep subject lines under 50 characters for better deliverability</p>
                          </div>
                          <div className="flex items-start space-x-2">
                            <EyeIcon className="h-4 w-4 mt-0.5 text-blue-600" />
                            <p>Use the preview mode to see how your email will look to recipients</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <EnvelopeIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a Template
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose an email template from the list to start editing
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}