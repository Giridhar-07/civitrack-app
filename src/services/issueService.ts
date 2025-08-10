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
      const response = await api.get<{ issues: Issue[]; pagination: any }>('\/issues', { params: filters });
      return response.data.issues;
    } catch (error) {
      throw error;
    }
  },

  getIssueById: async (id: string): Promise<Issue> => {
    try {
      const response = await api.get<Issue>(`\/issues\/${id}`);
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
      // Append location fields individually to match backend validation
      const { latitude, longitude, address } = issueData.location;
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
      // Ensure address is provided (fallback to lat,lng string if missing)
      const safeAddress = address && address.trim().length >= 5 
        ? address 
        : `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`;
      formData.append('address', safeAddress);
      
      // Append photos if any
      if (issueData.photos && issueData.photos.length > 0) {
        issueData.photos.forEach((photo) => {
          formData.append(`photos`, photo);
        });
      }

      const response = await api.post<Issue>('\/issues', formData, {
        headers: {
          'Content-Type': 'multipart\/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateIssueStatus: async (id: string, status: IssueStatus, comment?: string): Promise<Issue> => {
    try {
      const response = await api.put<Issue>(`\/issues\/${id}`, { 
        status, 
        statusComment: comment 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  flagIssue: async (id: string, reason: string): Promise<Issue> => {
    try {
      const response = await api.post<Issue>(`\/issues\/${id}\/flag`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getIssuesByUser: async (): Promise<Issue[]> => {
    try {
      const response = await api.get<{ issues: Issue[]; pagination: any }>('\/issues\/user\/me');
      return response.data.issues;
    } catch (error) {
      throw error;
    }
  },

  getNearbyIssues: async (latitude: number, longitude: number, radius: number = 5): Promise<Issue[]> => {
    try {
      const response = await api.get<Issue[]>('\/issues\/nearby', {
        params: { latitude, longitude, radius }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default issueService;