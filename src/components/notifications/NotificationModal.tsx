import React from 'react';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  BellAlertIcon,
  TrashIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { Notification } from '../../types';

interface NotificationModalProps {
  notification: Notification;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onDelete?: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    case 'warning':
      return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
    case 'error':
      return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
    case 'announcement':
      return <BellAlertIcon className="h-6 w-6 text-blue-500" />;
    default:
      return <InformationCircleIcon className="h-6 w-6 text-gray-500" />;
  }
};

const getNotificationColor = (status: string, type: string) => {
  if (status === 'unread') {
    return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800';
  }
  
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

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  isOpen,
  onClose,
  onMarkAsRead,
  onArchive,
  onUnarchive,
  onDelete
}) => {
  if (!isOpen || !notification) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay with fade animation */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-out" 
          aria-hidden="true"
          onClick={onClose}
        />

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all duration-300 ease-out sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none transition-colors duration-200"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 sm:mx-0 sm:h-10 sm:w-10">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-semibold text-gray-900 dark:text-white">
                {notification.title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatTime(notification.createdAt)}
                  {notification.senderName && (
                    <span className="ml-2">• From {notification.senderName}</span>
                  )}
                </p>
              </div>
              <div className="mt-4">
                <div className={`p-4 rounded-lg border ${getNotificationColor(notification.status, notification.type)}`}>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-6 sm:flex sm:flex-row-reverse">
            <div className="sm:flex sm:flex-row-reverse sm:space-x-3 sm:space-x-reverse w-full">
              {onDelete && (
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center items-center rounded-md border border-red-300 dark:border-red-600 shadow-sm px-4 py-2 bg-red-50 dark:bg-red-900/20 text-base font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800 focus:outline-none transition-colors duration-200 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={onDelete}
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Delete
                </button>
              )}
              {notification.status === 'archived' && onUnarchive ? (
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center items-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition-colors duration-200 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => {
                    onUnarchive();
                    onClose();
                  }}
                >
                  <ArchiveBoxIcon className="h-5 w-5 mr-2" />
                  Unarchive
                </button>
              ) : onArchive ? (
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center items-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition-colors duration-200 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={onArchive}
                >
                  <ArchiveBoxIcon className="h-5 w-5 mr-2" />
                  Archive
                </button>
              ) : null}
              {notification.status === 'unread' && onMarkAsRead && (
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none transition-colors duration-200 sm:w-auto sm:text-sm"
                  onClick={onMarkAsRead}
                >
                  Mark as Read
                </button>
              )}
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center items-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition-colors duration-200 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};