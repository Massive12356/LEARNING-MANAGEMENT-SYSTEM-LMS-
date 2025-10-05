import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { 
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'short-text';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points?: number;
}

interface TestRunnerProps {
  testId: string;
  title: string;
  description?: string;
  questions: Question[];
  timeLimit?: number; // in minutes
  isGraded: boolean;
  passingScore?: number;
  onComplete: (results: TestResults) => void;
  onExit?: () => void;
}

interface TestResults {
  answers: Record<string, string>;
  score: number;
  totalPoints: number;
  passed: boolean;
  timeSpent: number;
  completedAt: Date;
}

export const TestRunner: React.FC<TestRunnerProps> = ({
  testId,
  title,
  description,
  questions,
  timeLimit,
  isGraded,
  passingScore = 70,
  onComplete,
  onExit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnswered = answers[currentQuestion?.id];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    const results = calculateResults();
    setShowResults(true);
    onComplete(results);
  };

  const calculateResults = (): TestResults => {
    let correctAnswers = 0;
    let totalPoints = 0;

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      const points = question.points || 1;
      totalPoints += points;

      if (question.type === 'multiple-choice') {
        if (userAnswer === question.correctAnswer) {
          correctAnswers += points;
        }
      } else if (question.type === 'short-text') {
        // Simple text comparison - in real app, this would be more sophisticated
        const correct = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer.some(answer => 
              userAnswer?.toLowerCase().includes(answer.toLowerCase())
            )
          : userAnswer?.toLowerCase().includes((question.correctAnswer as string).toLowerCase());
        
        if (correct) {
          correctAnswers += points;
        }
      }
    });

    const score = totalPoints > 0 ? (correctAnswers / totalPoints) * 100 : 0;
    const passed = !isGraded || score >= passingScore;

    return {
      answers,
      score: Math.round(score),
      totalPoints,
      passed,
      timeSpent: Math.floor((Date.now() - startTime) / 1000),
      completedAt: new Date()
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {currentQuestionIndex + 1}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {currentQuestion.question}
            </h3>

            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'short-text' && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your answer..."
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    const results = calculateResults();
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
            results.passed 
              ? 'bg-green-100 dark:bg-green-900' 
              : 'bg-red-100 dark:bg-red-900'
          }`}>
            {results.passed ? (
              <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            ) : (
              <XCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {results.passed ? 'Congratulations!' : 'Keep Learning!'}
          </h3>
          
          <div className="space-y-2">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Your Score: <span className="font-bold">{results.score}%</span>
            </p>
            {isGraded && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {results.passed 
                  ? `You passed! (Required: ${passingScore}%)`
                  : `You need ${passingScore}% to pass. Try again!`
                }
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Time spent: {formatTime(results.timeSpent)}
            </p>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Question Review
          </h4>
          {questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = question.type === 'multiple-choice' 
              ? userAnswer === question.correctAnswer
              : Array.isArray(question.correctAnswer)
              ? question.correctAnswer.some(answer => 
                  userAnswer?.toLowerCase().includes(answer.toLowerCase())
                )
              : userAnswer?.toLowerCase().includes((question.correctAnswer as string).toLowerCase());

            return (
              <div key={question.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    isCorrect 
                      ? 'bg-green-100 dark:bg-green-900' 
                      : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    {isCorrect ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">
                      {index + 1}. {question.question}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Your answer: <span className="font-medium">{userAnswer || 'No answer'}</span>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Correct answer: <span className="font-medium">
                          {Array.isArray(question.correctAnswer) 
                            ? question.correctAnswer.join(', ')
                            : question.correctAnswer
                          }
                        </span>
                      </p>
                    )}
                    {question.explanation && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                        💡 {question.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>{formatTime(timeSpent)}</span>
            </div>
            <span>
              {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {showResults ? renderResults() : (
          <div className="space-y-8">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {renderQuestion()}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-3">
                {onExit && (
                  <Button variant="outline" onClick={onExit}>
                    Exit Test
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!hasAnswered}
                >
                  {isLastQuestion ? 'Submit Test' : 'Next Question'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};