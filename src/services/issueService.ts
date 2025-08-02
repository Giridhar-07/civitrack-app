import api from './api';
import { Issue, Location, IssueStatus, IssueCategory } from '../types';

export interface IssueFormData {
  title: string;
  description: string;
  category: IssueCategory;
  location: Location;
  photos?: File[];
}

export interface IssueFilterParams {
  category?: IssueCategory;
  status?: IssueStatus;
  distance?: number;
  latitude?: number;
  longitude?: number;
}

const issueService = {
  getAllIssues: async (filters?: IssueFilterParams): Promise<Issue[]> => {
    try {
      const response = await api.get<Issue[]>('/issues', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getIssueById: async (id: string): Promise<Issue> => {
    try {
      const response = await api.get<Issue>(`/issues/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createIssue: async (issueData: IssueFormData): Promise<Issue> => {
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('title', issueData.title);
      formData.append('description', issueData.description);
      formData.append('category', issueData.category);
      formData.append('location', JSON.stringify(issueData.location));
      
      // Append photos if any
      if (issueData.photos && issueData.photos.length > 0) {
        issueData.photos.forEach((photo, index) => {
          formData.append(`photos`, photo);
        });
      }

      const response = await api.post<Issue>('/issues', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateIssueStatus: async (id: string, status: IssueStatus, comment?: string): Promise<Issue> => {
    try {
      const response = await api.patch<Issue>(`/issues/${id}/status`, { status, comment });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  flagIssue: async (id: string, reason: string): Promise<Issue> => {
    try {
      const response = await api.post<Issue>(`/issues/${id}/flag`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getIssuesByUser: async (): Promise<Issue[]> => {
    try {
      const response = await api.get<Issue[]>('/issues/user');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getNearbyIssues: async (latitude: number, longitude: number, radius: number = 5): Promise<Issue[]> => {
    try {
      const response = await api.get<Issue[]>('/issues/nearby', {
        params: { latitude, longitude, radius }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default issueService;