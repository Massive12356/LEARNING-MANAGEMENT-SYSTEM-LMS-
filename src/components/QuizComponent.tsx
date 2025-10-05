import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'short-text';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points?: number;
}

interface QuizComponentProps {
  questions: QuizQuestion[];
  title?: string;
  description?: string;
  timeLimit?: number; // in minutes
  passingScore?: number; // percentage
  showExplanations?: boolean;
  onSubmit: (answers: Record<string, string>, score: number) => void;
  onComplete?: (passed: boolean, score: number) => void;
  disabled?: boolean;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({
  questions,
  title = 'Knowledge Check',
  description,
  timeLimit,
  passingScore = 70,
  showExplanations = true,
  onSubmit,
  onComplete,
  disabled = false
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : 0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLimit && timeRemaining > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLimit, timeRemaining, showResults]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    if (disabled || isSubmitted) return;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = (): number => {
    let correctCount = 0;
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    let earnedPoints = 0;

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      const points = question.points || 1;
      
      if (question.type === 'multiple-choice') {
        if (userAnswer === question.correctAnswer) {
          correctCount++;
          earnedPoints += points;
        }
      } else if (question.type === 'short-text') {
        // Simple text comparison - in production, use more sophisticated matching
        const correctAnswers = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer 
          : [question.correctAnswer];
        
        if (correctAnswers.some(correct => 
          userAnswer?.toLowerCase().trim() === correct.toLowerCase().trim()
        )) {
          correctCount++;
          earnedPoints += points;
        }
      }
    });

    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const handleSubmit = () => {
    if (isSubmitted) return;

    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
    setIsSubmitted(true);

    onSubmit(answers, finalScore);
    
    if (onComplete) {
      onComplete(finalScore >= passingScore, finalScore);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionResult = (question: QuizQuestion): 'correct' | 'incorrect' | 'unanswered' => {
    const userAnswer = answers[question.id];
    if (!userAnswer) return 'unanswered';
    
    if (question.type === 'multiple-choice') {
      return userAnswer === question.correctAnswer ? 'correct' : 'incorrect';
    } else {
      const correctAnswers = Array.isArray(question.correctAnswer) 
        ? question.correctAnswer 
        : [question.correctAnswer];
      
      return correctAnswers.some(correct => 
        userAnswer.toLowerCase().trim() === correct.toLowerCase().trim()
      ) ? 'correct' : 'incorrect';
    }
  };

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const userAnswer = answers[question.id];
    const isCurrentQuestion = index === currentQuestion;
    const result = showResults ? getQuestionResult(question) : null;

    return (
      <Card key={question.id} className={!isCurrentQuestion && !showResults ? 'hidden' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Question {index + 1} of {questions.length}
            </h3>
            {showResults && (
              <div className="flex items-center space-x-2">
                {result === 'correct' && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                )}
                {result === 'incorrect' && (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {question.points || 1} point{(question.points || 1) !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-900 dark:text-white font-medium">
              {question.question}
            </p>

            {question.type === 'multiple-choice' && question.options && (
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isSelected = userAnswer === option;
                  const isCorrect = option === question.correctAnswer;
                  const showCorrectAnswer = showResults && isCorrect;
                  const showIncorrectAnswer = showResults && isSelected && !isCorrect;

                  return (
                    <label
                      key={optionIndex}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        disabled || isSubmitted ? 'cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      } ${
                        showCorrectAnswer 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : showIncorrectAnswer
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={isSelected}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        disabled={disabled || isSubmitted}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-gray-900 dark:text-white">{option}</span>
                      {showCorrectAnswer && (
                        <CheckCircleIcon className="ml-auto h-5 w-5 text-green-500" />
                      )}
                      {showIncorrectAnswer && (
                        <XCircleIcon className="ml-auto h-5 w-5 text-red-500" />
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {question.type === 'short-text' && (
              <div className="space-y-2">
                <textarea
                  value={userAnswer || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  disabled={disabled || isSubmitted}
                  placeholder="Enter your answer..."
                  className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    showResults && result === 'correct' 
                      ? 'border-green-500'
                      : showResults && result === 'incorrect'
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  rows={3}
                />
                {showResults && result !== 'correct' && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Correct answer:</strong> {
                      Array.isArray(question.correctAnswer) 
                        ? question.correctAnswer.join(' or ')
                        : question.correctAnswer
                    }
                  </div>
                )}
              </div>
            )}

            {showResults && showExplanations && question.explanation && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Explanation:
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (showResults) {
    const passed = score >= passingScore;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
              Quiz Results
            </h2>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className={`text-6xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {score}%
              </div>
              <div className="space-y-2">
                <p className={`text-lg font-medium ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {passed ? 'Congratulations! You passed!' : 'You did not pass this time.'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Passing score: {passingScore}%
                </p>
              </div>
              {!passed && (
                <p className="text-gray-600 dark:text-gray-400">
                  Review the explanations below and try again when ready.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Review Questions */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Review Your Answers
          </h3>
          {questions.map((question, index) => renderQuestion(question, index))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
              {description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {description}
                </p>
              )}
            </div>
            {timeLimit && timeRemaining > 0 && (
              <div className="flex items-center space-x-2 text-orange-600">
                <ClockIcon className="h-5 w-5" />
                <span className="font-medium">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
              <span>Passing score: {passingScore}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((currentQuestion + 1) / questions.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      {renderQuestion(questions[currentQuestion], currentQuestion)}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevQuestion}
          disabled={currentQuestion === 0 || disabled}
        >
          Previous
        </Button>

        <div className="flex items-center space-x-4">
          {currentQuestion < questions.length - 1 ? (
            <Button
              onClick={handleNextQuestion}
              disabled={disabled}
            >
              Next Question
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={disabled || Object.keys(answers).length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};