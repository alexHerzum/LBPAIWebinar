const { db, DataTypes } = require("../utils/database.util");

const order_discount = db.define("order_discount", {
  id: {
    type: DataTypes.INTEGER,
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

module.exports = { order_discount };
