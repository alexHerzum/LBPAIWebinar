const { db, DataTypes } = require("../utils/database.util");

const revenue = db.define("revenue", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  at_number: {
    type: DataTypes.STRING,
  },
  date: {
    type: DataTypes.DATE,
  },
  num: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.STRING,
  },
  memo: {
    type: DataTypes.TEXT,
  },
  sen_hen: {
    type: DataTypes.STRING,
  },
  currency: {
    type: DataTypes.STRING,
  },
  debit: {
    type: DataTypes.STRING,
  },
  credit: {
    type: DataTypes.STRING,
  },
  origin: {
    type: DataTypes.STRING,
  },
  code: {
    type: DataTypes.STRING,
  },
  code_description: {
    type: DataTypes.STRING,
  },
});

module.exports = { revenue };
