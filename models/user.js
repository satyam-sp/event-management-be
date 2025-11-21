'use strict';

const { Model } = require('sequelize');
const bcrypt = require('bcryptjs'); // <-- using bcryptjs

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define associations here
    }

    // Compare password for login
    async comparePassword(plainPassword) {
      return await bcrypt.compare(plainPassword, this.password);
    }
  }

  User.init(
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'User',

      hooks: {
        // 🔐 Hash password before INSERT
        async beforeCreate(user) {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },

        // 🔐 Hash password before UPDATE (if changed)
        async beforeUpdate(user) {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        }
      }
    }
  );

  return User;
};
