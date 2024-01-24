const { db, DataTypes } = require("../utils/database.util");

const discount = db.define("discount", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  atlassian_discount: {
    type: DataTypes.DECIMAL(5, 2),
  },
  herzum_discount: {
    type: DataTypes.DECIMAL(5, 2),
  },
});

module.exports = { discount };
