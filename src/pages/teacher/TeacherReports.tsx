import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockApi } from '../../services/mockApi';
import { 
  ChartBarIcon,
  BookOpenIcon,
  UserGroupIcon,
  TrophyIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface TeacherReport {
  courses: Array<{
    id: string;
    title: string;
    studentsEnrolled: number;
    completionRate: number;
    averageScore: number;
    totalTimeSpent: number;
    certificatesIssued: number;
    status: 'live' | 'draft';
  }>;
  overallStats: {
    totalCourses: number;
    totalStudents: number;
    averageCompletionRate: number;
    totalCertificatesIssued: number;
  };
  studentActivity: Array<{
    studentName: string;
    course: string;
    action: 'enrolled' | 'completed' | 'certificate_earned';
    date: Date;
  }>;
}

export function TeacherReports() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<TeacherReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    loadReportData();
  }, [user, dateRange]);

  const loadReportData = async () => {
    if (!user) return;

    try {
      // TODO: Replace with real API call to GET /api/reports/teacher
      const mockReportData: TeacherReport = {
        courses: [
          {
            id: 'course-1',
            title: 'Complete React Development Course',
            studentsEnrolled: 156,
            completionRate: 78.5,
            averageScore: 87.2,
            totalTimeSpent: 2340,
            certificatesIssued: 122,
            status: 'live'
          },
          {
            id: 'course-2',
            title: 'Advanced TypeScript Patterns',
            studentsEnrolled: 89,
            completionRate: 65.2,
            averageScore: 82.1,
            totalTimeSpent: 1560,
            certificatesIssued: 58,
            status: 'live'
          },
          {
            id: 'course-3',
            title: 'JavaScript Fundamentals',
            studentsEnrolled: 234,
            completionRate: 92.3,
            averageScore: 91.5,
            totalTimeSpent: 3120,
            certificatesIssued: 216,
            status: 'live'
          }
        ],
        overallStats: {
          totalCourses: 3,
          totalStudents: 479,
          averageCompletionRate: 78.7,
          totalCertificatesIssued: 396
        },
        studentActivity: [
          { studentName: 'John Doe', course: 'React Development', action: 'completed', date: new Date('2024-01-15') },
          { studentName: 'Jane Smith', course: 'TypeScript Patterns', action: 'enrolled', date: new Date('2024-01-14') },
          { studentName: 'Mike Johnson', course: 'JavaScript Fundamentals', action: 'certificate_earned', date: new Date('2024-01-13') }
        ]
      };

      setReportData(mockReportData);
    } catch (error) {
      console.error('Failed to load teacher report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // TODO: Implement CSV export functionality
    console.log('Exporting teacher report...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No report data available</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Teaching Analytics
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor student progress and course performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">All time</option>
          </select>
          <Button variant="outline" onClick={exportReport}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <BookOpenIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reportData.overallStats.totalCourses}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Courses
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reportData.overallStats.totalStudents}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Students
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reportData.overallStats.averageCompletionRate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg Completion Rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
              <TrophyIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reportData.overallStats.totalCertificatesIssued}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Certificates Issued
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance Table */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Course Performance
          </h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avg Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Certificates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {reportData.courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {course.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Status: {course.status}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {course.studentsEnrolled}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${course.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {course.completionRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {course.averageScore.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {course.certificatesIssued}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="outline" size="sm">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Student Activity */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Student Activity
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.studentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.action === 'completed' ? 'bg-green-100 dark:bg-green-900' :
                  activity.action === 'certificate_earned' ? 'bg-yellow-100 dark:bg-yellow-900' :
                  'bg-blue-100 dark:bg-blue-900'
                }`}>
                  {activity.action === 'completed' && <BookOpenIcon className="h-4 w-4 text-green-600" />}
                  {activity.action === 'certificate_earned' && <TrophyIcon className="h-4 w-4 text-yellow-600" />}
                  {activity.action === 'enrolled' && <UserGroupIcon className="h-4 w-4 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.studentName}</span>
                    {activity.action === 'completed' && ` completed ${activity.course}`}
                    {activity.action === 'certificate_earned' && ` earned certificate for ${activity.course}`}
                    {activity.action === 'enrolled' && ` enrolled in ${activity.course}`}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {activity.date.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}