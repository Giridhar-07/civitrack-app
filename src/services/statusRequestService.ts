import api from './api';
import { IssueStatus } from '../types';

export type StatusRequestAction = 'approve' | 'reject';
export type StatusRequestState = 'pending' | 'approved' | 'rejected';

export interface StatusRequest {
  id: string;
  issueId: string;
  requestedBy: string;
  currentStatus: IssueStatus | string;
  requestedStatus: IssueStatus | string;
  reason?: string;
  status: StatusRequestState;
  reviewedBy?: string | null;
  reviewedAt?: string | Date | null;
  reviewComment?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Optional expanded relations
  issue?: any;
  requester?: any;
  reviewer?: any;
}

const statusRequestService = {
  // Create a status change request for a specific issue
  requestStatusChange: async (
    issueId: string,
    requestedStatus: IssueStatus,
    reason?: string
  ): Promise<StatusRequest> => {
    const response = await api.post<StatusRequest>(`/status-requests/issue/${issueId}`, {
      requestedStatus,
      reason
    });
    return response.data as unknown as StatusRequest;
  },

  // Get status requests for a specific issue (public)
  getIssueStatusRequests: async (issueId: string): Promise<StatusRequest[]> => {
    const response = await api.get<StatusRequest[]>(`/status-requests/issue/${issueId}`);
    return response.data as unknown as StatusRequest[];
  },

  // Get current user's status requests
  getMyStatusRequests: async (): Promise<StatusRequest[]> => {
    const response = await api.get<StatusRequest[]>(`/status-requests/user/me`);
    return response.data as unknown as StatusRequest[];
  },

  // Admin: list all status requests
  adminGetStatusRequests: async (params?: { page?: number; limit?: number; status?: StatusRequestState }): Promise<{ statusRequests: StatusRequest[]; pagination: any; }> => {
    const response = await api.get<{ statusRequests: StatusRequest[]; pagination: any }>(`/status-requests`, { params });
    return response.data;
  },

  // Admin: review a status request
  adminReviewStatusRequest: async (
    id: string,
    action: StatusRequestAction,
    reviewComment?: string
  ): Promise<StatusRequest> => {
    const response = await api.put<StatusRequest>(`/status-requests/${id}/review`, {
      action,
      reviewComment
    });
    return response.data as unknown as StatusRequest;
  }
};

export default statusRequestService;