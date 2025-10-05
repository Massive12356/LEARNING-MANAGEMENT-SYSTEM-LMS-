import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { mockApi } from '../../services/mockApi';
import { ReflectionSubmission, User, Lesson } from '../../types';
import { 
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ReflectionModerationProps {
  courseId: string;
  lessons: Lesson[];
}

export const ReflectionModeration: React.FC<ReflectionModerationProps> = ({ 
  courseId,
  lessons
}) => {
  const [submissions, setSubmissions] = useState<ReflectionSubmission[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<ReflectionSubmission | null>(null);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed'>('all');

  useEffect(() => {
    loadSubmissions();
  }, [courseId]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      
      // Get all reflection submissions for this course
      const courseSubmissions = await mockApi.getReflectionSubmissionsForCourse(courseId);
      setSubmissions(courseSubmissions);
      
      // Get student details
      const allUsers = await mockApi.getUsers();
      const courseStudents = allUsers.data.filter(user => user.role === 'student');
      setStudents(courseStudents);
    } catch (error) {
      console.error('Failed to load reflection submissions:', error);
      toast.error('Failed to load reflection submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleProvideFeedback = async () => {
    if (!selectedSubmission) return;
    
    if (grade !== '' && (grade < 0 || grade > 100)) {
      toast.error('Grade must be between 0 and 100');
      return;
    }

    try {
      await mockApi.updateReflectionSubmission(selectedSubmission.id, {
        feedback,
        grade: grade === '' ? undefined : grade,
        reviewedBy: 'teacher', // In a real app, this would be the actual teacher ID
      });
      
      toast.success('Feedback provided successfully');
      
      // Update local state
      const updatedSubmissions = submissions.map(sub => 
        sub.id === selectedSubmission.id 
          ? { 
              ...sub, 
              feedback, 
              grade: grade === '' ? undefined : grade,
              reviewedAt: new Date(),
              reviewedBy: 'teacher'
            } 
          : sub
      );
      setSubmissions(updatedSubmissions);
      
      // Clear selection
      setSelectedSubmission(null);
      setFeedback('');
      setGrade('');
    } catch (error) {
      console.error('Failed to provide feedback:', error);
      toast.error('Failed to provide feedback');
    }
  };

  const getStudentName = (userId: string) => {
    const student = students.find(s => s.id === userId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getLessonTitle = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    return lesson ? lesson.title : 'Unknown Lesson';
  };

  const filteredSubmissions = submissions.filter(submission => {
    // Apply status filter
    if (filterStatus === 'pending' && submission.reviewedAt) return false;
    if (filterStatus === 'reviewed' && !submission.reviewedAt) return false;
    
    // Apply search filter
    const studentName = getStudentName(submission.userId).toLowerCase();
    const lessonTitle = getLessonTitle(submission.lessonId).toLowerCase();
    
    return (
      studentName.includes(searchTerm.toLowerCase()) ||
      lessonTitle.includes(searchTerm.toLowerCase()) ||
      (submission.content && submission.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Reflection Submissions ({submissions.length})
          </h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission List */}
        <div className="lg:col-span-1">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Submissions
              </h4>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((submission) => (
                  <div 
                    key={submission.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      selectedSubmission?.id === submission.id 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' 
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setFeedback(submission.feedback || '');
                      setGrade(submission.grade || '');
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <UserCircleIcon className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {getStudentName(submission.userId)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {getLessonTitle(submission.lessonId)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {submission.content.substring(0, 100)}...
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {submission.reviewedAt ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ClockIcon className="h-5 w-5 text-yellow-500" />
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'No submissions match your filters' 
                      : 'No reflection submissions yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submission Details and Feedback */}
        <div className="lg:col-span-2">
          {selectedSubmission ? (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {getStudentName(selectedSubmission.userId)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {getLessonTitle(selectedSubmission.lessonId)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Submitted on
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(selectedSubmission.submittedAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Student Submission
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {selectedSubmission.content}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Provide Feedback
                  </h4>
                  
                  <TextArea
                    label="Feedback"
                    value={feedback}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
                    placeholder="Enter your feedback for this submission..."
                    rows={4}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Grade (0-100)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="Enter a grade (optional)"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button onClick={handleProvideFeedback}>
                      Submit Feedback
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedSubmission(null);
                        setFeedback('');
                        setGrade('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>

                {selectedSubmission.feedback && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Previous Feedback
                    </h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {selectedSubmission.feedback}
                      </p>
                      {selectedSubmission.grade !== undefined && (
                        <div className="mt-3 text-sm">
                          <span className="font-medium">Grade:</span> {selectedSubmission.grade}/100
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        Reviewed by {selectedSubmission.reviewedBy || 'Unknown'} on{' '}
                        {selectedSubmission.reviewedAt?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a Submission
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a reflection submission from the list to provide feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};