import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  className?: string;
  children?: React.ReactNode;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
  message,
  children,
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />}

      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>

      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      )}

      {action && (
        <Button variant={action.variant || 'primary'} onClick={action.onClick}>
          {action.label}
        </Button>
      )}

      {children}
    </div>
  );
};

// Predefined empty states for common scenarios
export const NoCourses: React.FC<{ onCreateCourse?: () => void }> = ({ onCreateCourse }) => (
  <EmptyState
    title="No courses yet"
    description="Get started by creating your first course to share knowledge with your students."
    action={
      onCreateCourse
        ? {
            label: 'Create First Course',
            onClick: onCreateCourse,
          }
        : undefined
    }
  />
);

export const NoEnrollments: React.FC<{ onBrowseCourses?: () => void }> = ({ onBrowseCourses }) => (
  <EmptyState
    title="No courses enrolled"
    description="Browse our course catalog and enroll in courses that interest you to start learning."
    action={
      onBrowseCourses
        ? {
            label: 'Browse Courses',
            onClick: onBrowseCourses,
          }
        : undefined
    }
  />
);

export const NoUsers: React.FC<{ onInviteUser?: () => void }> = ({ onInviteUser }) => (
  <EmptyState
    title="No users found"
    description="Start building your learning community by inviting users to join your organization."
    action={
      onInviteUser
        ? {
            label: 'Invite First User',
            onClick: onInviteUser,
          }
        : undefined
    }
  />
);

export const NoSearchResults: React.FC<{ searchTerm: string; onClearSearch?: () => void }> = ({
  searchTerm,
  onClearSearch,
}) => (
  <EmptyState
    title="No results found"
    description={`We couldn't find anything matching "${searchTerm}". Try adjusting your search terms or filters.`}
    action={
      onClearSearch
        ? {
            label: 'Clear Search',
            onClick: onClearSearch,
            variant: 'outline',
          }
        : undefined
    }
  />
);
