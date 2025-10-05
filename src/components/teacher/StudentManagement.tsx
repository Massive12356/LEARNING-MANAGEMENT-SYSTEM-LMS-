import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { mockApi } from '../../services/mockApi';
import { StudentProgressViewer } from './StudentProgressViewer';
import { Enrollment, User } from '../../types';
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  UserPlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface StudentManagementProps {
  courseId: string;
  onStudentCountChange?: (count: number) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ 
  courseId,
  onStudentCountChange
}) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'progress'>('list');

  useEffect(() => {
    loadEnrollments();
  }, [courseId]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const courseEnrollments = await mockApi.getCourseEnrollments(courseId);
      setEnrollments(courseEnrollments);
      
      // Get student details for each enrollment
      const studentIds = courseEnrollments.map(e => e.userId);
      const allUsers = await mockApi.getUsers();
      const enrolledStudents = allUsers.data.filter(user => 
        studentIds.includes(user.id) && user.role === 'student'
      );
      setStudents(enrolledStudents);
      
      if (onStudentCountChange) {
        onStudentCountChange(enrolledStudents.length);
      }
    } catch (error) {
      console.error('Failed to load enrollments:', error);
      toast.error('Failed to load student enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentEmail.trim()) {
      toast.error('Please enter a student email');
      return;
    }

    try {
      // In a real app, you would search for the user by email
      // For now, we'll just create a mock enrollment
      const users = await mockApi.getUsers({ search: newStudentEmail });
      const student = users.data.find(u => u.email === newStudentEmail && u.role === 'student');
      
      if (!student) {
        toast.error('Student not found. Please check the email address.');
        return;
      }

      // Check if student is already enrolled
      const isAlreadyEnrolled = enrollments.some(e => e.userId === student.id);
      if (isAlreadyEnrolled) {
        toast.error('Student is already enrolled in this course');
        return;
      }

      await mockApi.enrollUser(student.id, courseId);
      toast.success('Student enrolled successfully');
      setNewStudentEmail('');
      setShowAddStudent(false);
      loadEnrollments();
    } catch (error) {
      console.error('Failed to enroll student:', error);
      toast.error('Failed to enroll student');
    }
  };

  const handleRemoveStudent = async (enrollmentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from this course?`)) {
      return;
    }

    try {
      await mockApi.removeEnrollment(enrollmentId);
      toast.success('Student removed from course');
      loadEnrollments();
    } catch (error) {
      console.error('Failed to remove student:', error);
      toast.error('Failed to remove student');
    }
  };

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Students ({students.length})
            </h3>
          </div>
          
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Student List
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-3 py-1 text-sm font-medium rounded-md flex items-center ${
                activeTab === 'progress'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ChartBarIcon className="h-4 w-4 mr-1" />
              Progress
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {activeTab === 'list' && (
            <>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Button onClick={() => setShowAddStudent(true)}>
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </>
          )}
        </div>
      </div>

      {showAddStudent && activeTab === 'list' && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter student email"
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <div className="flex space-x-2">
              <Button onClick={handleAddStudent} size="sm">
                <PlusIcon className="h-4 w-4 mr-1" />
                Enroll
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowAddStudent(false);
                  setNewStudentEmail('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'list' ? (
        filteredStudents.length > 0 ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Enrolled Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.map((student) => {
                  const enrollment = enrollments.find(e => e.userId === student.id);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {student.firstName} {student.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {enrollment?.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${enrollment?.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {enrollment?.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => enrollment && handleRemoveStudent(enrollment.id, `${student.firstName} ${student.lastName}`)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {searchTerm ? 'No students found' : 'No students enrolled'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? 'Try adjusting your search to find students.' 
                : 'Get started by adding students to your course.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button onClick={() => setShowAddStudent(true)}>
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Add Students
                </Button>
              </div>
            )}
          </div>
        )
      ) : (
        <StudentProgressViewer 
          courseId={courseId} 
          students={students} 
        />
      )}
    </div>
  );
};