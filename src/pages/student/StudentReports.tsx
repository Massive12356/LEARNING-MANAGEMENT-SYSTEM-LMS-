import { useState, useEffect } from 'react';
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
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function StudentReports() {
  const { user } = useAuthStore();
  const [reportData, setReportData] = useState<StudentReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'tests' | 'certificates' | 'activity' | 'access'>('overview');
  const [downloadingCert, setDownloadingCert] = useState<string | null>(null);
  const [exportingReport, setExportingReport] = useState(false);
  const [notifiedCertificates, setNotifiedCertificates] = useState<string[]>([]);

  useEffect(() => {
    loadReportData();
  }, [dateRange, user]);

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
        <Button className="mt-4" onClick={loadReportData}>
          Retry Loading
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative p-10 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-purple-200 text-sm font-medium">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                <span>Learning Analytics</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                My Student Report
              </h1>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                Track your achievements and monitor your learning trajectory.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer backdrop-blur-sm"
              >
                {studentReportService.getDateRangeOptions().map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 rounded-xl px-6 h-11 border border-white/10 transition-all font-bold"
                onClick={handleExportReport}
                disabled={exportingReport}
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                {exportingReport ? 'Exporting...' : 'Export PDF'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Modern Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-[1.25rem] w-fit border border-gray-200 dark:border-gray-700">
        {[
          { key: 'overview', label: 'Overview', icon: ChartBarIcon },
          { key: 'courses', label: 'Courses', icon: BookOpenIcon },
          { key: 'tests', label: 'Test Results', icon: DocumentTextIcon },
          { key: 'certificates', label: 'Certificates', icon: TrophyIcon },
          { key: 'activity', label: 'Activity', icon: FireIcon },
          { key: 'access', label: 'Security', icon: ComputerDesktopIcon }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === key
              ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content - Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                  <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {reportData.overallStats.totalEnrolled}
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Courses Enrolled
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20">
                  <AcademicCapIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {reportData.overallStats.totalCompleted}
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Courses Completed
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20">
                  <ClockIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {formatDuration(reportData.overallStats.totalTimeSpent)}
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Hours Engaged
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20">
                  <TrophyIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {reportData.overallStats.certificatesEarned}
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Certificates Earned
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {reportData.overallStats.averageScore}%
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Average Score
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {reportData.overallStats.totalLogins}
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Total Logins
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {formatDuration(reportData.overallStats.averageSessionDuration)}
              </p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Avg Session
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <FireIcon className="h-6 w-6 text-orange-500" />
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reportData.overallStats.streakDays}
                </p>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Day Streak
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - Courses */}
      {activeTab === 'courses' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <BookOpenIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Course Progress Details
            </h2>
          </div>

          <div className="space-y-6">
            {reportData.enrolledCourses.map((course) => (
              <div key={course.id} className="group p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-500/30 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {course.title}
                      </h3>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${course.completionStatus === 'completed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                        {course.completionStatus.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                      <RichTextDisplay content={course.description} />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                        {course.instructor}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                        {formatDuration(course.timeSpent)} spent
                      </div>
                      {course.lastAccessed && (
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                          Last: {course.lastAccessed.toLocaleDateString()}
                        </div>
                      )}
                      {course.grade && (
                        <div className="flex items-center text-purple-600 dark:text-purple-400">
                          <DocumentTextIcon className="h-4 w-4 mr-1.5" />
                          Grade: {course.grade}%
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {course.certificateAvailable && (() => {
                      const cert = reportData.certificates.find(c => c.courseId === course.id);
                      return (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl px-4 h-10 bg-white dark:bg-gray-800 text-xs font-bold border-gray-200 dark:border-gray-700"
                          onClick={() => {
                            if (cert) handleDownloadCertificate(cert.id);
                          }}
                          disabled={downloadingCert === cert?.id}
                        >
                          <TrophyIcon className="h-4 w-4 mr-2 text-yellow-500" />
                          {downloadingCert === cert?.id ? 'Wait...' : 'Certificate'}
                        </Button>
                      );
                    })()}
                    <div className="text-right flex-shrink-0">
                      <div className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                        {course.progress}%
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Progress</div>
                    </div>
                  </div>
                </div>

                <div className="relative w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${course.completionStatus === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                    style={{ width: `${course.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content - Test Results */}
      {activeTab === 'tests' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-xl">
              <DocumentTextIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Test Results & Scores
            </h2>
          </div>

          {reportData.testResults.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Course</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Result</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Attempt</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {reportData.testResults.map((test) => {
                    const course = reportData.enrolledCourses.find(c => c.id === test.courseId);
                    return (
                      <tr key={test.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {course?.title || 'Unknown Course'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {test.score} / {test.maxScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${test.percentage >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              test.percentage >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                            {test.percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          #{test.attemptNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {test.submittedAt.toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-bold">No test results available yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content - Certificates */}
      {activeTab === 'certificates' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
              <TrophyIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Earned Certificates
            </h2>
          </div>

          {reportData.certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportData.certificates.map((certificate) => (
                <div key={certificate.id} className="group p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-yellow-500/30 transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <TrophyIcon className="h-10 w-10 text-yellow-500 shadow-yellow-500/20" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 min-h-[3.5rem]">
                    {certificate.title}
                  </h3>

                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-400 uppercase tracking-widest">ID:</span>
                      <span className="text-gray-900 dark:text-white font-mono bg-white dark:bg-gray-800 px-2 py-0.5 rounded">
                        {certificate.credentialId.substring(0, 12)}...
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-400 uppercase tracking-widest">Issued:</span>
                      <span className="text-gray-900 dark:text-white font-bold">
                        {certificate.issuedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 rounded-xl h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
                      size="sm"
                      onClick={() => handleDownloadCertificate(certificate.id)}
                      disabled={downloadingCert === certificate.id}
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      {downloadingCert === certificate.id ? 'Wait...' : 'Download'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl h-10 w-10 p-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => window.open(`/verify/${certificate.credentialId}`, '_blank')}
                    >
                      <EyeIcon className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <TrophyIcon className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
              <p className="text-gray-900 dark:text-white font-bold text-lg mb-2">No certificates earned yet.</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                Complete your enrolled courses and excel in assessments to earn professional certifications.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content - Learning Activity */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-xl">
              <FireIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Learning Activity Timeline
            </h2>
          </div>

          <div className="space-y-4">
            {reportData.learningActivities.map((activity) => (
              <div key={activity.id} className="group flex items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-purple-500/30 transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${activity.type === 'certificate_earned' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600' :
                  activity.type === 'lesson_complete' ? 'bg-green-100 dark:bg-green-900 text-green-600' :
                    activity.type === 'quiz_attempt' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' :
                      activity.type === 'course_start' ? 'bg-purple-100 dark:bg-purple-900 text-purple-600' :
                        'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700'
                  }`}>
                  {activity.type === 'certificate_earned' && <TrophyIcon className="h-6 w-6" />}
                  {activity.type === 'lesson_complete' && <AcademicCapIcon className="h-6 w-6" />}
                  {activity.type === 'quiz_attempt' && <DocumentTextIcon className="h-6 w-6" />}
                  {activity.type === 'course_start' && <BookOpenIcon className="h-6 w-6" />}
                  {(activity.type === 'login' || activity.type === 'logout') && <ComputerDesktopIcon className="h-6 w-6" />}
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {activity.type === 'certificate_earned' && `Earned certificate for ${activity.metadata?.courseName}`}
                    {activity.type === 'lesson_complete' && `Completed lesson: ${activity.metadata?.lessonTitle}`}
                    {activity.type === 'quiz_attempt' && `Quiz attempt (Score: ${activity.metadata?.score}%)`}
                    {activity.type === 'course_start' && 'Started new course'}
                    {activity.type === 'login' && 'Logged in'}
                    {activity.type === 'logout' && 'Logged out'}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {activity.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content - Access Logs */}
      {activeTab === 'access' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <ComputerDesktopIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Security & Access History
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Login Time</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logout Time</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">IP Address</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Device</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {reportData.accessLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                      {log.loginTime.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.logoutTime ? (
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {log.logoutTime.toLocaleString()}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Active Now
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.duration ? formatDuration(log.duration) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ComputerDesktopIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.userAgent.includes('Mac') ? 'macOS' : log.userAgent.includes('Windows') ? 'Windows' : 'Other'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}