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
    const newStatus: TodoStatus = item.status === 'completed' ? 'pending' : 'completed';
    onUpdate(item.id, { status: newStatus });
  };

  const handleStatusChange = (item: TodoItem, newStatus: TodoStatus) => {
    onUpdate(item.id, { status: newStatus });
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
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Todo List ({filteredItems.length})
          </h3>
          {showAddButton && (
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Todo</span>
            </Button>
          )}
        </div>

        {/* Filters and Sort */}
        <div className="mt-3 flex flex-col sm:flex-row gap-2" style={{ position: 'relative', zIndex: 1 }}>
          <Dropdown
            options={[
              { label: 'All Items', value: 'all' },
              ...statusOptions
            ]}
            value={filter}
            onChange={(value) => setFilter(value as any)}
            placeholder="Filter by status"
            className="flex-1"
          />
          <Dropdown
            options={[
              { label: 'Sort by Created', value: 'created' },
              { label: 'Sort by Due Date', value: 'dueDate' },
              { label: 'Sort by Priority', value: 'priority' }
            ]}
            value={sortBy}
            onChange={(value) => setSortBy(value as any)}
            placeholder="Sort by"
            className="flex-1"
          />
        </div>
      </div>

      {/* Todo Items */}
      <div className="p-4" style={{ maxHeight, overflowY: 'auto' }}>
        {filteredItems.length === 0 ? (
          <EmptyState
            title="No todo items"
            description={filter === 'all' ? "Get organized by adding your first todo item!" : `No ${filter} items found.`}
            action={showAddButton ? {
              label: "Add Todo",
              onClick: () => setShowAddModal(true)
            } : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg transition-colors ${
                  item.status === 'completed' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : isOverdue(item)
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`mt-1 flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                      item.status === 'completed'
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-300 dark:border-gray-500 hover:border-green-400'
                    }`}
                  >
                    {item.status === 'completed' && <CheckIcon className="h-3 w-3" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium truncate max-w-full ${
                          item.status === 'completed' 
                            ? 'line-through text-gray-500 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-white'
                        }`} title={item.title}>
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className={`text-sm mt-1 break-words max-w-full ${
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

                          {/* Status */}
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <Dropdown
                              options={statusOptions}
                              value={item.status}
                              onChange={(value) => handleStatusChange(item, value as TodoStatus)}
                              className="text-xs flex-shrink-0"
                            />
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
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
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
        title={editingItem ? 'Edit Todo Item' : 'Add New Todo Item'}
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter todo title"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter todo description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

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

          <Input
            label="Tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="tag1, tag2, tag3"
            helpText="Separate multiple tags with commas"
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingItem ? 'Update' : 'Add'} Todo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};