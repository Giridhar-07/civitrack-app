import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models';
import sequelize from '../config/database';
import { Op } from 'sequelize';
import { generateToken } from '../utils/auth';
import { successResponse, errorResponse, badRequestResponse, unauthorizedResponse } from '../utils/response';

// Register a new user
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return badRequestResponse(res, 'Validation error', errors.array().map(err => err.msg));
    }

    const { username, name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return badRequestResponse(res, 'User already exists with this email or username');
    }

    // Create new user
    const user = await User.create({
      username,
      name,
      email,
      password,
      role: 'user',
    });

    // Generate JWT token
    const token = generateToken(user);

    // Return user data (excluding password) and token
    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return successResponse(res, { user: userData, token }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 'Error registering user');
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return badRequestResponse(res, 'Validation error', errors.array().map(err => err.msg));
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return unauthorizedResponse(res, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return unauthorizedResponse(res, 'Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data (excluding password) and token
    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    };

    return successResponse(res, { user: userData, token }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Error during login');
  }
};

// Get current user profile
export const getCurrentUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = (req as any).user;

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    };

    return successResponse(res, userData, 'User profile retrieved successfully');
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, 'Error retrieving user profile');
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return badRequestResponse(res, 'Validation error', errors.array().map(err => err.msg));
    }

    const user = (req as any).user;
    const { name, email, username } = req.body;

    // Check if email or username is already taken (if changing)
    if (email !== user.email || username !== user.username) {
      const existingUser = await User.findOne({
        where: {
          [Op.and]: [
            { id: { [Op.ne]: user.id } },
            {
              [Op.or]: [
                { email: email || '' },
                { username: username || '' }
              ]
            }
          ]
        }
      });

      if (existingUser) {
        return badRequestResponse(res, 'Email or username is already taken');
      }
    }

    // Update user
    await user.update({
      name: name || user.name,
      email: email || user.email,
      username: username || user.username,
    });

    // Return updated user data
    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    };

    return successResponse(res, userData, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Error updating profile');
  }
};

// Change password
export const changePassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return badRequestResponse(res, 'Validation error', errors.array().map(err => err.msg));
    }

    const user = (req as any).user;
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return badRequestResponse(res, 'Current password is incorrect');
    }

    // Update password
    await user.update({ password: newPassword });

    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 'Error changing password');
  }
};