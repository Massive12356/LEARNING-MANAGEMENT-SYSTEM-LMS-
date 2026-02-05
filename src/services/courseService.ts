import { AxiosError } from 'axios';
import apiClient from './apiClient';
import {
  coursePerformanceAnalytics,
  courseSettings,
  createCoursePayload,
  DashboardAnalyticsResponse,
  EditModulePayload,
  programPayload,
  StudentLoginHistoryResponse,
  SubmitQuizPayload,
} from '../types';

class CourseService {
  //service functions for handling posting courses
  async createCourseDetials(formData: FormData) {
    try {
      const response = await apiClient.post(`/create/program/description`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('[CourseService] RESPONSE FROM SERVER:', response.data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log('[CourseService] ERROR FROM SERVER:', err.response?.data?.message || err.message);

      throw new Error(err.response?.data?.message || err.message);
    }
  }

  async createModules(formData: {}, courseId: string) {
    try {
      const response = await apiClient.post(`/create/course/${courseId}/module`, formData);
      console.log('[courseService] RESPONSE FROM SERVER', response?.data);
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.response?.data?.message || err?.message
      );
      throw new Error(err?.response?.data?.message || err?.message);
    }
  }

  async getCreatedModules(courseId: string) {
    try {
      const response = await apiClient.get(`/modules/${courseId}`);
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data);
      return response?.data?.courseModules;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.response?.data?.message || err?.message
      );
      throw new Error(err?.message || err?.response?.data?.message);
    }
  }

  async createCourseContent(formData: FormData, id: string) {
    try {
      const response = await apiClient.post(`/create/course/${id}/content`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('[courseService CreateLesson]  SUCCESS RESPONSE FROM SERVER', response?.data);
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService CreateLesson] ERROR RESPONSE FROM SERVER',
        err?.response?.data?.message || err?.message
      );
      throw new Error(err?.response?.data?.message || err?.message);
    }
  }

  async editCourseContent(formData: FormData, id: string) {
    try {
      const response = await apiClient.patch(`/content/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data);
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.response?.data?.message || err?.message
      );
      throw new Error(err?.response?.data?.message || err?.message);
    }
  }

  async courseSettings(courseId: string, payload: courseSettings) {
    try {
      const response = await apiClient.post(`/create/course/${courseId}/settings`, payload);
      console.log('[courseSettings] SUCCESS RESPONSE FROM SERVER', response?.data);
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.response?.data?.message || err?.message
      );
      throw new Error(err?.message || err?.response?.data?.message);
    }
  }

  async createCourse(payload: createCoursePayload) {
    try {
      const response = await apiClient.post('/create/course/general', payload);
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data);
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.response?.data?.message || err?.message
      );
      throw new Error(err?.message || err?.response?.data?.message);
    }
  }

  async teacherDashboardStats() {
    try {
      const response = await apiClient.get('/teacher/stats');
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data);
      return response?.data?.stats;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.response?.data?.message ?? err?.message
      );

      throw new Error(err?.response?.data?.message ?? err?.message);
    }
  }

  async loadAllCourses() {
    try {
      const response = await apiClient.get('/course/general');
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data);
      return response?.data?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.response?.data?.message ?? err?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async loadProgramStats() {
    try {
      const response = await apiClient.get('/program/statistics');
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data?.statistics);
      return response?.data?.statistics;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.response?.data?.message ?? err?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async createProgram(payload: programPayload) {
    try {
      const response = await apiClient.post('/create/program', payload);
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data);
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.response?.data?.message ?? err?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async loadTeacherAnalytics() {
    try {
      const response = await apiClient.get('/analytics/teaching');
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data?.analytics);
      return response?.data?.analytics;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.response?.data?.message ?? err?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async loadRecentActivities() {
    try {
      const response = await apiClient.get('analytics/recent-activities');
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data?.activities);
      return response?.data?.activities;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async loadCoursePerformance(): Promise<coursePerformanceAnalytics[]> {
    try {
      const response = await apiClient.get('/analytics/course-performance');

      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data);

      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async loadDashboardAnalytics() {
    try {
      const response = await apiClient.get('/analytics/dashboard-stats');
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data?.stats);
      return response?.data?.stats;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async loadDashStat() {
    try {
      const response = await apiClient.get<DashboardAnalyticsResponse>(
        '/analytics/weekly-activities'
      );
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data?.data);
      return response?.data?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.response?.data?.message ?? err?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async PopularCourses() {
    try {
      const response = await apiClient.get('/analytics/popular-courses');
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data?.data);
      return response?.data?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  // editing courses service functions
  async editModule(moduleId: string, payload: EditModulePayload) {
    try {
      const response = await apiClient.patch(`/module/${moduleId}`, payload);
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data);
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  // deleting modules, lessons and general courses created
  async deleteModule(moduleId: string) {
    try {
      const response = await apiClient.delete(`/module/${moduleId}`);
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data);
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async deleteLesson(lessonId: string) {
    try {
      const response = await apiClient.delete(`/content/${lessonId}`);
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data);
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async deleteCourse(courseId: string) {
    try {
      const response = await apiClient.delete(`/course/general/${courseId}`);
      console.log('[courseService] SUCCESS RESPONSE FROM SERVER', response?.data);
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async loadFullCourses(organizationId: string, page = 1, limit = 10) {
    try {
      const response = await apiClient.get(
        `/organizations/${organizationId}/course-generals?${page}&${limit}`
      );
      console.log('[courseService LOAD_FULL_COURSES] SUCCESS RESPONSE FROM SERVER', response?.data);
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService LOAD_FULL_COURSES] ERROR RESPONSE FROM SERVER',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  // adding program  details here too
  async loadAllPrograms(organizationId: string) {
    try {
      const response = await apiClient.get(`/programs/organization/${organizationId}`);
      console.log(
        '[courseService LOAD_ALL_PROGRAMS] SUCCESS RESPONSE FROM SERVER',
        response?.data?.data
      );
      return response?.data?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService] ERROR RESPONSE FROM SERVER',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async enrollInCourse(courseId: string) {
    try {
      const response = await apiClient.post(`/enroll/${courseId}`);
      console.log('[courseService ENROLL_IN_COURSE] SUCCESS RESPONSE FROM SERVER', response?.data);
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService ENROLL_IN_COURSE] ERROR RESPONSE FROM SERVER',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async loadEnrolledCourses() {
    try {
      const response = await apiClient.get(`/my-enrollments`);
      console.log(
        '[courseService LOAD_ENROLLED_COURSES] SUCCESS RESPONSE FROM SERVER',
        response?.data?.enrollments
      );
      return response?.data?.enrollments;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService LOAD_ENROLLED_COURSES] ERROR RESPONSE FROM SERVER',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async loadStudentOverviewStats() {
    try {
      const response = await apiClient.get('/student/overview');
      console.log(
        '[courseService LOAD_STUDENT_OVERVIEW_STATS] SUCCESS RESPONSE FROM SERVER:',
        response?.data
      );
      return response?.data?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService LOAD_STUDENT_OVERVIEW_STATS] ERROR RESPONSE FROM SERVER:',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async loadStudentLoginHistory(page = 1, limit = 10): Promise<StudentLoginHistoryResponse> {
    try {
      const { data } = await apiClient.get<StudentLoginHistoryResponse>(
        '/user/access-login/history',
        {
          params: { page, limit },
        }
      );

      console.log('[courseService LOAD_STUDENT_HISTORY] SUCCESS RESPONSE FROM SERVER:', data);

      return data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;

      console.log(
        '[courseService LOAD_STUDENT_HISTORY] ERROR RESPONSE FROM SERVER:',
        err.response?.data?.message ?? err.message
      );

      throw new Error(err.response?.data?.message ?? err.message);
    }
  }

  async loadCertificates() {
    try {
      const response = await apiClient.get('/my-certificates');
      console.log(
        '[courseService LOAD_CERTIFICATES] SUCCESS RESPONSE FROM SERVER:',
        response?.data?.certificates
      );
      return response?.data?.certificates;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService LOAD_CERTIFICATES] ERROR RESPONSE FROM SERVER:',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async getCourseById(courseId: string) {
    try {
      const response = await apiClient.get(`/course/general/${courseId}`);
      console.log(
        '[courseService GET_COURSE_BY_ID] SUCCESS RESPONSE FROM SERVER:',
        response?.data?.data
      );
      return response?.data?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService GET_COURSE_BY_ID] ERROR RESPONSE FROM SERVER:',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  // submitting a quiz attempt
  async submitQuizAttempt(payload: SubmitQuizPayload) {
    try {
      const response = await apiClient.post(`/quiz/submit`, payload);
      console.log(
        '[courseService SUBMIT_QUIZ_ATTEMPT] SUCCESS RESPONSE FROM SERVER:',
        response?.data
      );
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService SUBMIT_QUIZ_ATTEMPT] ERROR RESPONSE FROM SERVER:',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  // student start a quiz attempt
  async startQuizAttempt(contentId: string) {
    try {
      const response = await apiClient.post(`/quiz/start/${contentId}`);
      console.log(
        '[courseService START_QUIZ_ATTEMPT] SUCCESS RESPONSE FROM SERVER:',
        response?.data?.quiz
      );
      return response?.data?.quiz;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService START_QUIZ_ATTEMPT] ERROR RESPONSE FROM SERVER:',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  // Getting results of a quiz attempt
  async getQuizResults(contentId: string) {
    try {
      const response = await apiClient.get(`/quiz/results/${contentId}`);
      console.log('[courseService GET_QUIZ_RESULTS] SUCCESS RESPONSE FROM SERVER:', response?.data);
      return response?.data;
    } catch (err: any) {
      // ✅ Handle 404 gracefully, do NOT throw
      if (err.response?.status === 404) {
        console.log('[courseService GET_QUIZ_RESULTS] No previous results for this quiz.');
        return null; // <-- return, do NOT throw
      }

      // Other errors: throw so interceptor can show toast
      throw err;
    }
  }

  // student marks a course content as Done
  async markContentAsDone(contentId: string) {
    try {
      const response = await apiClient.patch(`/student/content/${contentId}/done`);
      console.log(
        '[courseService MARK_CONTENT_AS_DONE] SUCCESS RESPONSE FROM SERVER:',
        response?.data
      );
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService MARK_CONTENT_AS_DONE] ERROR RESPONSE FROM SERVER:',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  // Student marks a course module done
  async markModuleAsCompleted(moduleId: string, courseId: string) {
    try {
      const response = await apiClient.patch(`/student/module/${moduleId}/course/${courseId}`);
      console.log(
        '[courseService MARK_MODULE_AS_COMPLETED] SUCCESS RESPONSE FROM SERVER:',
        response?.data
      );
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService MARK_MODULE_AS_COMPLETED] ERROR RESPONSE FROM SERVER:',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  // student marks a course as Completed
  async markCourseAsCompleted(id: string) {
    try {
      const response = await apiClient.patch(`/course-general/${id}/complete`);
      console.log(
        '[courseService MARK_COURSE_AS_COMPLETED] SUCCESS RESPONSE FROM SERVER:',
        response?.data
      );
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService MARK_COURSE_AS_COMPLETED] ERROR RESPONSE FROM SERVER:',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }

  async getStudentCourseProgress(courseId: string) {
    try {
      const response = await apiClient.get(`/progress/${courseId}`);
      console.log(
        '[courseService GET_STUDENT_COURSE_PROGRESS] SUCCESS RESPONSE FROM SERVER:',
        response?.data
      );
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[courseService GET_STUDENT_COURSE_PROGRESS] ERROR RESPONSE FROM SERVER:',
        err?.message ?? err?.response?.data?.message
      );
      throw new Error(err?.message ?? err?.response?.data?.message);
    }
  }
}
export const courseService = new CourseService();
