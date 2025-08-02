import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Issue, User, Location, StatusLog, Flag } from '../models';
import { Op } from 'sequelize';
import { successResponse, errorResponse, badRequestResponse, notFoundResponse } from '../utils/response';
import { calculateBoundingBox, calculateDistance } from '../utils/geospatial';
import { IssueStatus, IssueCategory } from '../types/enums';
import sequelize from '../config/database';

// Create a new issue
export const createIssue = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return badRequestResponse(res, 'Validation error', errors.array().map(err => err.msg));
    }

    const user = (req as any).user;
    const { title, description, category, latitude, longitude, address } = req.body;
    
    // Create location first
    const location = await Location.create({
      latitude,
      longitude,
      address
    });

    // Create issue with the location
    const issue = await Issue.create({
      title,
      description,
      category: category || IssueCategory.OTHER,
      status: IssueStatus.REPORTED,
      userId: user.id,
      locationId: location.id,
      images: req.files ? (req.files as Express.Multer.File[]).map(file => file.filename) : []
    });

    // Create initial status log
    await StatusLog.create({
      issueId: issue.id,
      userId: user.id,
      oldStatus: null,
      newStatus: IssueStatus.REPORTED,
      comment: 'Issue reported'
    });

    // Fetch the created issue with associations
    const createdIssue = await Issue.findByPk(issue.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'name'] },
        { model: Location, as: 'location' }
      ]
    });

    return successResponse(res, createdIssue, 'Issue created successfully', 201);
  } catch (error) {
    console.error('Create issue error:', error);
    return errorResponse(res, 'Error creating issue');
  }
};

// Get all issues with pagination and filtering
export const getIssues = async (req: Request, res: Response): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // Build filter conditions
    const whereConditions: any = {};
    
    // Filter by status if provided
    if (req.query.status) {
      whereConditions.status = req.query.status;
    }
    
    // Filter by category if provided
    if (req.query.category) {
      whereConditions.category = req.query.category;
    }
    
    // Filter by user if provided
    if (req.query.userId) {
      whereConditions.userId = req.query.userId;
    }
    
    // Search by title or description
    if (req.query.search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    
    // Get issues with pagination
    const { count, rows: issues } = await Issue.findAndCountAll({
      where: whereConditions,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'name'] },
        { model: Location, as: 'location' }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return successResponse(res, {
      issues,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    }, 'Issues retrieved successfully');
  } catch (error) {
    console.error('Get issues error:', error);
    return errorResponse(res, 'Error retrieving issues');
  }
};

// Get issues near a location
export const getNearbyIssues = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { latitude, longitude, radius = 5 } = req.query; // radius in km, default 5km
    
    if (!latitude || !longitude) {
      return badRequestResponse(res, 'Latitude and longitude are required');
    }
    
    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const radiusKm = parseFloat(radius as string);
    
    // Calculate bounding box for initial filtering
    const [minLat, minLng, maxLat, maxLng] = calculateBoundingBox(lat, lng, radiusKm);
    
    // Find locations within the bounding box
    const locations = await Location.findAll({
      where: {
        latitude: { [Op.between]: [minLat, maxLat] },
        longitude: { [Op.between]: [minLng, maxLng] }
      }
    });
    
    // Filter locations by actual distance using Haversine formula
    const locationIdsInRadius = locations
      .filter(location => {
        const distance = calculateDistance(
          lat, 
          lng, 
          location.latitude, 
          location.longitude
        );
        return distance <= radiusKm;
      })
      .map(location => location.id);
    
    // Get issues for these locations
    const issues = await Issue.findAll({
      where: {
        locationId: { [Op.in]: locationIdsInRadius }
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'name'] },
        { model: Location, as: 'location' }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return successResponse(res, issues, 'Nearby issues retrieved successfully');
  } catch (error) {
    console.error('Get nearby issues error:', error);
    return errorResponse(res, 'Error retrieving nearby issues');
  }
};

// Get a single issue by ID
export const getIssueById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const issue = await Issue.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'name'] },
        { model: Location, as: 'location' },
        { 
          model: StatusLog, 
          as: 'statusLogs',
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'name'] }],
          order: [['createdAt', 'DESC']]
        },
        {
          model: Flag,
          as: 'flags',
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'name'] }]
        }
      ]
    });
    
    if (!issue) {
      return notFoundResponse(res, 'Issue not found');
    }
    
    return successResponse(res, issue, 'Issue retrieved successfully');
  } catch (error) {
    console.error('Get issue by ID error:', error);
    return errorResponse(res, 'Error retrieving issue');
  }
};

// Update an issue
export const updateIssue = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return badRequestResponse(res, 'Validation error', errors.array().map(err => err.msg));
    }
    
    const { id } = req.params;
    const user = (req as any).user;
    const { title, description, category, status, latitude, longitude, address } = req.body;
    
    // Start a transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Find the issue
      const issue = await Issue.findByPk(id, { transaction });
      
      if (!issue) {
        await transaction.rollback();
        return notFoundResponse(res, 'Issue not found');
      }
      
      // Check if user is authorized to update this issue
      // Only the issue creator or an admin can update it
      if (issue.userId !== user.id && user.role !== 'admin') {
        await transaction.rollback();
        return badRequestResponse(res, 'You are not authorized to update this issue');
      }
      
      // If status is being updated, create a status log
      if (status && status !== issue.status) {
        await StatusLog.create({
          issueId: issue.id,
          userId: user.id,
          oldStatus: issue.status,
          newStatus: status,
          comment: req.body.statusComment || `Status updated from ${issue.status} to ${status}`
        }, { transaction });
      }
      
      // Update location if provided
      if (latitude && longitude) {
        const location = await Location.findByPk(issue.locationId, { transaction });
        
        if (location) {
          await location.update({
            latitude: latitude || location.latitude,
            longitude: longitude || location.longitude,
            address: address || location.address
          }, { transaction });
        }
      }
      
      // Update issue
      await issue.update({
        title: title || issue.title,
        description: description || issue.description,
        category: category || issue.category,
        status: status || issue.status,
        // If new images are uploaded, append them to existing ones
        images: req.files ? 
          [...issue.images, ...(req.files as Express.Multer.File[]).map(file => file.filename)] : 
          issue.images
      }, { transaction });
      
      // Commit transaction
      await transaction.commit();
      
      // Fetch the updated issue with associations
      const updatedIssue = await Issue.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'name'] },
          { model: Location, as: 'location' },
          { 
            model: StatusLog, 
            as: 'statusLogs',
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'name'] }],
            order: [['createdAt', 'DESC']]
          }
        ]
      });
      
      return successResponse(res, updatedIssue, 'Issue updated successfully');
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Update issue error:', error);
    return errorResponse(res, 'Error updating issue');
  }
};

// Delete an issue
export const deleteIssue = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    
    // Find the issue
    const issue = await Issue.findByPk(id);
    
    if (!issue) {
      return notFoundResponse(res, 'Issue not found');
    }
    
    // Check if user is authorized to delete this issue
    // Only the issue creator or an admin can delete it
    if (issue.userId !== user.id && user.role !== 'admin') {
      return badRequestResponse(res, 'You are not authorized to delete this issue');
    }
    
    // Start a transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Delete related status logs
      await StatusLog.destroy({
        where: { issueId: id },
        transaction
      });
      
      // Delete related flags
      await Flag.destroy({
        where: { issueId: id },
        transaction
      });
      
      // Get location ID before deleting issue
      const locationId = issue.locationId;
      
      // Delete the issue
      await issue.destroy({ transaction });
      
      // Delete the location
      await Location.destroy({
        where: { id: locationId },
        transaction
      });
      
      // Commit transaction
      await transaction.commit();
      
      return successResponse(res, null, 'Issue deleted successfully');
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Delete issue error:', error);
    return errorResponse(res, 'Error deleting issue');
  }
};

// Flag an issue
export const flagIssue = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return badRequestResponse(res, 'Validation error', errors.array().map(err => err.msg));
    }
    
    const { id } = req.params;
    const user = (req as any).user;
    const { reason } = req.body;
    
    // Check if issue exists
    const issue = await Issue.findByPk(id);
    
    if (!issue) {
      return notFoundResponse(res, 'Issue not found');
    }
    
    // Check if user has already flagged this issue
    const existingFlag = await Flag.findOne({
      where: {
        issueId: id,
        userId: user.id
      }
    });
    
    if (existingFlag) {
      return badRequestResponse(res, 'You have already flagged this issue');
    }
    
    // Create flag
    const flag = await Flag.create({
      issueId: id,
      userId: user.id,
      reason
    });
    
    return successResponse(res, flag, 'Issue flagged successfully');
  } catch (error) {
    console.error('Flag issue error:', error);
    return errorResponse(res, 'Error flagging issue');
  }
};

// Get user's issues
export const getUserIssues = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // Get user's issues with pagination
    const { count, rows: issues } = await Issue.findAndCountAll({
      where: { userId: user.id },
      include: [
        { model: Location, as: 'location' }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return successResponse(res, {
      issues,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    }, 'User issues retrieved successfully');
  } catch (error) {
    console.error('Get user issues error:', error);
    return errorResponse(res, 'Error retrieving user issues');
  }
};

// Get issue statistics
export const getIssueStatistics = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Count issues by status
    const statusCounts = await Issue.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    
    // Count issues by category
    const categoryCounts = await Issue.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category']
    });
    
    // Get recent activity (last 10 status changes)
    const recentActivity = await StatusLog.findAll({
      include: [
        { 
          model: Issue, 
          as: 'issue',
          attributes: ['id', 'title']
        },
        { 
          model: User, 
          as: 'user',
          attributes: ['id', 'username', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    // Format the statistics
    const statistics = {
      byStatus: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = parseInt(curr.getDataValue('count') as string);
        return acc;
      }, {} as Record<string, number>),
      byCategory: categoryCounts.reduce((acc, curr) => {
        acc[curr.category] = parseInt(curr.getDataValue('count') as string);
        return acc;
      }, {} as Record<string, number>),
      recentActivity
    };
    
    return successResponse(res, statistics, 'Issue statistics retrieved successfully');
  } catch (error) {
    console.error('Get issue statistics error:', error);
    return errorResponse(res, 'Error retrieving issue statistics');
  }
};