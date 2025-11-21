'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Seat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Seat.init({
    event_id: DataTypes.INTEGER,
    seat_number: DataTypes.STRING,
    is_booked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),   // ✅ Added price
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'Seat',
  });
  return Seat;
};

