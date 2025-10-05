import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import toast from 'react-hot-toast';

interface AnnouncementFormProps {
  courseId: string;
  onAnnouncementSent?: () => void;
}

export const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ 
  courseId, 
  onAnnouncementSent 
}) => {
  const { sendCourseAnnouncement, loading } = useAnnouncements();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const success = await sendCourseAnnouncement(courseId, title, message);
    
    if (success) {
      toast.success('Announcement sent to students!');
      setTitle('');
      setMessage('');
      onAnnouncementSent?.();
    } else {
      toast.error('Failed to send announcement');
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Send Announcement to Students
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Notify all students enrolled in this course
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
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading || !title.trim() || !message.trim()}
            >
              {loading ? 'Sending...' : 'Send to Students'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};