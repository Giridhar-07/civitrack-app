import { body, param, query } from 'express-validator';
import { IssueStatus, IssueCategory } from '../types/enums';

// User validation
export const registerValidation = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

export const loginValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

export const updateProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),
  
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Issue validation
export const createIssueValidation = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  
  body('category')
    .optional()
    .isIn(Object.values(IssueCategory)).withMessage('Invalid category'),
  
  body('latitude')
    .notEmpty().withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .notEmpty().withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  
  body('address')
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 5, max: 255 }).withMessage('Address must be between 5 and 255 characters')
];

export const updateIssueValidation = [
  param('id')
    .isUUID(4).withMessage('Invalid issue ID'),
  
  body('title')
    .optional()
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  
  body('category')
    .optional()
    .isIn(Object.values(IssueCategory)).withMessage('Invalid category'),
  
  body('status')
    .optional()
    .isIn(Object.values(IssueStatus)).withMessage('Invalid status'),
  
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  
  body('address')
    .optional()
    .isLength({ min: 5, max: 255 }).withMessage('Address must be between 5 and 255 characters'),
  
  body('statusComment')
    .optional()
    .isLength({ max: 500 }).withMessage('Status comment must not exceed 500 characters')
];

export const getIssueByIdValidation = [
  param('id')
    .isUUID(4).withMessage('Invalid issue ID')
];

export const deleteIssueValidation = [
  param('id')
    .isUUID(4).withMessage('Invalid issue ID')
];

export const flagIssueValidation = [
  param('id')
    .isUUID(4).withMessage('Invalid issue ID'),
  
  body('reason')
    .notEmpty().withMessage('Reason is required')
    .isLength({ min: 5, max: 500 }).withMessage('Reason must be between 5 and 500 characters')
];

export const getIssuesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(Object.values(IssueStatus)).withMessage('Invalid status'),
  
  query('category')
    .optional()
    .isIn(Object.values(IssueCategory)).withMessage('Invalid category'),
  
  query('userId')
    .optional()
    .isUUID(4).withMessage('Invalid user ID'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters')
];

export const getNearbyIssuesValidation = [
  query('latitude')
    .notEmpty().withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  
  query('longitude')
    .notEmpty().withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  
  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 100 }).withMessage('Radius must be between 0.1 and 100 kilometers')
];