import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { Dropdown } from './Dropdown';
import { EmptyState } from './EmptyState';
import { TodoItem, TodoPriority, TodoStatus } from '../../types';
import toast from 'react-hot-toast';

interface TodoListProps {
  items?: TodoItem[];
  onAdd: (item: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  onUpdate: (id: string, updates: Partial<TodoItem>) => void;
  onDelete: (id: string) => void;
  userId: string;
  className?: string;
  showAddButton?: boolean;
  maxHeight?: string;
}

interface TodoFormData {
  title: string;
  description: string;
  priority: TodoPriority;
  dueDate: string;
  tags: string;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const priorityOptions = [
  { label: 'Low Priority', value: 'low' },
  { label: 'Medium Priority', value: 'medium' },
  { label: 'High Priority', value: 'high' }
];

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
];

export const TodoList: React.FC<TodoListProps> = ({
  items = [],
  onAdd,
  onUpdate,
  onDelete,
  userId,
  className = '',
  showAddButton = true,
  maxHeight = '600px'
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TodoItem | null>(null);
  const [filter, setFilter] = useState<'all' | TodoStatus>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('created');

  const [formData, setFormData] = useState<TodoFormData>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: ''
  });

  // Filter and sort items
  const filteredItems = items
    .filter(item => filter === 'all' || item.status === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      tags: ''
    });
    setEditingItem(null);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const todoData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      status: 'pending' as TodoStatus,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
    };

    if (editingItem) {
      onUpdate(editingItem.id, todoData);
      toast.success('Todo item updated');
    } else {
      onAdd(todoData);
      toast.success('Todo item added');
    }

    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (item: TodoItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      priority: item.priority,
      dueDate: item.dueDate ? item.dueDate.toISOString().split('T')[0] : '',
      tags: item.tags?.join(', ') || ''
    });
    setShowAddModal(true);
  };

  const handleToggleStatus = (item: TodoItem) => {
    if (item.status === 'completed') {
      // If already completed, mark as pending
      onUpdate(item.id, { status: 'pending' });
    } else {
      // If marking as completed, delete the item as per user request
      handleDelete(item.id);
    }
  };

  const handleStatusChange = (item: TodoItem, newStatus: TodoStatus) => {
    if (newStatus === 'completed') {
      // If marking as completed, delete the item as per user request
      handleDelete(item.id);
    } else {
      onUpdate(item.id, { status: newStatus });
    }
  };

  const handleDelete = (itemId: string) => {
    onDelete(itemId);
  };

  const handleMarkAsCompleted = (item: TodoItem) => {
    // Delete the item when marking as completed
    handleDelete(item.id);
  };

  const isOverdue = (item: TodoItem) => {
    return item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'completed';
  };

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays > 0) return `Due in ${diffDays} days`;
    if (diffDays === -1) return 'Due yesterday';
    return `Overdue by ${Math.abs(diffDays)} days`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`} style={{ position: 'relative', zIndex: 0 }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-t-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              Todo List
              <span className="ml-2 bg-blue-500 text-white text-sm font-normal px-2 py-1 rounded-full">
                {filteredItems.length}
              </span>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Stay organized and manage your tasks efficiently
            </p>
          </div>
          {showAddButton && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add New Task</span>
            </Button>
          )}
        </div>

        {/* Filters and Sort */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Filter</label>
            <Dropdown
              options={[
                { label: 'All Items', value: 'all' },
                ...statusOptions
              ]}
              value={filter}
              onChange={(value) => setFilter(value as any)}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
            <Dropdown
              options={[
                { label: 'Recently Added', value: 'created' },
                { label: 'Due Date', value: 'dueDate' },
                { label: 'Priority', value: 'priority' }
              ]}
              value={sortBy}
              onChange={(value) => setSortBy(value as any)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Todo Items */}
      <div className="p-4" style={{ maxHeight, overflowY: 'auto' }}>
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No tasks found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {filter === 'all' ? "Get organized by adding your first task!" : `No ${filter} tasks found.`}
            </p>
            {showAddButton && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Create your first task
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg transition-all duration-200 transform hover:shadow-md ${
                  item.status === 'completed' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 opacity-75' 
                    : isOverdue(item)
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 animate-pulse' 
                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`mt-1 flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      item.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white scale-110'
                        : 'border-gray-300 dark:border-gray-500 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/30'
                    }`}
                  >
                    {item.status === 'completed' && <CheckIcon className="h-4 w-4" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold truncate max-w-full text-base ${
                          item.status === 'completed' 
                            ? 'line-through text-gray-500 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-white'
                        }`} title={item.title}>
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className={`text-sm mt-2 break-words max-w-full leading-relaxed ${
                            item.status === 'completed' 
                              ? 'line-through text-gray-400 dark:text-gray-500' 
                              : 'text-gray-600 dark:text-gray-300'
                          }`} title={item.description}>
                            {item.description}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {/* Priority */}
                          <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${priorityColors[item.priority]}`}>
                            <FlagIcon className="h-3 w-3 inline mr-1" />
                            {item.priority}
                          </span>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1">
                            {item.status !== 'completed' && (
                              <button
                                onClick={() => handleMarkAsCompleted(item)}
                                className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                                title="Mark as Completed"
                              >
                                Complete
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>

                          {/* Due Date */}
                          {item.dueDate && (
                            <span className={`text-xs flex items-center flex-shrink-0 ${
                              isOverdue(item) ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {formatDueDate(item.dueDate)}
                            </span>
                          )}

                          {/* Tags */}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 min-w-0">
                              {item.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded truncate"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={editingItem ? 'Edit Task' : 'Create New Task'}
      >
        <div className="space-y-5">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/50">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Task Details
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Enter the details for your task below
            </p>
          </div>

          <Input
            label="Task Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="What needs to be done?"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add more details about this task..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Dropdown
                label="Priority"
                options={priorityOptions}
                value={formData.priority}
                onChange={(value) => setFormData(prev => ({ ...prev, priority: value as TodoPriority }))}
              />
            </div>

            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <Input
            label="Tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="work, urgent, personal"
            helpText="Separate multiple tags with commas"
          />

          <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {editingItem ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};