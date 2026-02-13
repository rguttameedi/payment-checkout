const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Unit = sequelize.define('Unit', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    property_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'property_id',
      references: {
        model: 'properties',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    unit_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'unit_number'
    },
    bedrooms: {
      type: DataTypes.DECIMAL(3, 1),
      defaultValue: 1
    },
    bathrooms: {
      type: DataTypes.DECIMAL(3, 1),
      defaultValue: 1
    },
    square_feet: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'square_feet'
    },
    floor_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'floor_number'
    },
    status: {
      type: DataTypes.ENUM('vacant', 'occupied', 'maintenance'),
      defaultValue: 'vacant',
      validate: {
        isIn: {
          args: [['vacant', 'occupied', 'maintenance']],
          msg: 'Status must be vacant, occupied, or maintenance'
        }
      }
    },
    monthly_rent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'monthly_rent',
      validate: {
        min: {
          args: [0],
          msg: 'Monthly rent must be positive'
        }
      }
    },
    security_deposit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'security_deposit'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'units',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['property_id'] },
      { fields: ['status'] },
      { fields: ['monthly_rent'] },
      {
        unique: true,
        fields: ['property_id', 'unit_number'],
        name: 'units_property_id_unit_number_key'
      }
    ]
  });

  // Instance method to get unit display name
  Unit.prototype.getDisplayName = function() {
    return `Unit ${this.unit_number}`;
  };

  return Unit;
};
