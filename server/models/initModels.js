// Models
const { billing_contact } = require("./billing_contact.model");
const { technical_contact } = require("./technical_contact.model");
const { order } = require("./order.model");
const { order_order_item } = require("./order_order_item.model");
const { order_discount } = require("./order_discount.model");
const { quote } = require("../models/quote.model");
const { quote_order_item } = require("../models/quote_order_item.model");
const { quote_discount } = require("../models/quote_discount.model");
const { discount } = require("../models/discount.model");
const { revenue } = require("../models/Revenue.model");

const initModels = () => {
  //Initialize Order Models Relation
  order.hasMany(order_order_item, { foreignKey: "order_id" });
  order_order_item.belongsTo(order, { foreignKey: "order_id" });

  order_order_item.hasMany(order_discount, {
    foreignKey: "order_order_item_id",
  });
  order_discount.belongsTo(order_order_item, {
    foreignKey: "order_order_item_id",
  });

  billing_contact.hasMany(order, { foreignKey: "billing_contact_id" });
  order.belongsTo(billing_contact, { foreignKey: "billing_contact_id" });

  technical_contact.hasMany(order, { foreignKey: "technical_contact_id" });
  order.belongsTo(technical_contact, { foreignKey: "technical_contact_id" });

  //Initialize  Revenue Order Models Relation
  revenue.hasMany(order_order_item, { foreignKey: "revenue_id" });
  order_order_item.belongsTo(revenue, { foreignKey: "revenue_id" });

  //Initialize Quote Models Relations
  quote.hasMany(quote_order_item, { foreignKey: "quote_id" });
  quote_order_item.belongsTo(quote, { foreignKey: "quote_id" });

  quote_order_item.hasMany(quote_discount, {
    foreignKey: "quote_order_item_id",
  });
  quote_discount.belongsTo(quote_order_item, {
    foreignKey: "quote_order_item_id",
  });

  billing_contact.hasMany(quote, { foreignKey: "billing_contact_id" });
  quote.belongsTo(billing_contact, { foreignKey: "billing_contact_id" });

  technical_contact.hasMany(quote, { foreignKey: "technical_contact_id" });
  quote.belongsTo(technical_contact, { foreignKey: "technical_contact_id" });
};

const initDiscount = async () => {
  //Initalize Discount table
  await discount.sync({ force: true });

  discount.bulkCreate([
    { atlassian_discount: 0.0, herzum_discount: 0.0 },
    { atlassian_discount: 5.0, herzum_discount: 1.5 },
    { atlassian_discount: 10.0, herzum_discount: 3.0 },
    { atlassian_discount: 15.0, herzum_discount: 4.0 },
    { atlassian_discount: 20.0, herzum_discount: 7.0 },
    { atlassian_discount: 35.0, herzum_discount: 7.0 },
  ]);
};

module.exports = { initModels, initDiscount };
