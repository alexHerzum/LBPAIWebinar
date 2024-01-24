const { db, DataTypes } = require("../utils/database.util");

const quote_order_item = db.define("quote_order_item", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  product_name: {
    type: DataTypes.STRING,
  },
  start_date: {
    type: DataTypes.STRING,
  },
  end_date: {
    type: DataTypes.STRING,
  },
  licensed_to: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  edition: {
    type: DataTypes.STRING,
  },
  cloud_site_hostname: {
    type: DataTypes.STRING,
  },
  support_entitlement_number: {
    type: DataTypes.STRING,
  },
  entitlement_number: {
    type: DataTypes.STRING,
  },
  cloud_id: {
    type: DataTypes.STRING,
  },
  cloudSite_url: {
    type: DataTypes.STRING,
  },
  sale_type: {
    type: DataTypes.STRING,
  },
  unit_price: {
    type: DataTypes.DECIMAL,
  },
  platform: {
    type: DataTypes.STRING,
  },
  tax_exempt: {
    type: DataTypes.BOOLEAN,
  },
  license_type: {
    type: DataTypes.STRING,
  },
  unit_count: {
    type: DataTypes.INTEGER,
  },
  is_trial_period: {
    type: DataTypes.BOOLEAN,
  },
  is_unlimited_users: {
    type: DataTypes.BOOLEAN,
  },
  maintenance_months: {
    type: DataTypes.STRING,
  },
  price_adjustment: {
    type: DataTypes.DECIMAL,
  },
  upgrade_credit: {
    type: DataTypes.DECIMAL,
  },
  partner_discount_total: {
    type: DataTypes.DECIMAL,
  },
  loyalty_discount_total: {
    type: DataTypes.DECIMAL,
  },
  total: {
    type: DataTypes.DECIMAL,
  },
});

module.exports = { quote_order_item };
