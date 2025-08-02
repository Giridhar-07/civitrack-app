import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Issue from './Issue';
import { IssueStatus } from '../types/enums';

// StatusLog attributes interface
interface StatusLogAttributes {
  id: string;
  issueId: string;
  status: string;
  changedBy: string;
  changedAt: Date;
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
  public status!: string;
  public changedBy!: string;
  public changedAt!: Date;
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
    status: {
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
    changedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    changedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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

// Define associations
StatusLog.belongsTo(Issue, { foreignKey: 'issueId', as: 'issue' });
StatusLog.belongsTo(User, { foreignKey: 'changedBy', as: 'user' });

export default StatusLog;