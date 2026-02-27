import { useState } from 'react';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  CogIcon,
  ServerIcon,
  ShieldCheckIcon,
  BellIcon,
  ServerStackIcon,
  CloudIcon,
  KeyIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const [systemConfig, setSystemConfig] = useState({
    platformName: 'LMS Platform',
    platformUrl: 'https://lms.example.com',
    supportEmail: 'support@lms.example.com',
    maxFileSize: '100',
    sessionTimeout: '24',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: '8',
    passwordRequireSpecialChars: true,
    maxLoginAttempts: '5',
    lockoutDuration: '30',
    twoFactorRequired: false,
    sessionSecure: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    systemAlerts: true,
    maintenanceNotifications: true,
    securityAlerts: true,
    performanceAlerts: true,
    emailNotifications: true,
    slackWebhook: ''
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: '30',
    backupLocation: 's3',
    encryptBackups: true
  });

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'database', name: 'Database', icon: ServerStackIcon },
    { id: 'storage', name: 'Storage', icon: CloudIcon },
    { id: 'api', name: 'API Keys', icon: KeyIcon }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('System settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <Input
              label="Platform Name"
              value={systemConfig.platformName}
              onChange={(e) => setSystemConfig(prev => ({ ...prev, platformName: e.target.value }))}
              helpText="The name displayed throughout the platform"
            />

            <Input
              label="Platform URL"
              value={systemConfig.platformUrl}
              onChange={(e) => setSystemConfig(prev => ({ ...prev, platformUrl: e.target.value }))}
              helpText="The primary URL for your platform"
            />

            <Input
              label="Support Email"
              type="email"
              value={systemConfig.supportEmail}
              onChange={(e) => setSystemConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
              helpText="Email address for user support inquiries"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max File Size (MB)"
                type="number"
                value={systemConfig.maxFileSize}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, maxFileSize: e.target.value }))}
              />

              <Input
                label="Session Timeout (hours)"
                type="number"
                value={systemConfig.sessionTimeout}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, sessionTimeout: e.target.value }))}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Maintenance Mode
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Temporarily disable access for maintenance
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemConfig.maintenanceMode}
                    onChange={(e) => setSystemConfig(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    User Registration
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow new users to register accounts
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemConfig.registrationEnabled}
                    onChange={(e) => setSystemConfig(prev => ({ ...prev, registrationEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Email Verification Required
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Require email verification for new accounts
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemConfig.emailVerificationRequired}
                    onChange={(e) => setSystemConfig(prev => ({ ...prev, emailVerificationRequired: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Password Min Length"
                type="number"
                value={securitySettings.passwordMinLength}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: e.target.value }))}
              />

              <Input
                label="Max Login Attempts"
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: e.target.value }))}
              />
            </div>

            <Input
              label="Lockout Duration (minutes)"
              type="number"
              value={securitySettings.lockoutDuration}
              onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: e.target.value }))}
              helpText="How long to lock accounts after max failed attempts"
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Require Special Characters
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Passwords must contain special characters
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.passwordRequireSpecialChars}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordRequireSpecialChars: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Two-Factor Authentication Required
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Require 2FA for all admin accounts
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorRequired}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorRequired: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Secure Sessions
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use secure cookies and HTTPS only
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.sessionSecure}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionSecure: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <Input
              label="Slack Webhook URL"
              value={notificationSettings.slackWebhook}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, slackWebhook: e.target.value }))}
              placeholder="https://hooks.slack.com/services/..."
              helpText="Optional: Receive system alerts in Slack"
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    System Alerts
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notifications for system issues and updates
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.systemAlerts}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, systemAlerts: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Security Alerts
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notifications for security events and breaches
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.securityAlerts}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, securityAlerts: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Performance Alerts
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Notifications for performance issues
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.performanceAlerts}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, performanceAlerts: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send notifications via email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Backup Frequency
                </label>
                <select
                  value={backupSettings.backupFrequency}
                  onChange={(e) => setBackupSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <Input
                label="Retention Days"
                type="number"
                value={backupSettings.retentionDays}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, retentionDays: e.target.value }))}
                helpText="How long to keep backups"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Backup Location
              </label>
              <select
                value={backupSettings.backupLocation}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, backupLocation: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="s3">Amazon S3</option>
                <option value="gcs">Google Cloud Storage</option>
                <option value="azure">Azure Blob Storage</option>
                <option value="local">Local Storage</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Automatic Backups
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enable scheduled automatic backups
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backupSettings.autoBackup}
                    onChange={(e) => setBackupSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Encrypt Backups
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Encrypt backup files for security
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backupSettings.encryptBackups}
                    onChange={(e) => setBackupSettings(prev => ({ ...prev, encryptBackups: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <ServerStackIcon className="h-4 w-4 mr-2" />
                Run Backup Now
              </Button>
              <Button variant="outline">
                <ServerIcon className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </div>
          </div>
        );

      case 'storage':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Storage Configuration
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Configure where files are stored and how they're managed.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Storage Provider
              </label>
              <select className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="s3">Amazon S3</option>
                <option value="gcs">Google Cloud Storage</option>
                <option value="azure">Azure Blob Storage</option>
                <option value="cloudinary">Cloudinary</option>
                <option value="local">Local Storage</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Bucket/Container Name"
                placeholder="my-lms-files"
              />
              <Input
                label="Region"
                placeholder="us-east-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Access Key ID"
                type="password"
                placeholder="••••••••••••••••"
              />
              <Input
                label="Secret Access Key"
                type="password"
                placeholder="••••••••••••••••"
              />
            </div>

            <Button variant="outline">
              <CloudIcon className="h-4 w-4 mr-2" />
              Test Storage Connection
            </Button>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                    API Key Security
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Keep your API keys secure and rotate them regularly. Never share them publicly.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    SendGrid API Key
                  </h4>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
                <Input
                  type="password"
                  value="SG.••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"
                  readOnly
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Used for sending transactional emails
                </p>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Stripe API Key
                  </h4>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
                <Input
                  type="password"
                  value="sk_live_••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"
                  readOnly
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Used for payment processing
                </p>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Analytics API Key
                  </h4>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
                <Input
                  type="password"
                  value="GA_••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"
                  readOnly
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Used for analytics and tracking
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative p-10 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-purple-200 text-sm font-medium">
                <CogIcon className="h-4 w-4 mr-2" />
                <span>Global Configuration</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                System Settings
              </h1>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                Configure platform-wide settings, security protocols, and system behavior.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                loading={saving}
                className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 border-none rounded-xl px-8 py-3 h-auto text-base font-medium"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 ${isActive
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                    <span className="font-medium">{tab.name}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-8 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                {tabs.find(tab => tab.id === activeTab)?.name} Settings
              </h2>
            </div>
            <div className="p-8 flex-1">
              {renderTabContent()}
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <Button
                onClick={handleSave}
                loading={saving}
                className="rounded-xl shadow-md"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}