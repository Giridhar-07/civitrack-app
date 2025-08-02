// Define types for the application

export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin?: boolean;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: IssueStatus;
  location: Location;
  photos: string[];
  reportedBy: string;
  reportedAt: Date;
  updatedAt: Date;
  flags?: Flag[];
  statusLogs?: StatusLog[];
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Flag {
  id: string;
  reason: string;
  reportedBy: string;
  reportedAt: Date;
}

export interface StatusLog {
  id: string;
  status: IssueStatus;
  changedBy: string;
  changedAt: Date;
  comment?: string;
}

export enum IssueStatus {
  REPORTED = 'reported',
  UNDER_REVIEW = 'under_review',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum IssueCategory {
  ROAD = 'road',
  WATER = 'water',
  ELECTRICITY = 'electricity',
  WASTE = 'waste',
  SAFETY = 'safety',
  OTHER = 'other'
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface IssueState {
  issues: Issue[];
  currentIssue: Issue | null;
  loading: boolean;
  error: string | null;
}