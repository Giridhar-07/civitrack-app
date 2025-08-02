import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Location from './Location';
import { IssueStatus, IssueCategory } from '../types/enums';

// Issue attributes interface
interface IssueAttributes {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  photos: string[];
  reportedBy: string;
  locationId: string;
  reportedAt: Date;
  updatedAt: Date;
}

// Issue creation attributes interface (optional fields during creation)
interface IssueCreationAttributes extends Optional<IssueAttributes, 'id' | 'status' | 'photos' | 'reportedAt' | 'updatedAt'> {}

// Issue model class
class Issue extends Model<IssueAttributes, IssueCreationAttributes> implements IssueAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public category!: string;
  public status!: string;
  public photos!: string[];
  public reportedBy!: string;
  public locationId!: string;
  public reportedAt!: Date;
  public updatedAt!: Date;
}

// Initialize Issue model
Issue.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [
          [
            IssueCategory.ROAD,
            IssueCategory.WATER,
            IssueCategory.ELECTRICITY,
            IssueCategory.WASTE,
            IssueCategory.SAFETY,
            IssueCategory.OTHER,
          ],
        ],
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: IssueStatus.REPORTED,
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
    photos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    reportedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    locationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'locations',
        key: 'id',
      },
    },
    reportedAt: {
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
    modelName: 'Issue',
    tableName: 'issues',
    timestamps: true,
    createdAt: 'reportedAt',
  }
);

// Define associations
Issue.belongsTo(User, { foreignKey: 'reportedBy', as: 'reporter' });
Issue.belongsTo(Location, { foreignKey: 'locationId', as: 'location' });

export default Issue;