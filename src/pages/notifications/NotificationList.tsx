import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { NotificationModal } from '../../components/notifications/NotificationModal';
import { 
  BellIcon, 
  BellAlertIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  ArchiveBoxIcon,
  CheckIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export const NotificationList: React.FC = () => {
  const { notifications, markAsRead, markMultipleAsRead, archiveNotification, unarchiveNotification, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return notification.status === 'unread';
    if (filter === 'read') return notification.status === 'read';
    if (filter === 'archived') return notification.status === 'archived';
    return true;
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleSelectNotification = (id: string) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(notificationId => notificationId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  const handleMarkSelectedAsRead = () => {
    if (selectedNotifications.length > 0) {
      markMultipleAsRead(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  const handleArchiveSelected = () => {
    selectedNotifications.forEach(id => archiveNotification(id));
    setSelectedNotifications([]);
  };

  const handleUnarchiveSelected = () => {
    selectedNotifications.forEach(id => unarchiveNotification(id));
    setSelectedNotifications([]);
  };

  const handleDeleteSelected = () => {
    selectedNotifications.forEach(id => deleteNotification(id));
    setSelectedNotifications([]);
  };

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    // Mark as read when opening the modal
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }
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

  const getNotificationIcon = (type: string) => {
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

  const getNotificationColor = (status: string) => {
    if (status === 'unread') {
      return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800';
    }
    
    switch (status) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your notifications and announcements
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Notifications
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({unreadCount} unread)
              </span>
            </h2>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedNotifications.length > 0 && selectedNotifications.length === filteredNotifications.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label htmlFor="select-all" className="text-sm text-gray-600 dark:text-gray-400">
                  Select all
                </label>
              </div>
              
              {selectedNotifications.length > 0 && (
                <div className="flex items-center space-x-2">
                  {filter !== 'archived' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkSelectedAsRead}
                        className="flex items-center space-x-1"
                      >
                        <CheckIcon className="h-4 w-4" />
                        <span>Mark as read</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleArchiveSelected}
                        className="flex items-center space-x-1"
                      >
                        <ArchiveBoxIcon className="h-4 w-4" />
                        <span>Archive</span>
                      </Button>
                    </>
                  )}
                  {filter === 'archived' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUnarchiveSelected}
                      className="flex items-center space-x-1"
                    >
                      <ArchiveBoxIcon className="h-4 w-4" />
                      <span>Unarchive</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteSelected}
                    className="flex items-center space-x-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'unread'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'read'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                Read
              </button>
              <button
                onClick={() => setFilter('archived')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'archived'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                Archived
              </button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No notifications
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {filter === 'all' 
                  ? "You don't have any notifications yet." 
                  : filter === 'unread' 
                    ? "You're all caught up! No unread notifications." 
                    : filter === 'read'
                      ? "You haven't read any notifications yet."
                      : "No archived notifications."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg transition-colors ${getNotificationColor(notification.status)} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectNotification(notification.id);
                      }}
                      className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-medium ${
                            notification.status === 'unread' 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                          </p>
                        </div>
                        
                        {filter !== 'archived' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveNotification(notification.id);
                            }}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <ArchiveBoxIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              unarchiveNotification(notification.id);
                            }}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <ArchiveBoxIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatTime(notification.createdAt)}</span>
                          {notification.senderName && (
                            <span>• From {notification.senderName}</span>
                          )}
                        </div>
                        
                        {notification.status === 'unread' && filter !== 'archived' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Mark as read
                          </button>
                        )}
                        
                        {filter === 'read' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Modal */}
      <NotificationModal
        notification={selectedNotification}
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
        onUnarchive={() => {
          if (selectedNotification) {
            unarchiveNotification(selectedNotification.id);
            setIsModalOpen(false);
          }
        }}
      />
    </div>
  );
};