import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { progressTrackingService } from '../../services/progressTrackingService';
import { DetailedProgress, ProgressSummary } from '../../services/progressTrackingService';
import { User, Lesson } from '../../types';
import { 
  ChartBarIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface StudentProgressViewerProps {
  courseId: string;
  students: User[];
}

export const StudentProgressViewer: React.FC<StudentProgressViewerProps> = ({ 
  courseId,
  students
}) => {
  const [studentProgress, setStudentProgress] = useState<Record<string, ProgressSummary>>({});
  const [detailedProgress, setDetailedProgress] = useState<Record<string, DetailedProgress[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    loadAllStudentProgress();
  }, [courseId, students]);

  const loadAllStudentProgress = async () => {
    try {
      setLoading(true);
      const progressData: Record<string, ProgressSummary> = {};
      const detailedData: Record<string, DetailedProgress[]> = {};

      // Load progress for all students
      for (const student of students) {
        const summary = await progressTrackingService.getProgressSummary(student.id, courseId);
        const detailed = await progressTrackingService.getDetailedProgress(student.id, courseId);
        
        progressData[student.id] = summary;
        detailedData[student.id] = detailed;
      }

      setStudentProgress(progressData);
      setDetailedProgress(detailedData);
    } catch (error) {
      console.error('Failed to load student progress:', error);
      toast.error('Failed to load student progress data');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudent = selectedStudentId 
    ? students.find(s => s.id === selectedStudentId) 
    : null;

  const selectedStudentProgress = selectedStudentId 
    ? studentProgress[selectedStudentId] 
    : null;

  const selectedStudentDetailed = selectedStudentId 
    ? detailedProgress[selectedStudentId] 
    : [];

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
          <ChartBarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Student Progress
          </h3>
        </div>
        
        <div className="relative w-64">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="lg:col-span-1">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Students ({filteredStudents.length})
              </h4>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {filteredStudents.map((student) => {
                const progress = studentProgress[student.id];
                return (
                  <div 
                    key={student.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      selectedStudentId === student.id 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' 
                        : ''
                    }`}
                    onClick={() => setSelectedStudentId(student.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {student.email}
                          </div>
                        </div>
                      </div>
                      {progress && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {Math.round(progress.overallProgress)}%
                          </div>
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${progress.overallProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Student Details */}
        <div className="lg:col-span-2">
          {selectedStudent && selectedStudentProgress ? (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-lg font-medium text-blue-800 dark:text-blue-200">
                          {selectedStudent.firstName.charAt(0)}{selectedStudent.lastName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedStudent.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {Math.round(selectedStudentProgress.overallProgress)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Course Completion
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <AcademicCapIcon className="h-5 w-5 text-blue-500 mr-2" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedStudentProgress.completedLessons}/{selectedStudentProgress.totalLessons}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Lessons Completed
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-green-500 mr-2" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedStudentProgress.totalTimeSpent} min
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Time Spent
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <ChartBarIcon className="h-5 w-5 text-purple-500 mr-2" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedStudentProgress.averageScore 
                          ? `${Math.round(selectedStudentProgress.averageScore)}%` 
                          : 'N/A'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Avg Score
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedStudentProgress.streak}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Day Streak
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Lesson Progress
                </h4>
                
                {selectedStudentDetailed.length > 0 ? (
                  <div className="space-y-3">
                    {selectedStudentDetailed.map((progress, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                            progress.completed 
                              ? 'bg-green-100 dark:bg-green-900' 
                              : 'bg-gray-200 dark:bg-gray-600'
                          }`}>
                            {progress.completed ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Lesson {index + 1}
                            </div>
                            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {progress.timeSpent} min
                              {progress.score && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span>{Math.round(progress.score)}%</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {progress.lastAccessedAt.toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AcademicCapIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No progress data available for this student.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a Student
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a student from the list to view their progress details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};