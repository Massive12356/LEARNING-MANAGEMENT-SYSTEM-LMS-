import { Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

import { CertificateVerification } from '../pages/public/CertificateVerification';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { CourseViewer } from '../pages/student/CourseViewer';
import CourseDetails from '../pages/student/CourseDetails';
import { ProgramViewer } from '../pages/student/ProgramViewer';
import { StudentReports } from '../pages/student/StudentReports';
import { StudentSettings } from '../pages/student/StudentSettings';
import { StudentTodoPage } from '../pages/student/StudentTodoPage';
import { CourseEnrollment } from '../pages/student/CourseEnrollment';
import { NotificationList } from '../pages/notifications/NotificationList';
import { MyCoursesPage } from '../pages/student/courses/MyCoursesPage';
import { DiscoverCoursesPage } from '../pages/student/courses/DiscoverCoursesPage';
import { CertificatePreviewPage } from '../pages/student/CertificatePreviewPage';

// Teacher Pages
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { TeacherTodoPage } from '../pages/teacher/TeacherTodoPage';
import { CourseBuilder } from '../pages/teacher/CourseBuilder';
import { CourseList as TeacherCourseList } from '../pages/teacher/CourseList';
import CertificateManagement from '../pages/teacher/CertificateManagement';
import { ProgramBuilder } from '../pages/teacher/ProgramBuilder';
import { ProgramList } from '../pages/teacher/ProgramList';
import { TeacherReports } from '../pages/teacher/TeacherReports';
import { NotificationManagement } from '../pages/notifications/NotificationManagement';
import { TeacherSettings } from '../pages/teacher/TeacherSettings';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { UserDetail } from '../pages/admin/UserDetail';
import AdminCourseList from '../pages/admin/CourseList';
import { ProgramList as AdminProgramList } from '../pages/admin/ProgramList';
import { OrganizationSettings } from '../pages/admin/OrganizationSettings';
import { OrganizationAnalytics } from '../pages/admin/OrganizationAnalytics';
import { EmailTemplateEditor } from '../pages/admin/EmailTemplateEditor';
import { AdminReports } from '../pages/admin/AdminReports';
import { AdminSettings } from '../pages/admin/AdminSettings';

// Superuser Pages
import { SuperuserDashboard } from '../pages/superuser/SuperuserDashboard';
import CreateAdmin from '../pages/superuser/CreateAdmin';
import { OrganizationManagement } from '../pages/superuser/OrganizationManagement';
import { SystemReports } from '../pages/superuser/SystemReports';
import { SystemSettings } from '../pages/superuser/SystemSettings';
import SuperuserUserManagement from '../pages/superuser/UserManagement';

// Test Components
import NotificationPreferencesTest from '../test/NotificationPreferencesTest';
import NotificationPreferencesTestPage from '../NotificationPreferencesTest';
import ZustandTest from '../test/ZustandTest';

// Common Pages
import { NotFound } from '../pages/NotFound';
import { Onboarding } from '../pages/Onboarding';

export const AppRoutes: React.FC = () => {
  const { user} = useAuthStore();


  // Redirect based on user role
  const getRoleBasedRedirect = () => {
    if (!user) return '/login';
    // Normalize role from either 'role' or 'accountType'
    const role = user.role
    switch (role) {
      case 'student':
        return '/student/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'superuser':
        return '/superuser/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={getRoleBasedRedirect()} replace />
          ) : (
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to={getRoleBasedRedirect()} replace />
          ) : (
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthLayout>
            <ForgotPasswordPage />
          </AuthLayout>
        }
      />
      <Route
        path="/verify-code"
        element={
          <AuthLayout>
            <ForgotPasswordPage />
          </AuthLayout>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <AuthLayout>
            <ResetPasswordPage />
          </AuthLayout>
        }
      />
      <Route
        path="/reset-password/verified"
        element={
          <AuthLayout>
            <ResetPasswordPage />
          </AuthLayout>
        }
      />
      <Route path="/verify/:credentialId" element={<CertificateVerification />} />

      {/* Onboarding */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="enrollment" element={<CourseEnrollment />} />
                <Route path="course/:courseId" element={<CourseViewer />} />
                <Route path="course/:courseId/details" element={<CourseDetails />} />
                <Route path="program/:programId" element={<ProgramViewer />} />
                <Route path="reports" element={<StudentReports />} />
                <Route path="todo" element={<StudentTodoPage />} />
                <Route path="my-courses" element={<MyCoursesPage />} />
                <Route path="discover" element={<DiscoverCoursesPage />} />
                <Route path="notifications" element={<NotificationList />} />
                <Route path="settings" element={<StudentSettings />} />
                <Route path="certificate/preview/:certificateId" element={<CertificatePreviewPage />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin', 'superuser']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="todo" element={<TeacherTodoPage />} />
                <Route path="courses" element={<TeacherCourseList />} />
                <Route path="courses/new" element={<CourseBuilder />} />
                <Route path="courses/:courseId/edit" element={<CourseBuilder />} />
                <Route path="certificates" element={<CertificateManagement />} />
                <Route path="notifications" element={<NotificationManagement />} />
                <Route path="notifications/list" element={<NotificationList />} />
                <Route path="programs" element={<ProgramList />} />
                <Route path="programs/new" element={<ProgramBuilder />} />
                <Route path="programs/:programId/edit" element={<ProgramBuilder />} />
                <Route path="reports" element={<TeacherReports />} />
                <Route path="settings" element={<TeacherSettings />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin', 'superuser']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="users/:userId" element={<UserDetail />} />
                <Route path="courses" element={<AdminCourseList />} />
                <Route path="programs" element={<AdminProgramList />} />
                <Route path="organization" element={<OrganizationSettings />} />
                <Route path="analytics/:orgId" element={<OrganizationAnalytics />} />
                <Route path="email-templates" element={<EmailTemplateEditor />} />
                <Route path="notifications" element={<NotificationManagement />} />
                <Route path="notifications/list" element={<NotificationList />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Superuser Routes */}
      <Route
        path="/superuser/*"
        element={
          <ProtectedRoute allowedRoles={['superuser']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<SuperuserDashboard />} />
                <Route path="create-admin" element={<CreateAdmin />} />
                <Route path="organizations" element={<OrganizationManagement />} />
                <Route path="organization" element={<OrganizationSettings />} />
                <Route path="users" element={<SuperuserUserManagement />} />
                <Route path="users/:userId" element={<UserDetail />} />
                <Route path="reports" element={<SystemReports />} />
                <Route path="settings" element={<SystemSettings />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Test Routes (temporary) */}
      <Route
        path="/test/notification-preferences"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <NotificationPreferencesTest />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/test/notification-preferences-page"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <NotificationPreferencesTestPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/test/zustand"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ZustandTest />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Root Redirect */}
      <Route path="/" element={<Navigate to={getRoleBasedRedirect()} replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
