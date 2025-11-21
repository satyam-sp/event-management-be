'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    static associate(models) {
      // relations can go here later
      // Ticket.belongsTo(models.User, { foreignKey: 'user_id' });
      // Ticket.belongsTo(models.Event, { foreignKey: 'event_id' });
    }
  }

  Ticket.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      event_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      seats: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: false,
      },

      // NEW FIELDS
      base_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      gst: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      total_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Ticket',
    }
  );

  return Ticket;
};
