const { db, DataTypes } = require("../utils/database.util");

const quote_discount = db.define("quote_discount", {
  id: {
    type: DataTypes.TEXT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL,
  },
  percentage: {
    type: DataTypes.DECIMAL,
  },
  reason: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.STRING,
  },
});

module.exports = { quote_discount };
