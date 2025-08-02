import { User, Location, Issue, StatusLog } from '../models';
import { IssueStatus, IssueCategory } from '../types/enums';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Sample data for seeding the database
const seedDatabase = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models with database (force: true will drop tables if they exist)
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');
    
    // Create admin user
    const adminUser = await User.create({
      id: uuidv4(),
      username: 'admin',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'admin',
      isAdmin: true
    });
    
    // Create regular users
    const user1 = await User.create({
      id: uuidv4(),
      username: 'johndoe',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      role: 'user'
    });
    
    const user2 = await User.create({
      id: uuidv4(),
      username: 'janedoe',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password123!',
      role: 'user'
    });
    
    // Create locations
    const location1 = await Location.create({
      id: uuidv4(),
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Broadway, New York, NY 10001'
    });
    
    const location2 = await Location.create({
      id: uuidv4(),
      latitude: 34.0522,
      longitude: -118.2437,
      address: '456 Hollywood Blvd, Los Angeles, CA 90028'
    });
    
    const location3 = await Location.create({
      id: uuidv4(),
      latitude: 41.8781,
      longitude: -87.6298,
      address: '789 Michigan Ave, Chicago, IL 60611'
    });
    
    // Create issues
    const issue1 = await Issue.create({
      id: uuidv4(),
      title: 'Pothole on Broadway',
      description: 'Large pothole causing traffic and potential damage to vehicles.',
      category: IssueCategory.ROAD,
      status: IssueStatus.REPORTED,
      images: [],
      userId: user1.id,
      locationId: location1.id
    });
    
    const issue2 = await Issue.create({
      id: uuidv4(),
      title: 'Broken Street Light',
      description: 'Street light has been out for over a week, creating safety concerns at night.',
      category: IssueCategory.ELECTRICITY,
      status: IssueStatus.UNDER_REVIEW,
      images: [],
      userId: user2.id,
      locationId: location2.id
    });
    
    const issue3 = await Issue.create({
      id: uuidv4(),
      title: 'Overflowing Trash Bin',
      description: 'Public trash bin has not been emptied and is overflowing onto the sidewalk.',
      category: IssueCategory.WASTE,
      status: IssueStatus.IN_PROGRESS,
      images: [],
      userId: user1.id,
      locationId: location3.id
    });
    
    // Create status logs
    await StatusLog.create({
      id: uuidv4(),
      issueId: issue1.id,
      userId: user1.id,
      oldStatus: null,
      newStatus: IssueStatus.REPORTED,
      comment: 'Issue reported'
    });
    
    await StatusLog.create({
      id: uuidv4(),
      issueId: issue2.id,
      userId: user2.id,
      oldStatus: null,
      newStatus: IssueStatus.REPORTED,
      comment: 'Issue reported'
    });
    
    await StatusLog.create({
      id: uuidv4(),
      issueId: issue2.id,
      userId: adminUser.id,
      oldStatus: IssueStatus.REPORTED,
      newStatus: IssueStatus.UNDER_REVIEW,
      comment: 'Issue is being reviewed by the city maintenance department'
    });
    
    await StatusLog.create({
      id: uuidv4(),
      issueId: issue3.id,
      userId: user1.id,
      oldStatus: null,
      newStatus: IssueStatus.REPORTED,
      comment: 'Issue reported'
    });
    
    await StatusLog.create({
      id: uuidv4(),
      issueId: issue3.id,
      userId: adminUser.id,
      oldStatus: IssueStatus.REPORTED,
      newStatus: IssueStatus.UNDER_REVIEW,
      comment: 'Issue is being reviewed by the sanitation department'
    });
    
    await StatusLog.create({
      id: uuidv4(),
      issueId: issue3.id,
      userId: adminUser.id,
      oldStatus: IssueStatus.UNDER_REVIEW,
      newStatus: IssueStatus.IN_PROGRESS,
      comment: 'Sanitation team has been dispatched'
    });
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();