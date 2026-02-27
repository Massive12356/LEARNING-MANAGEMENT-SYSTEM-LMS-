import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

import { 
  StarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface FeedbackQuestion {
  id: string;
  type: 'rating' | 'text' | 'multiple-choice';
  question: string;
  options?: string[];
  required?: boolean;
}

interface FeedbackSurveyProps {
  courseId: string;
  courseName: string;
  onSubmit: (responses: Record<string, any>) => void;
  onSkip?: () => void;
}

export const FeedbackSurvey: React.FC<FeedbackSurveyProps> = ({
  courseId,
  courseName,
  onSubmit,
  onSkip
}) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  // Default feedback questions - in real app, these would come from API
  const questions: FeedbackQuestion[] = [
    {
      id: 'overall_rating',
      type: 'rating',
      question: 'How would you rate this course overall?',
      required: true
    },
    {
      id: 'content_quality',
      type: 'rating',
      question: 'How would you rate the quality of the content?',
      required: true
    },
    {
      id: 'instructor_rating',
      type: 'rating',
      question: 'How would you rate the instructor?',
      required: true
    },
    {
      id: 'difficulty',
      type: 'multiple-choice',
      question: 'How was the difficulty level?',
      options: ['Too Easy', 'Just Right', 'Too Difficult'],
      required: true
    },
    {
      id: 'recommend',
      type: 'multiple-choice',
      question: 'Would you recommend this course to others?',
      options: ['Definitely', 'Probably', 'Maybe', 'Probably Not', 'Definitely Not'],
      required: true
    },
    {
      id: 'improvements',
      type: 'text',
      question: 'What could be improved about this course?',
      required: false
    },
    {
      id: 'additional_comments',
      type: 'text',
      question: 'Any additional comments or suggestions?',
      required: false
    }
  ];

  const handleRatingChange = (questionId: string, rating: number) => {
    setResponses(prev => ({ ...prev, [questionId]: rating }));
  };

  const handleTextChange = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultipleChoiceChange = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    const missingRequired = questions
      .filter(q => q.required && !responses[q.id])
      .map(q => q.question);

    if (missingRequired.length > 0) {
      toast.error('Please answer all required questions');
      return;
    }

    try {
      await onSubmit(responses);
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const renderRatingInput = (question: FeedbackQuestion) => (
    <div className="flex items-center space-x-2">
      {[1, 2, 3, 4, 5].map((rating) => {
        const isSelected = responses[question.id] >= rating;
        const StarComponent = isSelected ? StarIconSolid : StarIcon;
        
        return (
          <button
            key={rating}
            type="button"
            onClick={() => handleRatingChange(question.id, rating)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <StarComponent 
              className={`h-6 w-6 ${
                isSelected ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
        {responses[question.id] ? `${responses[question.id]}/5` : 'Not rated'}
      </span>
    </div>
  );

  const renderTextInput = (question: FeedbackQuestion) => (
    <textarea
      value={responses[question.id] || ''}
      onChange={(e) => handleTextChange(question.id, e.target.value)}
      rows={3}
      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder="Your feedback..."
    />
  );

  const renderMultipleChoiceInput = (question: FeedbackQuestion) => (
    <div className="space-y-2">
      {question.options?.map((option) => (
        <label key={option} className="flex items-center">
          <input
            type="radio"
            name={question.id}
            value={option}
            checked={responses[question.id] === option}
            onChange={(e) => handleMultipleChoiceChange(question.id, e.target.value)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            {option}
          </span>
        </label>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Thank you for your feedback!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your responses help us improve the course experience for future students.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Course Feedback
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Help us improve "{courseName}" with your feedback
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {questions.map((question) => (
            <div key={question.id} className="space-y-3">
              <div className="flex items-start space-x-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {question.question}
                </h3>
                {question.required && (
                  <span className="text-red-500 text-sm">*</span>
                )}
              </div>
              
              {question.type === 'rating' && renderRatingInput(question)}
              {question.type === 'text' && renderTextInput(question)}
              {question.type === 'multiple-choice' && renderMultipleChoiceInput(question)}
            </div>
          ))}

          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            {onSkip && (
              <Button variant="outline" onClick={onSkip}>
                Skip Feedback
              </Button>
            )}
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onSkip}>
                Skip for Now
              </Button>
              <Button onClick={handleSubmit}>
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};