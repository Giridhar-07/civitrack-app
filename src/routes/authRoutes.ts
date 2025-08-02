import { Router } from 'express';
import { register, login, getCurrentUser, updateProfile, changePassword } from '../controllers/authController';
import { registerValidation, loginValidation, updateProfileValidation, changePasswordValidation } from '../middleware/validation';
import { authenticate } from '../utils/auth';

const router = Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfileValidation, updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, changePassword);

export default router;