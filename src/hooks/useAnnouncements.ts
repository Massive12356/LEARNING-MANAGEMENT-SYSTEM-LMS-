import { useState } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

export const useAnnouncements = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const sendCourseAnnouncement = async (
    courseId: string,
    title: string,
    message: string
  ) => {
    if (!user) return;
    
    setLoading(true);
    try {
      notificationService.createTeacherAnnouncement(
        courseId,
        title,
        message,
        user.id,
        `${user.firstName} ${user.lastName}`
      );
      return true;
    } catch (error) {
      console.error('Failed to send announcement:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendAdminAnnouncement = async (
    title: string,
    message: string,
    role?: string
  ) => {
    if (!user) return;
    
    setLoading(true);
    try {
      notificationService.createAdminAnnouncement(
        title,
        message,
        user.id,
        `${user.firstName} ${user.lastName}`,
        role as any
      );
      return true;
    } catch (error) {
      console.error('Failed to send admin announcement:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    sendCourseAnnouncement,
    sendAdminAnnouncement
  };
};