import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Dropdown } from '../../components/ui/Dropdown';
import { mockApi } from '../../services/mockApi';
import { UserRole,CreateNotificationResponse } from '../../types';
import toast from 'react-hot-toast';
import { useNotificationStore } from '../../stores/notificationStore';

export interface DropdownProps {
  label: string;
  options: { label: string; value: string | number }[];
  value?: string | string[] | number | null; // ✅ allow array for multi-select
  onChange: (value: string | string[]) => void;
  multiple?: boolean; // ✅ optional prop to toggle multi-select mode
}

export const NotificationManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'All Users' | 'By Role' | 'By Course' | 'By User' | 'certificate'>('All Users');
  const [selectedRole, setSelectedRole] = useState<UserRole[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);

  const createNotification = useNotificationStore(state =>state.createNotification)

  // Get courses for the current user (teacher/admin)
  const [courses, setCourses] = useState<any[]>([]);
  
  React.useEffect(() => {
    const loadCourses = async () => {
      if (user) {
        try {
          const courseData = await mockApi.getCourses({ teacherId: user.id });
          setCourses(courseData);
        } catch (error) {
          console.error('Failed to load courses:', error);
        }
      }
    };
    
    loadCourses();
  }, [user]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res: CreateNotificationResponse = { success: false };
      
      switch (recipientType) {
        case 'All Users':
          res = await createNotification({
            title,
            message,
            type: notificationType as any,
            priority: priority as any,
            senderId: user?.id,
            senderName: `${user?.firstName} ${user?.lastName}`,
            recipientType,
          });
          break;

        case 'By Role':
          if (!selectedRole.length) {
            toast.error('Please select at least one role');
            return;
          }
          res = await createNotification({
            title,
            message,
            type: 'announcement',
            priority: priority as any,
            roles: selectedRole,
            senderId: user?.id,
            senderName: `${user?.firstName} ${user?.lastName}`,
            recipientType,
          });
          break;

        case 'By Course':
          if (!selectedCourse) {
            toast.error('Please select a course');
            return;
          }
          res = await createNotification({
            title,
            message,
            type: notificationType as any,
            priority: priority as any,
            courseId: selectedCourse,
            senderId: user?.id,
            senderName: `${user?.firstName} ${user?.lastName}`,
            recipientType,
          });
          break;

        case 'certificate':
          res = await createNotification({
            userId: selectedUser || 'student-1',
            title: 'Certificate Earned!',
            message:
              "Congratulations! You've earned a certificate for completing the course. Click to view and download your certificate.",
            type: 'success',
            priority: 'high',
            senderId: user?.id,
            senderName: `${user?.firstName} ${user?.lastName}`,
            recipientType,
          });
          break;

        case 'By User':
          if (!selectedUser) {
            toast.error('Please select a user');
            return;
          }
          res = await createNotification({
            userId: selectedUser,
            title,
            message,
            type: notificationType as any,
            priority: priority as any,
            senderId: user?.id,
            senderName: `${user?.firstName} ${user?.lastName}`,
            recipientType,
          });
          break;
      }

      // ✅ Toast based on result
      if (res.success) {
        toast.success(`✅ Notification sent successfully!`);

        // Reset form
        setTitle('');
        setMessage('');
        setSelectedRole([]);
        setSelectedCourse('');
        setSelectedUser('');
        setSelectedCertificate('');
        setNotificationType('info');
        setPriority('medium');
        setRecipientType('All Users');
      } else {
        toast.error(`❌ Failed to send notification: ${res.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      toast.error(error?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };



  

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Notification Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Send announcements and notifications to students, teachers, and other users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Notification
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter notification title"
                required
              />

              <Dropdown
                label="Notification Type"
                options={[
                  { label: 'Information', value: 'info' },
                  { label: 'Success', value: 'success' },
                  { label: 'Warning', value: 'warning' },
                  { label: 'Error', value: 'error' },
                  { label: 'Announcement', value: 'announcement' },
                ]}
                value={notificationType}
                onChange={value => setNotificationType(value as string)}
              />
            </div>

            <TextArea
              label="Message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Enter notification message"
              rows={4}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Dropdown
                label="Priority"
                options={[
                  { label: 'Low', value: 'low' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'High', value: 'high' },
                  { label: 'Urgent', value: 'urgent' },
                ]}
                value={priority}
                onChange={value => setPriority(value as string)}
              />

              <Dropdown
                label="Recipient Type"
                options={[
                  { label: 'All Users', value: 'All Users' },
                  { label: 'By Role', value: 'By Role' },
                  { label: 'By Course', value: 'By Course' },
                  { label: 'Certificate Notification', value: 'certificate' },
                  { label: 'Specific User', value: 'By User' },
                ]}
                value={recipientType}
                onChange={value => setRecipientType(value as any)}
              />
            </div>

            {recipientType === 'By Role' && (
              <Dropdown
                label="Select Role"
                options={[
                  { label: 'Students', value: 'student' },
                  { label: 'Teachers', value: 'teacher' },
                  { label: 'Admins', value: 'admin' },
                  { label: 'Superusers', value: 'superuser' },
                ]}
                value={selectedRole}
                onChange={value => setSelectedRole(value as UserRole[])}
                multiple // ✅ make it a multiselect
              />
            )}

            {recipientType === 'By Course' && courses.length > 0 && (
              <Dropdown
                label="Select Course"
                options={courses.map(course => ({
                  label: course.title,
                  value: course.id,
                }))}
                value={selectedCourse}
                onChange={value => setSelectedCourse(value as string)}
              />
            )}

            {recipientType === 'certificate' && (
              <>
                <Input
                  label="User ID (for demo purposes)"
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value)}
                  placeholder="Enter user ID"
                />
                <Input
                  label="Course Title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter course title"
                />
              </>
            )}

            {recipientType === 'By User' && (
              <Input
                label="User ID (for demo purposes)"
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                placeholder="Enter user ID"
              />
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Notification'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Notification Guidelines
          </h2>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <h3>When to use each notification type:</h3>
            <ul>
              <li>
                <strong>Information:</strong> General updates and informational messages
              </li>
              <li>
                <strong>Success:</strong> Confirmation of completed actions or achievements
              </li>
              <li>
                <strong>Warning:</strong> Important notices that require attention
              </li>
              <li>
                <strong>Error:</strong> System issues or problems that need resolution
              </li>
              <li>
                <strong>Announcement:</strong> Official announcements and policy updates
              </li>
            </ul>

            <h3>Recipient Guidelines:</h3>
            <ul>
              <li>
                <strong>All Users:</strong> System-wide notifications (use sparingly)
              </li>
              <li>
                <strong>By Role:</strong> Role-specific announcements (e.g., new teacher resources)
              </li>
              <li>
                <strong>By Course:</strong> Course-specific updates (e.g., schedule changes)
              </li>
              <li>
                <strong>Specific User:</strong> Personal notifications (e.g., grade updates)
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};