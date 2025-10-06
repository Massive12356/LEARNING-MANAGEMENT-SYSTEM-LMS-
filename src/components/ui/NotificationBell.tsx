import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BellIcon, BellAlertIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { XMarkIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification, NotificationType } from '../../types';
import { NotificationModal } from '../notifications/NotificationModal';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    case 'error':
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    case 'announcement':
      return <BellAlertIcon className="h-5 w-5 text-blue-500" />;
    default:
      return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
    case 'error':
      return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
    case 'announcement':
      return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    default:
      return 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600';
  }
};

// Function to check if a notification should be shown based on settings
const shouldShowNotification = (notification: Notification, settings: any) => {
  // If no settings, show all notifications
  if (!settings) return true;

  // Check notification type and match with settings
  switch (notification.type) {
    case 'announcement':
      // Course updates and general announcements
      if (notification.message.includes('course') || notification.message.includes('Course')) {
        return settings.courseUpdates;
      }
      return true; // Other announcements always shown
    case 'success':
      // Certificate notifications
      if (notification.title.includes('Certificate') || notification.message.includes('certificate')) {
        return settings.certificateNotifications;
      }
      return true;
    case 'warning':
      // Assignment reminders
      if (notification.message.includes('assignment') || notification.message.includes('Assignment') || 
          notification.message.includes('deadline') || notification.message.includes('Deadline')) {
        return settings.assignmentReminders;
      }
      return true;
    default:
      return true;
  }
};

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markMultipleAsRead, archiveNotification } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notificationSettings, setNotificationSettings] = useState<any>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load notification settings
  useEffect(() => {
    if (user) {
      const savedSettings = localStorage.getItem(`notification_settings_${user.id}`);
      if (savedSettings) {
        try {
          setNotificationSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error('Error loading notification settings:', error);
        }
      }
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications based on settings
  const filteredNotifications = notifications.filter(notification => 
    shouldShowNotification(notification, notificationSettings)
  );

  // Filter to show only recent notifications (last 10)
  const recentNotifications = filteredNotifications.slice(0, 10);
  const unreadNotifications = recentNotifications.filter(n => n.status === 'unread');

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    // Mark as read when opening the modal
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = unreadNotifications.map(n => n.id);
    if (unreadIds.length > 0) {
      markMultipleAsRead(unreadIds);
    }
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleArchive = (id: string) => {
    archiveNotification(id);
    setIsOpen(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Count of unread notifications that should be shown based on settings
  const visibleUnreadCount = filteredNotifications.filter(n => n.status === 'unread').length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <BellIcon className="h-6 w-6" />
        {visibleUnreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
              {unreadNotifications.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentNotifications.map((notification) => (
                  <li 
                    key={notification.id} 
                    className={`p-4 ${notification.status === 'unread' ? 'bg-blue-50 dark:bg-blue-900/10' : ''} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${notification.status === 'unread' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                            {notification.title}
                          </p>
                          <div className="relative">
                            <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
                              <EllipsisHorizontalIcon className="h-5 w-5" />
                            </button>
                            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden">
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                              >
                                Mark as read
                              </button>
                              <button
                                onClick={() => handleArchive(notification.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                              >
                                Archive
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(notification.createdAt)}
                            {notification.senderName && (
                              <span> • From {notification.senderName}</span>
                            )}
                          </p>
                          {notification.status === 'unread' && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {recentNotifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  const basePath = user?.role === 'teacher' ? '/teacher' : 
                                  user?.role === 'admin' ? '/admin' : 
                                  '/student';
                  const path = user?.role === 'teacher' || user?.role === 'admin' 
                    ? `${basePath}/notifications/list` 
                    : `${basePath}/notifications`;
                  navigate(path);
                }}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        notification={selectedNotification as any}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMarkAsRead={selectedNotification?.status === 'unread' ? () => {
          if (selectedNotification) {
            markAsRead(selectedNotification.id);
            setIsModalOpen(false);
          }
        } : undefined}
        onArchive={() => {
          if (selectedNotification) {
            archiveNotification(selectedNotification.id);
            setIsModalOpen(false);
          }
        }}
      />
    </div>
  );
};