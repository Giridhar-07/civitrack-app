import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Issue from './Issue';

// Flag attributes interface
interface FlagAttributes {
  id: string;
  issueId: string;
  userId: string;
  reason: string;
  resolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Flag creation attributes interface (optional fields during creation)
interface FlagCreationAttributes extends Optional<FlagAttributes, 'id' | 'resolved' | 'resolvedAt' | 'createdAt' | 'updatedAt'> {}

// Flag model class
class Flag extends Model<FlagAttributes, FlagCreationAttributes> implements FlagAttributes {
  public id!: string;
  public issueId!: string;
  public userId!: string;
  public reason!: string;
  public resolved!: boolean;
  public resolvedAt?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// Initialize Flag model
Flag.init(
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
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    flaggedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    flaggedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    resolved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    resolvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    resolvedAt: {
      type: DataTypes.DATE,
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
    modelName: 'Flag',
    tableName: 'flags',
    timestamps: true,
  }
);

// Define associations
Flag.belongsTo(Issue, { foreignKey: 'issueId', as: 'issue' });
Flag.belongsTo(User, { foreignKey: 'flaggedBy', as: 'flagger' });
Flag.belongsTo(User, { foreignKey: 'resolvedBy', as: 'resolver' });

export default Flag;