import { AxiosError } from 'axios';
import apiClient from './apiClient';
import {
  coursePerformanceAnalytics,
  courseSettings,
  createCoursePayload,
  DashboardAnalyticsResponse,
  EditModulePayload,
  programPayload,
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

  // adding program  details here too
  async loadAllPrograms(organizationId: string) {
    try {
      const response = await apiClient.get(`/programs/organization/${organizationId}`);
      console.log('[courseService LOAD_ALL_PROGRAMS] SUCCESS RESPONSE FROM SERVER', response?.data?.data);
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
}

export const courseService = new CourseService();
