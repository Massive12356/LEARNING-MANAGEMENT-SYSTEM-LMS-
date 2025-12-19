import { AxiosError } from 'axios';
import apiClient from './apiClient';
import { courseSettings, createCoursePayload } from '../types';

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

  async createModules(formData:{}, courseId: string) {
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

  async getCreatedModules(courseId:string){
    try {
      const response = await apiClient.get(`/modules/${courseId}`);
      console.log("[courseService] SUCCESS RESPONSE FROM SERVER", response?.data)
      return response?.data?.courseModules;
    } catch (error) {
      const err = error as AxiosError<{message?:string}>
      console.log('[courseService] ERROR RESPONSE FROM SERVER', err?.response?.data?.message || err?.message);
      throw new Error(err?.message || err?.response?.data?.message)
    }
  }

  async createCourseContent(formData: FormData, id: string) {
    try {
      const response = await apiClient.post(`/create/course/${id}/content`, formData, {
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

  async courseSettings(courseId:string, payload: courseSettings){
     try {
      const response = await apiClient.post(`/create/course/${courseId}/settings`, payload);
      console.log("[courseSettings] SUCCESS RESPONSE FROM SERVER", response?.data)
      return response?.data
     } catch (error) {
      const err = error as AxiosError<{message?: string}>
      console.log("[courseService] ERROR RESPONSE FROM SERVER", err?.response?.data?.message || err?.message)
      throw new Error(err?.message || err?.response?.data?.message)
     }
  }

  async createCourse(payload:createCoursePayload){
    try {
      const response = await apiClient.post('/create/course/general', payload);
      console.log("[courseService] SUCCESS RESPONSE FROM SERVER", response?.data)
      return response?.data
    } catch (error) {
      const err = error as AxiosError<{message?:string}>
      console.log("[courseService] ERROR RESPONSE FROM SERVER", err?.response?.data?.message || err?.message)
      throw new Error(err?.message || err?.response?.data?.message)
    }
  }
}

export const courseService = new CourseService();
