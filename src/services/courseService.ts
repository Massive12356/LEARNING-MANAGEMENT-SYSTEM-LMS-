import { AxiosError } from 'axios';
import { Course } from '../types';
import apiClient from './apiClient';

class CourseService {
  async createCourseDetials(formData: FormData, id: string) {
    try {
      const response = await apiClient.post(`/create/course/${id}/Description`, formData, {
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
}

export const courseService = new CourseService();
