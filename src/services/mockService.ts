import { User, Issue, IssueStatus, IssueCategory, Flag, StatusLog, Location } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'johndoe',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    createdAt: new Date('2023-01-15')
  },
  {
    id: '2',
    username: 'janesmith',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    createdAt: new Date('2023-02-20')
  },
  {
    id: '3',
    username: 'adminuser',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    isAdmin: true,
    createdAt: new Date('2022-12-01')
  },
];

// Mock location data
const mockLocations: Location[] = [
  { latitude: 40.7128, longitude: -74.0060, address: '123 Main St, New York, NY' },
  { latitude: 34.0522, longitude: -118.2437, address: '456 Oak Ave, Los Angeles, CA' },
  { latitude: 41.8781, longitude: -87.6298, address: '789 Pine Rd, Chicago, IL' },
  { latitude: 29.7604, longitude: -95.3698, address: '101 Maple Dr, Houston, TX' },
  { latitude: 39.9526, longitude: -75.1652, address: '202 Cedar Ln, Philadelphia, PA' },
];

// Mock status logs
const createMockStatusLogs = (issueId: string): StatusLog[] => [
  {
    id: uuidv4(),
    status: IssueStatus.REPORTED,
    changedBy: mockUsers[0].id,
    changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    comment: 'Issue reported'
  },
  {
    id: uuidv4(),
    status: IssueStatus.UNDER_REVIEW,
    changedBy: mockUsers[2].id,
    changedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    comment: 'Issue is being reviewed'
  },
];

// Mock flags
const createMockFlags = (issueId: string): Flag[] => [
  {
    id: uuidv4(),
    reason: 'Inappropriate content',
    reportedBy: mockUsers[1].id,
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    flaggedBy: mockUsers[1].username,
    flaggedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
  },
];

// Mock issue data
const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues',
    category: IssueCategory.ROAD,
    status: IssueStatus.REPORTED,
    location: mockLocations[0],
    photos: ['https://example.com/photo1.jpg'],
    reportedBy: mockUsers[0].id,
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    statusLogs: createMockStatusLogs('1'),
  },
  {
    id: '2',
    title: 'Broken Street Light',
    description: 'Street light not working at night',
    category: IssueCategory.ELECTRICITY,
    status: IssueStatus.UNDER_REVIEW,
    location: mockLocations[1],
    photos: ['https://example.com/photo2.jpg'],
    reportedBy: mockUsers[1].id,
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    statusLogs: createMockStatusLogs('2'),
    flags: createMockFlags('2'),
  },
  {
    id: '3',
    title: 'Water Leak',
    description: 'Water leaking from fire hydrant',
    category: IssueCategory.WATER,
    status: IssueStatus.IN_PROGRESS,
    location: mockLocations[2],
    photos: ['https://example.com/photo3.jpg'],
    reportedBy: mockUsers[0].id,
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    statusLogs: createMockStatusLogs('3'),
  },
  {
    id: '4',
    title: 'Illegal Dumping',
    description: 'Trash dumped in park area',
    category: IssueCategory.WASTE,
    status: IssueStatus.RESOLVED,
    location: mockLocations[3],
    photos: ['https://example.com/photo4.jpg'],
    reportedBy: mockUsers[1].id,
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    statusLogs: createMockStatusLogs('4'),
  },
  {
    id: '5',
    title: 'Suspicious Activity',
    description: 'Suspicious individuals loitering in the area',
    category: IssueCategory.SAFETY,
    status: IssueStatus.CLOSED,
    location: mockLocations[4],
    photos: ['https://example.com/photo5.jpg'],
    reportedBy: mockUsers[0].id,
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    statusLogs: createMockStatusLogs('5'),
  },
];

// Mock authentication token
const mockToken = 'mock-jwt-token';

// Mock service implementation
const mockService = {
  // Auth methods
  login: async (email: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      // In a real app, we would verify the password here
      return { user, token: mockToken };
    }
    throw new Error('Invalid credentials');
  },
  
  register: async (username: string, email: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    if (mockUsers.some(u => u.email === email || u.username === username)) {
      throw new Error('User already exists');
    }
    
    // Create new user
    const newUser: User = {
      id: uuidv4(),
      username,
      name: username, // Default name to username
      email,
      role: 'user',
      createdAt: new Date()
    };
    
    mockUsers.push(newUser);
    return { user: newUser, token: mockToken };
  },
  
  getCurrentUser: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, we would verify the token and return the corresponding user
    return mockUsers[0];
  },
  
  // Issue methods
  getAllIssues: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockIssues;
  },
  
  getIssueById: async (id: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const issue = mockIssues.find(i => i.id === id);
    if (!issue) {
      throw new Error('Issue not found');
    }
    return issue;
  },
  
  createIssue: async (issueData: any) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newIssue: Issue = {
      id: uuidv4(),
      title: issueData.title,
      description: issueData.description,
      category: issueData.category,
      status: IssueStatus.REPORTED,
      location: issueData.location,
      photos: issueData.photos ? ['https://example.com/mock-photo.jpg'] : [],
      reportedBy: mockUsers[0].id,
      reportedAt: new Date(),
      updatedAt: new Date(),
      statusLogs: [{
        id: uuidv4(),
        status: IssueStatus.REPORTED,
        changedBy: mockUsers[0].id,
        changedAt: new Date(),
        comment: 'Issue reported'
      }]
    };
    
    mockIssues.push(newIssue);
    return newIssue;
  },
  
  updateIssueStatus: async (id: string, status: IssueStatus, comment?: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const issue = mockIssues.find(i => i.id === id);
    if (!issue) {
      throw new Error('Issue not found');
    }
    
    issue.status = status;
    issue.updatedAt = new Date();
    
    const statusLog: StatusLog = {
      id: uuidv4(),
      status,
      changedBy: mockUsers[0].id,
      changedAt: new Date(),
      comment: comment || `Status changed to ${status}`
    };
    
    if (!issue.statusLogs) {
      issue.statusLogs = [];
    }
    
    issue.statusLogs.push(statusLog);
    return issue;
  },
  
  flagIssue: async (id: string, reason: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const issue = mockIssues.find(i => i.id === id);
    if (!issue) {
      throw new Error('Issue not found');
    }
    
    const flag: Flag = {
      id: uuidv4(),
      reason,
      reportedBy: mockUsers[0].id,
      reportedAt: new Date(),
      flaggedBy: mockUsers[0].username,
      flaggedAt: new Date()
    };
    
    if (!issue.flags) {
      issue.flags = [];
    }
    
    issue.flags.push(flag);
    return issue;
  },
  
  getIssuesByUser: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter issues by current user (in this case, mockUsers[0])
    return mockIssues.filter(issue => issue.reportedBy === mockUsers[0].id);
  },
  
  getNearbyIssues: async (latitude: number, longitude: number, radius: number = 5) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, we would calculate distance and filter by radius
    // For mock purposes, just return all issues
    return mockIssues;
  }
};

export default mockService;