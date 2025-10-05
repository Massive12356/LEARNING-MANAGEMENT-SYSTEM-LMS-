import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Dropdown } from '../../components/ui/Dropdown';
import { mockApi } from '../../services/mockApi';
import { UserRole } from '../../types';
import toast from 'react-hot-toast';

export const NotificationManagement: React.FC = () => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'role' | 'course' | 'user' | 'certificate'>('all');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);

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
      // Create notification based on recipient type
      switch (recipientType) {
        case 'all':
          // For demo purposes, we'll create a global notification
          createNotification({
            title,
            message,
            type: notificationType as any,
            priority: priority as any,
            senderId: user?.id,
            senderName: `${user?.firstName} ${user?.lastName}`,
          });
          break;
          
        case 'role':
          // Create role-based announcement
          createNotification({
            title,
            message,
            type: 'announcement',
            priority: priority as any,
            role: selectedRole,
            senderId: user?.id,
            senderName: `${user?.firstName} ${user?.lastName}`,
          });
          break;
          
        case 'course':
          if (selectedCourse) {
            createNotification({
              title,
              message,
              type: notificationType as any,
              priority: priority as any,
              courseId: selectedCourse,
              senderId: user?.id,
              senderName: `${user?.firstName} ${user?.lastName}`,
            });
          }
          break;
          
        case 'certificate':
          // For demo purposes, we'll create a certificate notification
          createNotification({
            userId: selectedUser || 'student-1', // Default to demo student
            title: 'Certificate Earned!',
            message: 'Congratulations! You\'ve earned a certificate for completing the course. Click to view and download your certificate.',
            type: 'success',
            priority: 'high',
            senderId: user?.id,
            senderName: `${user?.firstName} ${user?.lastName}`,
          });
          break;
          
        case 'user':
          if (selectedUser) {
            createNotification({
              userId: selectedUser,
              title,
              message,
              type: notificationType as any,
              priority: priority as any,
              senderId: user?.id,
              senderName: `${user?.firstName} ${user?.lastName}`,
            });
          }
          break;
      }
      
      toast.success('Notification sent successfully!');
      // Reset form
      setTitle('');
      setMessage('');
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Management</h1>
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
                onChange={(e) => setTitle(e.target.value)}
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
                onChange={(value) => setNotificationType(value as string)}
              />
            </div>
            
            <TextArea
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
                onChange={(value) => setPriority(value as string)}
              />
              
              <Dropdown
                label="Recipient Type"
                options={[
                  { label: 'All Users', value: 'all' },
                  { label: 'By Role', value: 'role' },
                  { label: 'By Course', value: 'course' },
                  { label: 'Certificate Notification', value: 'certificate' },
                  { label: 'Specific User', value: 'user' },
                ]}
                value={recipientType}
                onChange={(value) => setRecipientType(value as any)}
              />
            </div>
            
            {recipientType === 'role' && (
              <Dropdown
                label="Select Role"
                options={[
                  { label: 'Students', value: 'student' },
                  { label: 'Teachers', value: 'teacher' },
                  { label: 'Admins', value: 'admin' },
                  { label: 'Superusers', value: 'superuser' },
                ]}
                value={selectedRole}
                onChange={(value) => setSelectedRole(value as UserRole)}
              />
            )}
            
            {recipientType === 'course' && courses.length > 0 && (
              <Dropdown
                label="Select Course"
                options={courses.map(course => ({
                  label: course.title,
                  value: course.id,
                }))}
                value={selectedCourse}
                onChange={(value) => setSelectedCourse(value as string)}
              />
            )}
            
            {recipientType === 'certificate' && (
              <>
                <Input
                  label="User ID (for demo purposes)"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  placeholder="Enter user ID"
                />
                <Input
                  label="Course Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter course title"
                />
              </>
            )}
            
            {recipientType === 'user' && (
              <Input
                label="User ID (for demo purposes)"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
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
              <li><strong>Information:</strong> General updates and informational messages</li>
              <li><strong>Success:</strong> Confirmation of completed actions or achievements</li>
              <li><strong>Warning:</strong> Important notices that require attention</li>
              <li><strong>Error:</strong> System issues or problems that need resolution</li>
              <li><strong>Announcement:</strong> Official announcements and policy updates</li>
            </ul>
            
            <h3>Recipient Guidelines:</h3>
            <ul>
              <li><strong>All Users:</strong> System-wide notifications (use sparingly)</li>
              <li><strong>By Role:</strong> Role-specific announcements (e.g., new teacher resources)</li>
              <li><strong>By Course:</strong> Course-specific updates (e.g., schedule changes)</li>
              <li><strong>Specific User:</strong> Personal notifications (e.g., grade updates)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};