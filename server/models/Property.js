const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Property = sequelize.define('Property', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    address_line1: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'address_line1'
    },
    address_line2: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'address_line2'
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    zip_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'zip_code'
    },
    country: {
      type: DataTypes.STRING(50),
      defaultValue: 'US'
    },
    property_manager_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'property_manager_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    total_units: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_units'
    },
    property_type: {
      type: DataTypes.ENUM('apartment', 'house', 'condo', 'townhouse'),
      allowNull: true,
      field: 'property_type'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'properties',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['property_manager_id'] },
      { fields: ['city', 'state'] },
      { fields: ['property_type'] }
    ]
  });

  // Instance method to get full address
  Property.prototype.getFullAddress = function() {
    const parts = [
      this.address_line1,
      this.address_line2,
      this.city,
      `${this.state} ${this.zip_code}`,
      this.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  return Property;
};
