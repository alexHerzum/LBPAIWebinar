const { db, DataTypes } = require("../utils/database.util");

const quote = db.define("quote", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  order_number: {
    type: DataTypes.STRING,
  },
  po_number: {
    type: DataTypes.STRING,
  },
  created_date: {
    type: DataTypes.STRING,
  },
  due_date: {
    type: DataTypes.STRING,
  },
  currency: {
    type: DataTypes.STRING,
  },
  partner_name: {
    type: DataTypes.STRING,
  },
  total_ex_tax: {
    type: DataTypes.DECIMAL,
  },
  total_inc_tax: {
    type: DataTypes.DECIMAL,
  },
  total_tax: {
    type: DataTypes.DECIMAL,
  },
});

module.exports = { quote };
