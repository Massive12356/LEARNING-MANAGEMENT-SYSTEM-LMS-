import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmailTemplate } from '../../types';
import { FrontendTemplateType } from '../../utils/emialConverter';
import { 
  EnvelopeIcon,
  EyeIcon,
  DocumentTextIcon,
  UserIcon,
  KeyIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import {Organization} from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { organizationService } from '../../services/organizationService';

export function EmailTemplateEditor() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { user: currentUser, viewAsUser } = useAuthStore();
  const [organization, setOrganization] = useState<Organization | null>(null); 

  const [templateData, setTemplateData] = useState({
    subject: '',
    body: ''
  });

 const templateTypes: {
   type: FrontendTemplateType;
   name: string;
   description: string;
   audience: string;
   icon: any;
   variables: string[];
 }[] = [
   {
     type: 'welcome',
     name: 'Welcome & Registration Confirmation',
     description: 'Sent immediately upon successful user signup',
     audience: 'Students (New Users)',
     icon: UserIcon,
     variables: ['firstName', 'organizationName', 'email', 'loginUrl'],
   },
   {
     type: 'password-reset',
     name: 'Password Reset Request',
     description: 'Sent when a user initiates the password reset process',
     audience: 'Students',
     icon: KeyIcon,
     variables: ['firstName', 'organizationName', 'resetLink', 'email'],
   },
   {
     type: 'account-verification',
     name: 'Account Activation/Verification',
     description: 'Sent if email verification is required post-registration',
     audience: 'Students',
     icon: ShieldCheckIcon,
     variables: ['firstName', 'organizationName', 'verificationLink', 'email'],
   },
   {
     type: 'account-deactivation',
     name: 'Account Deactivation/Suspension',
     description: 'Sent to notify a user of account status change (e.g., non-payment, policy violation)',
     audience: 'Students',
     icon: UserMinusIcon,
     variables: ['firstName', 'organizationName', 'deactivationReason', 'reactivationPolicy', 'supportContact'],
   },
   {
     type: 'course-completion',
     name: 'Course Completion',
     description: 'Sent when users complete a course',
     audience: 'Students',
     icon: AcademicCapIcon,
     variables: ['firstName', 'courseName', 'organizationName', 'certificateAvailable', 'certificateLink'],
   },
 ];

  useEffect(() => {
    loadTemplates();
    loadOrganization();
  }, []);

  const loadTemplates = async () => {
    try {
      const templatesData = await Promise.all(
        templateTypes.map(async t => {
          try {
            return await adminService.getEmailTemplate(t.type);
          } catch (err) {
            // If template doesn't exist, return a default template
            return {
              id: `default-${t.type}`,
              type: t.type,
              subject: `Default ${t.name} Subject`,
              body: `Dear {{firstName}},

This is a default template for ${t.name}.

Organization: {{organizationName}}

You can customize this template using the available variables:
${t.variables.map(v => `{{${v}}}`).join(', ')}`,
              variables: t.variables,
              organizationId: currentUser?.organizationDetails?.id
            } as EmailTemplate;
          }
        })
      );
      setTemplates(templatesData);

      if (templatesData.length > 0) selectTemplate(templatesData[0]);
    } catch (err: any) {
      console.error(err?.message || 'Failed to load email templates:');
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const loadOrganization = async () => {
      if (!currentUser?.organizationDetails?.id) return;
  
      try {
        const orgData = await organizationService.getOrganizationById(
          String(currentUser.organizationDetails?.id)
        );
        setOrganization(orgData);
        console.log('EMAIL TEMPLATE', orgData)
      } catch (error) {
        console.error('Failed to load organization:', error);
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
      // Merge templateData with selectedTemplate
      const payload: EmailTemplate = {
        ...selectedTemplate,
        subject: templateData.subject,
        body: templateData.body,
      };

      const updatedTemplate = await adminService.updateEmailTemplate(payload);

      // Update local state
      setTemplates(prev => prev.map(t => (t.id === updatedTemplate.id ? updatedTemplate : t)));
      setSelectedTemplate(updatedTemplate);

      toast.success('Email template saved successfully');
    } catch (err:any) {
      console.error( err?.message||'Failed to save template:');
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
      organizationName: organization?.name || 'TechEd Academy',
      email: 'john.doe@example.com',
      loginUrl: 'https://example.com/login',
      resetLink: 'https://example.com/reset-password/token123',
      verificationLink: 'https://example.com/verify-email/token456',
      deactivationReason: 'non-payment',
      reactivationPolicy: 'Accounts can be reactivated by contacting support and settling outstanding balances',
      supportContact: 'support@techedacademy.com',
      courseName: 'Complete React Development Course',
      certificateAvailable: 'true',
      certificateLink: 'https://example.com/certificates/course-completion-123'
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Email Template Editor
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Customize email templates sent to users for various system events
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Template List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Email Templates
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Select a template to customize
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {templateTypes.map((templateType) => {
                  const template = templates.find(t => t.type === templateType.type);
                  const Icon = templateType.icon;
                  const isSelected = selectedTemplate?.type === templateType.type;
                  
                  return (
                    <button
                      key={templateType.type}
                      onClick={() => template && selectTemplate(template)}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg m-2 ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'border border-gray-200 dark:border-gray-700'
                      }`}
                      disabled={!template}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium ${
                            isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {templateType.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {templateType.description}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                              {templateType.audience}
                            </span>
                            {!template && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                Not initialized
                              </span>
                            )}
                          </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {templateTypes.find(t => t.type === selectedTemplate.type)?.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {templateTypes.find(t => t.type === selectedTemplate.type)?.description}
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                      Audience: {templateTypes.find(t => t.type === selectedTemplate.type)?.audience}
                    </span>
                  </div>
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This is how your email will appear to recipients
                    </p>
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
                      <div 
                        className="prose prose-sm max-w-none text-gray-900 dark:text-white"
                        dangerouslySetInnerHTML={{ __html: preview.body.replace(/\n/g, '<br>') }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Edit Mode */
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Template Content
                      </h3>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                          rows={15}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                          placeholder="Enter email content..."
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          {selectedTemplate && selectedTemplate.variables.map((variable) => (
                            <button
                              key={variable}
                              onClick={() => insertVariable(variable)}
                              className="w-full text-left p-3 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-between"
                            >
                              <span className="font-medium text-gray-900 dark:text-white">{variable}</span>
                              <code className="text-blue-600 dark:text-blue-400 text-xs">
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
                        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-start space-x-3">
                            <DocumentTextIcon className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <p>Use variables like <code className="text-blue-600 dark:text-blue-400">{'{{firstName}}'}</code> to personalize emails</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <EnvelopeIcon className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <p>Keep subject lines under 50 characters for better deliverability</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <EyeIcon className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <p>Use the preview mode to see how your email will look to recipients</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <UserIcon className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <p>Test your templates with different user data to ensure proper formatting</p>
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
                <EnvelopeIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Select a Template
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Choose an email template from the list to start editing. Each template serves a specific purpose in your user communication workflow.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}