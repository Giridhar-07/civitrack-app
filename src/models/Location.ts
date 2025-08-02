import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

// Location attributes interface
interface LocationAttributes {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Location creation attributes interface (optional fields during creation)
interface LocationCreationAttributes extends Optional<LocationAttributes, 'id' | 'address' | 'createdAt' | 'updatedAt'> {}

// Location model class
class Location extends Model<LocationAttributes, LocationCreationAttributes> implements LocationAttributes {
  public id!: string;
  public latitude!: number;
  public longitude!: number;
  public address?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// Initialize Location model
Location.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: -90,
        max: 90,
      },
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: -180,
        max: 180,
      },
    },
    address: {
      type: DataTypes.STRING,
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
    modelName: 'Location',
    tableName: 'locations',
    timestamps: true,
    indexes: [
      // Add spatial index for faster geospatial queries
      {
        fields: ['latitude', 'longitude'],
      },
    ],
  }
);

export default Location;