import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { exportToCSV } from '../../utils/csvParser';
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
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<TeacherReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    loadReportData();
  }, [user, dateRange]);

  const loadReportData = async () => {
    if (!user) return;

    try {
      // Mock data - replace with real API calls
      const mockReportData: TeacherReport = {
        courses: [
          {
            id: 'course-1',
            title: 'React Development',
            studentsEnrolled: 156,
            completionRate: 87.3,
            averageScore: 89.5,
            totalTimeSpent: 2847,
            certificatesIssued: 136,
            status: 'live'
          },
          {
            id: 'course-2',
            title: 'TypeScript Patterns',
            studentsEnrolled: 124,
            completionRate: 76.8,
            averageScore: 82.3,
            totalTimeSpent: 2156,
            certificatesIssued: 95,
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

  const exportReport = (format: 'csv' | 'pdf') => {
    if (!reportData) return;
    
    if (format === 'csv') {
      // Export as CSV
      const csvData = [
        // Overall stats
        { Metric: 'Total Courses', Value: reportData.overallStats.totalCourses },
        { Metric: 'Total Students', Value: reportData.overallStats.totalStudents },
        { Metric: 'Average Completion Rate', Value: `${reportData.overallStats.averageCompletionRate.toFixed(1)}%` },
        { Metric: 'Total Certificates Issued', Value: reportData.overallStats.totalCertificatesIssued }
      ];
      
      exportToCSV(csvData, `teacher-report-${new Date().toISOString().split('T')[0]}.csv`);
    } else {
      // Export as PDF (HTML for now, as per project requirements)
      const reportContent = generateReportHTML();
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `teacher-report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const generateReportHTML = (): string => {
    if (!reportData) return '';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Teaching Analytics Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #ddd; padding-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; }
        .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; }
        .generated-date { text-align: center; color: #6b7280; margin-top: 40px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Teaching Analytics Report</h1>
        <p>Teacher: ${user?.firstName} ${user?.lastName}</p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h2>Overview Statistics</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${reportData.overallStats.totalCourses}</div>
                <div class="stat-label">Total Courses</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${reportData.overallStats.totalStudents}</div>
                <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${reportData.overallStats.averageCompletionRate.toFixed(1)}%</div>
                <div class="stat-label">Avg Completion Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${reportData.overallStats.totalCertificatesIssued}</div>
                <div class="stat-label">Certificates Issued</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Course Performance</h2>
        <table>
            <thead>
                <tr>
                    <th>Course</th>
                    <th>Students</th>
                    <th>Completion Rate</th>
                    <th>Avg Score</th>
                    <th>Certificates</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.courses.map(course => `
                <tr>
                    <td>${course.title}</td>
                    <td>${course.studentsEnrolled}</td>
                    <td>${course.completionRate.toFixed(1)}%</td>
                    <td>${course.averageScore.toFixed(1)}%</td>
                    <td>${course.certificatesIssued}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="generated-date">
        Report generated on ${new Date().toLocaleString()}
    </div>
</body>
</html>
    `;
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
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm appearance-none pr-8"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">All time</option>
          </select>
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export PDF
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
                      <Button variant="outline" size="sm" onClick={() => navigate(`/teacher/courses/${course.id}/edit`)}>
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