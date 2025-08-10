import { Router } from 'express';
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  flagIssue,
  getUserIssues,
  getNearbyIssues,
  getIssueStatistics
} from '../controllers/issueController';
import {
  createIssueValidation,
  getIssueByIdValidation,
  updateIssueValidation,
  deleteIssueValidation,
  flagIssueValidation,
  getIssuesValidation,
  getNearbyIssuesValidation
} from '../middleware/validation';
import { authenticate, authorizeAdmin } from '../utils/auth';
import upload from '../utils/upload';

const router = Router();

// Public routes
router.get('/', getIssuesValidation, getIssues);
router.get('/nearby', getNearbyIssuesValidation, getNearbyIssues);

// Protected routes (specific routes before dynamic :id)
router.get('/user/me', authenticate, getUserIssues);
router.post('/', authenticate, upload.array('photos'), createIssueValidation, createIssue);
router.post('/:id/flag', authenticate, flagIssueValidation, flagIssue);
router.put('/:id', authenticate, upload.array('photos'), updateIssueValidation, updateIssue);
router.delete('/:id', authenticate, deleteIssueValidation, deleteIssue);

// Public dynamic route placed after specific ones
router.get('/:id', getIssueByIdValidation, getIssueById);

// Admin routes
router.get('/admin/statistics', authenticate, authorizeAdmin, getIssueStatistics);

export default router;