import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { ClockIcon } from '@heroicons/react/24/outline';
import { QuizAnswerValue } from '../types';

/* =======================
   TYPES
======================= */
export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'short-text';
  options?: string[];
  correctAnswers?: string[];
  explanation?: string;
  points?: number;
}

export interface GradingResult {
  score: number;
  maxScore: number;
  correct: boolean;
  feedback?: string;
}

export interface QuizAttemptResult {
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  status: string;
  timeExpired: boolean;
  totalScore: number;
  maxScore: number;
  percentage: string;
  passed: boolean;
  gradingResults: Record<string, GradingResult>;
}

export interface QuizResultAPI {
  message: string;
  quizTitle: string;
  passingScore: number;
  maxAttempts: number;
  attemptsUsed: number;
  bestScore: string;
  passed: boolean;
  quizQuestions: QuizQuestion[];
  results: QuizAttemptResult[];
}

/* =======================
   PROPS
======================= */
export interface QuizComponentProps {
  quizContentId: string | number;
  submissionId?: string;
  questions: QuizQuestion[];
  title?: string;
  maxAttempts?: number;
  description?: string;
  timeLimit?: number;
  quizPassingScore?: number;
  showStartButton?: boolean;
  disabled?: boolean;
  onStartQuiz?: () => Promise<void>;
  onSubmit: (answers: Record<string, QuizAnswerValue>) => void | Promise<void>;
  onComplete?: (passed: boolean, score: number) => void;
  result?: QuizResultAPI;
}

/* =======================
   COMPONENT
======================= */
export const QuizComponent: React.FC<QuizComponentProps> = ({
  quizContentId,
  questions,
  title = 'Knowledge Check',
  description,
  timeLimit,
  quizPassingScore,
  showStartButton = false,
  disabled = false,
  onStartQuiz,
  onSubmit,
  onComplete,
  result,
}) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, QuizAnswerValue>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [openReview, setOpenReview] = useState<Record<string, boolean>>({});
  const submitLockRef = useRef(false);

  /* =======================
     RESET ON QUIZ CHANGE
  ======================= */
  useEffect(() => {
    setHasStarted(false);
    setAnswers({});
    setCurrentQuestion(0);
    setTimeRemaining(null);
    submitLockRef.current = false;
    setOpenReview({});
  }, [quizContentId]);

  /* =======================
     TIMER
  ======================= */
  useEffect(() => {
    if (!hasStarted || !timeLimit || submitLockRef.current || timeRemaining === null) return;

    if (timeRemaining <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev !== null ? prev - 1 : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, timeRemaining, timeLimit]);

  /* =======================
     HANDLERS
  ======================= */
  const handleAnswerChange = (questionId: string, answer: QuizAnswerValue) => {
    if (disabled || submitLockRef.current) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleStart = async () => {
    if (!onStartQuiz || isStarting) return;
    try {
      setIsStarting(true);
      await onStartQuiz();
      setHasStarted(true);
      if (timeLimit) setTimeRemaining(timeLimit * 60);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmit = async (_auto = false) => {
    if (submitLockRef.current || isSubmitting) return;
    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      await onSubmit(answers);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /* =======================
     CALL ONCOMPLETE
  ======================= */
  useEffect(() => {
    if (result?.results?.[0]) {
      const attempt = result.results[0];
      onComplete?.(attempt.passed, attempt.totalScore);
    }
  }, [result]);

  /* =======================
     EMPTY QUIZ
  ======================= */
  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p>No quiz questions available.</p>
        </CardContent>
      </Card>
    );
  }

  /* =======================
     RESULTS VIEW
  ======================= */
  if (result) {
    const attempt = result.results?.[0];
    const gradingResults = attempt?.gradingResults ?? {};

    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Quiz Results</h2>
          <p className="text-gray-600">
            {attempt?.passed ? 'You passed this quiz 🎉' : 'You did not pass this quiz'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* SUMMARY */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-4 border rounded">
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-xl font-bold">
                {attempt?.totalScore ?? 0} / {attempt?.maxScore ?? 0}
              </p>
            </div>

            <div className="p-4 border rounded">
              <p className="text-sm text-gray-500">Percentage</p>
              <p className="text-xl font-bold">{attempt?.percentage ?? 0}%</p>
            </div>

            <div className="p-4 border rounded">
              <p className="text-sm text-gray-500">Passing Score</p>
              <p className="text-xl font-bold">
                {result?.passingScore ?? quizPassingScore ?? '—'}%
              </p>
            </div>

            <div
              className={`p-4 border rounded font-bold ${
                attempt?.passed ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {attempt?.passed ? 'PASSED' : 'FAILED'}
            </div>
          </div>

          {/* PER QUESTION REVIEW */}
          <div className="space-y-4">
            {questions.map(q => {
              const grading = gradingResults[q.id];
              const userAnswer = answers[q.id];
              const correctAnswers = q.correctAnswers ?? [];
              const isCorrect = grading?.correct;

              return (
                <div
                  key={q.id}
                  className={`border rounded p-4 transition-all duration-300 ${
                    isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{q.question}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setOpenReview(prev => ({
                          ...prev,
                          [q.id]: !prev[q.id],
                        }))
                      }
                    >
                      {openReview[q.id] ? 'Hide Review' : 'Review'}
                    </Button>
                  </div>

                  <p
                    className={`mt-2 font-semibold ${
                      isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {isCorrect ? '✔ Correct' : '✖ Incorrect'}
                  </p>

                  {openReview[q.id] && (
                    <div className="mt-3 space-y-2 animate-fadeIn">
                      <p className="text-sm">
                        <strong>Your answer:</strong>{' '}
                        <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                          {userAnswer || '—'}
                        </span>
                      </p>

                      <p className="text-sm">
                        <strong>Correct answer(s):</strong>{' '}
                        <span className="text-green-700">{correctAnswers.join(', ')}</span>
                      </p>

                      {grading?.feedback && (
                        <p className="text-sm text-gray-600">{grading.feedback}</p>
                      )}

                      {q.explanation && (
                        <p className="text-sm text-gray-500 italic">{q.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  /* =======================
     START VIEW
  ======================= */
  if (showStartButton && !hasStarted) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && <p>{description}</p>}
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={handleStart} disabled={isStarting}>
            {isStarting ? 'Starting...' : 'Start Quiz'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* =======================
     QUIZ VIEW
  ======================= */
  const question = questions[currentQuestion];
  const userAnswer = answers[question.id];

  return (
    <div>
      <Card>
        <CardHeader className="flex justify-between">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          {timeRemaining !== null && (
            <div className="flex items-center text-orange-600 gap-2">
              <ClockIcon className="h-5 w-5" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </CardHeader>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          Question {currentQuestion + 1} of {questions.length}
        </CardHeader>
        <CardContent>
          <p className="mb-4">{question.question}</p>

          {question.type === 'multiple-choice' &&
            question.options?.map(option => {
              const isSelected = userAnswer === option;

              return (
                <label
                  key={option}
                  className={`flex items-center gap-2 mb-2 p-2 rounded cursor-pointer transition ${
                    isSelected ? 'bg-blue-50 border border-blue-400' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={isSelected}
                    onChange={() => handleAnswerChange(question.id, option)}
                  />
                  {option}
                </label>
              );
            })}

          {question.type === 'short-text' && (
            <input
              type="text"
              value={(userAnswer as string) || ''}
              onChange={e => handleAnswerChange(question.id, e.target.value)}
              className="border p-2 w-full"
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(p => p - 1)}
        >
          Previous
        </Button>

        {currentQuestion < questions.length - 1 ? (
          <Button onClick={() => setCurrentQuestion(p => p + 1)}>Next</Button>
        ) : (
          <Button
            className="bg-green-600"
            onClick={() => handleSubmit(false)}
            disabled={Object.keys(answers).length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        )}
      </div>
    </div>
  );
};
