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
import { uploadImages } from '../utils/upload';

const router = Router();

// Public routes
router.get('/', getIssuesValidation, getIssues);
router.get('/nearby', getNearbyIssuesValidation, getNearbyIssues);
router.get('/:id', getIssueByIdValidation, getIssueById);

// Protected routes
router.post('/', authenticate, uploadImages, createIssueValidation, createIssue);
router.put('/:id', authenticate, uploadImages, updateIssueValidation, updateIssue);
router.delete('/:id', authenticate, deleteIssueValidation, deleteIssue);
router.post('/:id/flag', authenticate, flagIssueValidation, flagIssue);
router.get('/user/me', authenticate, getUserIssues);

// Admin routes
router.get('/admin/statistics', authenticate, authorizeAdmin, getIssueStatistics);

export default router;