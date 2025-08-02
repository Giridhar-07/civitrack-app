import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Issue from './Issue';
import { IssueStatus } from '../types/enums';

// StatusLog attributes interface
interface StatusLogAttributes {
  id: string;
  issueId: string;
  userId: string;
  oldStatus: string | null;
  newStatus: string;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

// StatusLog creation attributes interface (optional fields during creation)
interface StatusLogCreationAttributes extends Optional<StatusLogAttributes, 'id' | 'comment' | 'createdAt' | 'updatedAt'> {}

// StatusLog model class
class StatusLog extends Model<StatusLogAttributes, StatusLogCreationAttributes> implements StatusLogAttributes {
  public id!: string;
  public issueId!: string;
  public userId!: string;
  public oldStatus!: string | null;
  public newStatus!: string;
  public comment?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// Initialize StatusLog model
StatusLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    issueId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'issues',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    oldStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [
          [
            IssueStatus.REPORTED,
            IssueStatus.UNDER_REVIEW,
            IssueStatus.IN_PROGRESS,
            IssueStatus.RESOLVED,
            IssueStatus.CLOSED,
            null,
          ],
        ],
      },
    },
    newStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [
          [
            IssueStatus.REPORTED,
            IssueStatus.UNDER_REVIEW,
            IssueStatus.IN_PROGRESS,
            IssueStatus.RESOLVED,
            IssueStatus.CLOSED,
          ],
        ],
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'StatusLog',
    tableName: 'status_logs',
    timestamps: true,
  }
);

// Associations are defined in models/index.ts

export default StatusLog;