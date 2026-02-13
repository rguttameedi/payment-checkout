const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address'
        }
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    role: {
      type: DataTypes.ENUM('tenant', 'admin', 'property_manager'),
      allowNull: false,
      defaultValue: 'tenant',
      validate: {
        isIn: {
          args: [['tenant', 'admin', 'property_manager']],
          msg: 'Role must be tenant, admin, or property_manager'
        }
      }
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name'
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'date_of_birth'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active',
      validate: {
        isIn: {
          args: [['active', 'inactive', 'suspended']],
          msg: 'Status must be active, inactive, or suspended'
        }
      }
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login'
    }
  }, {
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['email'] },
      { fields: ['role'] },
      { fields: ['status'] }
    ],
    hooks: {
      // Hash password before creating user
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      },
      // Hash password before updating if it changed
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      }
    }
  });

  // Instance method to validate password
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
  };

  // Instance method to get full name
  User.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
  };

  // Instance method to get safe user data (exclude password)
  User.prototype.toSafeJSON = function() {
    const user = this.toJSON();
    delete user.password_hash;
    return user;
  };

  return User;
};
