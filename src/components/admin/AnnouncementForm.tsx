import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Dropdown } from '../ui/Dropdown';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { UserRole } from '../../types';
import toast from 'react-hot-toast';

export const AnnouncementForm: React.FC = () => {
  const { sendAdminAnnouncement, loading } = useAnnouncements();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'role'>('all');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const success = await sendAdminAnnouncement(
      title,
      message,
      recipientType === 'role' ? selectedRole : undefined
    );
    
    if (success) {
      toast.success('Announcement sent successfully!');
      setTitle('');
      setMessage('');
    } else {
      toast.error('Failed to send announcement');
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Send System Announcement
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Broadcast important updates to users across the platform
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Announcement Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter announcement title"
            required
          />
          
          <TextArea
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your announcement message"
            rows={4}
            required
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Dropdown
              label="Recipient Type"
              options={[
                { label: 'All Users', value: 'all' },
                { label: 'Specific Role', value: 'role' },
              ]}
              value={recipientType}
              onChange={(value) => setRecipientType(value as any)}
            />
            
            {recipientType === 'role' && (
              <Dropdown
                label="Select Role"
                options={[
                  { label: 'Students', value: 'student' },
                  { label: 'Teachers', value: 'teacher' },
                  { label: 'Admins', value: 'admin' },
                ]}
                value={selectedRole}
                onChange={(value) => setSelectedRole(value as UserRole)}
              />
            )}
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading || !title.trim() || !message.trim()}
            >
              {loading ? 'Sending...' : 'Send Announcement'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};