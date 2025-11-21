'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const allConfigs = require(__dirname + '/../config/config.js');
const config = allConfigs[env] || allConfigs["development"];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// User -> Ticket
db.User.hasMany(db.Ticket, { foreignKey: 'user_id', as: 'tickets' });
db.Ticket.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// Event -> Ticket
db.Event.hasMany(db.Ticket, { foreignKey: 'event_id', as: 'tickets' });
db.Ticket.belongsTo(db.Event, { foreignKey: 'event_id', as: 'event' });

// Event -> Seat
db.Event.hasMany(db.Seat, { foreignKey: 'event_id', as: 'seats' });
db.Seat.belongsTo(db.Event, { foreignKey: 'event_id', as: 'event' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;


module.exports = db;
