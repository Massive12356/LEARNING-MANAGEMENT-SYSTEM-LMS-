import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RichTextDisplay } from '../../components/ui/RichTextEditor';
import { studentReportService, StudentReportData } from '../../services/studentReportService';
import { useAuthStore } from '../../stores/authStore';
import {
  BookOpenIcon,
  DocumentTextIcon,
  TrophyIcon,
  UserIcon,
  ClockIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ChartBarIcon,
  AcademicCapIcon,
  FireIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { StudentLoginHistorySession, studentOverviewStats } from '../../types';
import { courseService } from '../../services/courseService';
import { isSessionActive } from '../../utils/sessionUtils';

export function StudentReports() {
  const { user } = useAuthStore();
  const [reportData, setReportData] = useState<StudentReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'courses' | 'tests' | 'certificates' | 'activity' | 'access'
  >('overview');
  const [downloadingCert, setDownloadingCert] = useState<string | null>(null);
  const [exportingReport, setExportingReport] = useState(false);
  const [notifiedCertificates, setNotifiedCertificates] = useState<string[]>([]);
  const [certData, setCertData] = useState<any[]>([]);
  const [overViewData, setOverViewData] = useState<studentOverviewStats | null>(null);
  const [sessions, setSessions] = useState<StudentLoginHistorySession[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add pagination functions for access logs
  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  // Check for new certificates and send notifications
  useEffect(() => {
    if (reportData && reportData.certificates.length > 0 && user?.role !== 'student') {
      reportData.certificates.forEach((certificate: any) => {
        if (!notifiedCertificates.includes(certificate.id)) {
          // Send notification for new certificate (only for non-student roles)
          studentReportService.sendCertificateNotification(
            user?.id || '',
            certificate.title,
            certificate.id
          );

          // Mark as notified
          setNotifiedCertificates((prev: string[]) => [...prev, certificate.id]);
        }
      });
    }
  }, [reportData, notifiedCertificates, user]);

  const loadReportData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Convert dateRange to actual date objects for the service
      const dateRangeObj = convertDateRangeToDateObject(dateRange);
      const data = await studentReportService.getStudentReport(user.id, dateRangeObj);
      setReportData(data);
    } catch (error) {
      console.error('Failed to load student report:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const loadOverviewData = async () => {
    if (!user) return;

    try {
      const data = await courseService.loadStudentOverviewStats();
      setOverViewData(data);
    } catch (error: any) {
      console.error(error?.message || 'Failed to load overview data:');
    }
  };

  const loadLoginHistory = async () => {
    if (!user) return;
    try {
      const response = await courseService.loadStudentLoginHistory(page, 10);
      setSessions(response?.sessions);
      setTotalPages(response?.totalPages || 1);
    } catch (error: any) {
      console.log(error?.message || 'Failed to load login history');
    }
  };

  const loadCertificateData = async () => {
    if (!user) return;
    try {
      const data = await courseService.loadCertificates();
      setCertData(data);
    } catch (error: any) {
      console.error( error?.message || 'Unknown error');
    }
  };

  // Convert date range string to date objects
  const convertDateRangeToDateObject = (range: string) => {
    const endDate = new Date();
    let startDate: Date;

    switch (range) {
      case '7':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '365':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return undefined; // All time
    }

    return { start: startDate, end: endDate };
  };

  const handleDownloadCertificate = async (certificateId: string) => {
    try {
      setDownloadingCert(certificateId);
      await studentReportService.downloadCertificate(certificateId);
      toast.success('Certificate download started!');
    } catch (error) {
      console.error('Certificate download failed:', error);
      toast.error('Failed to download certificate');
    } finally {
      setDownloadingCert(null);
    }
  };

  const handleExportReport = async () => {
    if (!reportData || !user) return;

    try {
      setExportingReport(true);
      await studentReportService.exportReportAsPDF(user.id, reportData);
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Report export failed:', error);
      toast.error('Failed to export report');
    } finally {
      setExportingReport(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getCompletionColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  useEffect(() => {
    loadReportData();
    loadOverviewData();
    loadLoginHistory();
    loadCertificateData();
  }, [dateRange, user, page]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Learning Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Comprehensive view of your learning progress and achievements
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            {studentReportService.getDateRangeOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={handleExportReport} disabled={exportingReport}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            {exportingReport ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: ChartBarIcon },
            // { key: 'courses', label: 'Courses', icon: BookOpenIcon },
            // { key: 'tests', label: 'Test Results', icon: DocumentTextIcon },
            { key: 'certificates', label: 'Certificates', icon: TrophyIcon },
            // { key: 'activity', label: 'Learning Activity', icon: FireIcon },
            { key: 'access', label: 'Access Logs', icon: ComputerDesktopIcon },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content - Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <BookOpenIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p
                    className={`${
                      loading ? 'text-sm' : 'text-2xl'
                    } font-bold text-gray-900 dark:text-white`}
                  >
                    {loading ? 'Loading...' : overViewData?.totalEnrolledCourses ?? 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enrolled Courses</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <AcademicCapIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p
                    className={`${
                      loading ? 'text-sm' : 'text-2xl'
                    } font-bold text-gray-900 dark:text-white`}
                  >
                    {loading ? 'Loading...' : overViewData?.totalCompletedCourses ?? 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed Courses</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <ClockIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p
                    className={`${
                      loading ? 'text-sm' : 'text-2xl'
                    } font-bold text-gray-900 dark:text-white`}
                  >
                    {loading ? 'Loading...' : overViewData?.totalTimeSpent ?? '0h 0m'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent Learning</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                  <TrophyIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p
                    className={`${
                      loading ? 'text-sm' : 'text-2xl'
                    } font-bold text-gray-900 dark:text-white`}
                  >
                    {loading ? 'Loading...' : overViewData?.certificatesEarned ?? 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Certificates Earned</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="text-center p-6">
                <div
                  className={`${
                    loading ? 'text-sm' : 'text-2xl'
                  } font-bold text-gray-900 dark:text-white`}
                >
                  {loading ? 'Loading...' : overViewData?.averageScore ?? '0%'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Average Score</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center p-6">
                <div
                  className={`${
                    loading ? 'text-sm' : 'text-2xl'
                  } font-bold text-gray-900 dark:text-white`}
                >
                  {loading ? 'Loading...' : overViewData?.totalLogins ?? 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Logins</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center p-6">
                <div
                  className={`${
                    loading ? 'text-sm' : 'text-2xl'
                  } font-bold text-gray-900 dark:text-white`}
                >
                  {loading ? 'Loading...' : overViewData?.averageSessionTime ?? '0h 0m'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Avg Session Time
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center p-6">
                <div className="flex items-center justify-center mb-2">
                  <FireIcon className="h-6 w-6 text-orange-500 mr-2" />
                  <span
                    className={`${
                      loading ? 'text-sm' : 'text-2xl'
                    } font-bold text-gray-900 dark:text-white`}
                  >
                    {loading ? 'Loading...' : overViewData?.totalDayStreak ?? 0}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab Content - Courses */}
      {activeTab === 'courses' && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Course Progress Details
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData?.enrolledCourses.map(course => (
                <div
                  key={course.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {course.title}
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <RichTextDisplay content={course.description} />
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getCompletionColor(
                            course.completionStatus
                          )}`}
                        >
                          {course.completionStatus.replace('-', ' ')}
                        </span>
                        <div className="flex items-center">
                          <UserIcon className="h-3 w-3 mr-1" />
                          {course.instructor}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {formatDuration(course.timeSpent)} spent
                        </div>
                        {course.lastAccessed && (
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            Last: {course.lastAccessed.toLocaleDateString()}
                          </div>
                        )}
                        {course.grade && (
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-3 w-3 mr-1" />
                            Grade: {course.grade}%
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {course.certificateAvailable &&
                        (() => {
                          const cert = reportData.certificates.find(c => c.courseId === course.id);
                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (cert) handleDownloadCertificate(cert.id);
                              }}
                              disabled={downloadingCert === cert?.id}
                            >
                              <TrophyIcon className="h-4 w-4 mr-1" />
                              {downloadingCert === cert?.id ? 'Downloading...' : 'Certificate'}
                            </Button>
                          );
                        })()}
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {course.progress}%
                        </div>
                        <div className="text-xs text-gray-500">Progress</div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        course.completionStatus === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Content - Test Results */}
      {activeTab === 'tests' && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Test Results & Scores
            </h2>
          </CardHeader>
          <CardContent>
            {reportData?.testResults && reportData.testResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Attempt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData?.testResults?.map(test => {
                      const course = reportData.enrolledCourses.find(c => c.id === test.courseId);
                      return (
                        <tr key={test.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {course?.title || 'Unknown Course'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {test.score}/{test.maxScore}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                test.percentage >= 80
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : test.percentage >= 60
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {test.percentage}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {test.attemptNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {test.submittedAt.toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No test results available yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab Content - Certificates */}
      {activeTab === 'certificates' && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Earned Certificates
            </h2>
          </CardHeader>
          <CardContent>
            {certData && certData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certData?.map(certificate => (
                  <div
                    key={certificate.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <TrophyIcon className="h-8 w-8 text-yellow-500 mb-2" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {certificate.title}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Credential ID:</span>
                        <span className="text-gray-900 dark:text-white font-mono text-xs">
                          {certificate.credentialId}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Issued:</span>
                        <span className="text-gray-900 dark:text-white">
                          {certificate.issuedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => handleDownloadCertificate(certificate.id)}
                        disabled={downloadingCert === certificate.id}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        {downloadingCert === certificate.id ? 'Downloading...' : 'Download'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/verify/${certificate.credentialId}`, '_blank')}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrophyIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No certificates earned yet.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Complete courses to earn certificates!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab Content - Learning Activity */}
      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Learning Activity Timeline
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData?.learningActivities?.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'certificate_earned'
                        ? 'bg-yellow-100 dark:bg-yellow-900'
                        : activity.type === 'lesson_complete'
                        ? 'bg-green-100 dark:bg-green-900'
                        : activity.type === 'quiz_attempt'
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : activity.type === 'course_start'
                        ? 'bg-purple-100 dark:bg-purple-900'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    {activity.type === 'certificate_earned' && (
                      <TrophyIcon className="h-4 w-4 text-yellow-600" />
                    )}
                    {activity.type === 'lesson_complete' && (
                      <AcademicCapIcon className="h-4 w-4 text-green-600" />
                    )}
                    {activity.type === 'quiz_attempt' && (
                      <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                    )}
                    {activity.type === 'course_start' && (
                      <BookOpenIcon className="h-4 w-4 text-purple-600" />
                    )}
                    {(activity.type === 'login' || activity.type === 'logout') && (
                      <ComputerDesktopIcon className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.type === 'certificate_earned' &&
                        `Earned certificate for ${activity.metadata?.courseName}`}
                      {activity.type === 'lesson_complete' &&
                        `Completed lesson: ${activity.metadata?.lessonTitle}`}
                      {activity.type === 'quiz_attempt' &&
                        `Quiz attempt (Score: ${activity.metadata?.score}%)`}
                      {activity.type === 'course_start' && 'Started new course'}
                      {activity.type === 'login' && 'Logged in'}
                      {activity.type === 'logout' && 'Logged out'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Content - Access Logs */}
      {activeTab === 'access' && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Access Logs & Login History
            </h2>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Login Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Logout Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Device
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <svg
                        className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                    </div>
                  ) : (
                    sessions.map((log: StudentLoginHistorySession) => (
                      <tr key={log.sessionId}>
                        {/* Login Time */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(log.loginTime).toLocaleString()}
                        </td>

                        {/* Logout Time */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {isSessionActive(log) ? (
                            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Active
                            </span>
                          ) : (
                            new Date(log.logoutTime as string).toLocaleString()
                          )}
                        </td>

                        {/* Duration */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {isSessionActive(log) ? '-' : formatDuration(Number(log.duration))}
                        </td>

                        {/* IP Address */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                          {log.ipAddress}
                        </td>

                        {/* Device */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <ComputerDesktopIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {log?.device}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for Access Logs */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg ${
                      page > 1
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                    .map(pageNumber => (
                      <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={`px-4 py-2 rounded-lg ${
                          page === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}

                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-lg ${
                      page < totalPages
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </div>

                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
