const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

// Models
const { billing_contact } = require("../models/billing_contact.model");
const { technical_contact } = require("../models/technical_contact.model");
const { order } = require("../models/order.model");
const { order_order_item } = require("../models/order_order_item.model");
const { order_discount } = require("../models/order_discount.model");
const { revenue } = require("../models/Revenue.model");

// // Utils
const { catchAsync } = require("../utils/catchAsync.util");
const { parseStream } = require("../utils/parseStream.util");

const matchNAOrders = async (item, itemProduct, orderJson, logs) => {
  let log;

  const matchingRevenue = await revenue.findAll({
    where: {
      sen_hen: item.supportEntitlementNumber.replace(/\D+/g, ""),
    },
  });

  if (matchingRevenue.length !== 0) {
    for (const revenueEntry of matchingRevenue) {
      let thirtyDaysAfterOrder = new Date(orderJson.createdDate);
      thirtyDaysAfterOrder.setDate(
        new Date(orderJson.createdDate).getDate() + 30
      );
      let sixtyDaysBeforeOrder = new Date(orderJson.createdDate);
      sixtyDaysBeforeOrder.setDate(
        new Date(orderJson.createdDate).getDate() - 60
      );
      if (
        revenueEntry.date <= thirtyDaysAfterOrder &&
        revenueEntry.date >= sixtyDaysBeforeOrder
      ) {
        let matchedRevenue = await revenueEntry.getOrder_order_items();
        if (matchedRevenue.length === 0) {
          await itemProduct.setRevenue(revenueEntry);
          await revenueEntry.addOrder_order_item(itemProduct);
          log = `SUCCES: REVENUE ITEM ID: ${revenueEntry.id} MATCHED FOR: ${item.supportEntitlementNumber}  ${item.productName} `;
        } else {
          await itemProduct.setRevenue(revenueEntry);
          await revenueEntry.addOrder_order_item(itemProduct);
          log = `WARNING: REVENUE ITEM ID: ${revenueEntry.id} IS ALREADY MATCHED WITH ${matchedRevenue.length} Order Item/s  FOR: ${item.supportEntitlementNumber}  ${item.productName} PLEASE VERIFY THE MATCH`;
        }
      } else {
        log = `ERROR: NO MATCHING DATE FOR: ${item.supportEntitlementNumber}  ${item.productName} (MATCHED ON SEN) `;
      }
    }
  } else {
    log = `ERROR: NO MATCHING SEN FOR: ${item.supportEntitlementNumber}  ${item.productName} `;
  }
  logs.push(log);
  console.log(log);
};

//Controllers

const createOrders = catchAsync(async (req, res, next) => {
  logs = [];
  // Create a function to proccess the json files
  const writeJsonToDb = async (orderJson) => {
    let newData = [];
    // Write technical_contact and billing_contact to DB
    const getContact = (json, type) => {
      let { companyName, firstName, lastName, email, phone, taxId } =
        json[`${type}Contact`];
      let { address1, address2, city, postalCode, state, country } =
        json[`${type}Contact`].address;
      return {
        company_name: companyName,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        tax_id: taxId,
        address1,
        address2,
        city,
        postal_code: postalCode,
        state,
        country,
      };
    };

    // check if billing contact entry is already on db
    let billingContact = getContact(orderJson, "billing");

    const dbBillingContact = await billing_contact.findOne({
      where: {
        company_name: billingContact.company_name,
        first_name: billingContact.first_name,
        last_name: billingContact.last_name,
        email: billingContact.email,
        phone: billingContact.phone,
        tax_id: billingContact.tax_id,
        address1: billingContact.address1,
        address2: billingContact.address2,
        city: billingContact.city,
        postal_code: billingContact.postal_code,
        state: billingContact.state,
        country: billingContact.country,
      },
    });

    if (dbBillingContact) {
      billingContact = dbBillingContact;
    } else {
      billingContact = await billing_contact.create(billingContact);
      newData.push("Billing Contact");
    }

    // check if technical contact entry is already on db
    let technicalContact = getContact(orderJson, "technical");

    const dbTechnicalContact = await technical_contact.findOne({
      where: {
        company_name: technicalContact.company_name,
        first_name: technicalContact.first_name,
        last_name: technicalContact.last_name,
        email: technicalContact.email,
        phone: technicalContact.phone,
        tax_id: technicalContact.tax_id,
        address1: technicalContact.address1,
        address2: technicalContact.address2,
        city: technicalContact.city,
        postal_code: technicalContact.postal_code,
        state: technicalContact.state,
        country: technicalContact.country,
      },
    });

    if (dbTechnicalContact) {
      technicalContact = dbTechnicalContact;
    } else {
      technicalContact = await technical_contact.create(technicalContact);
      newData.push("Technical Contact");
    }

    // Write Order (AT level information) to db
    let newOrder = {
      order_number: orderJson.orderNumber,
      po_number: orderJson.poNumber,
      created_date: orderJson.createdDate,
      due_date: orderJson.dueDate,
      currency: orderJson.currency,
      partner_name: orderJson.partnerName,
      total_ex_tax: orderJson.totalExTax,
      total_inc_tax: orderJson.totalIncTax,
      total_tax: orderJson.totalTax,
    };

    const dbOrder = await order.findOne({
      where: {
        order_number: newOrder.order_number,
        po_number: newOrder.po_number,
        created_date: newOrder.created_date,
        due_date: newOrder.due_date,
        currency: newOrder.currency,
        partner_name: newOrder.partner_name,
        total_ex_tax: newOrder.total_ex_tax,
        total_inc_tax: newOrder.total_inc_tax,
        total_tax: newOrder.total_tax,
      },
    });

    if (dbOrder) {
      newOrder = dbOrder;
    } else {
      newOrder = await order.create({
        order_number: newOrder.order_number,
        po_number: newOrder.po_number,
        created_date: newOrder.created_date,
        due_date: newOrder.due_date,
        currency: newOrder.currency,
        partner_name: newOrder.partner_name,
        total_ex_tax: newOrder.total_ex_tax,
        total_inc_tax: newOrder.total_inc_tax,
        total_tax: newOrder.total_tax,
      });
      newOrder.setBilling_contact(billingContact);
      newOrder.setTechnical_contact(technicalContact);
    }

    logs.push(
      `ORDER: For ${newOrder.order_number} ${orderJson.technicalContact.companyName} ${orderJson.createdDate}`
    );
    console.log(
      `ORDER: For ${newOrder.order_number} ${orderJson.technicalContact.companyName} ${orderJson.createdDate}`
    );

    // Write each product(products/SEN) of the Order to db
    let numberOfNewItems = 0;
    for (const item of orderJson.orderItems) {
      let itemProduct = await order_order_item.findOne({
        where: {
          product_name: item.productName,
          start_date: item.startDate,
          end_date: item.endDate,
          support_entitlement_number: item.supportEntitlementNumber,
        },
      });

      if (!itemProduct) {
        itemProduct = await order_order_item.create({
          product_name: item.productName,
          start_date: item.startDate,
          end_date: item.endDate,
          licensed_to: item.licensedTo,
          description: item.description,
          edition: item.edition,
          cloud_site_hostname: item.cloudSiteHostname,
          support_entitlement_number: item.supportEntitlementNumber,
          entitlement_number: item.entitlementNumber,
          cloud_id: item.saleType,
          cloudSite_url: item.cloudSiteUrl,
          sale_type: item.saleType,
          unit_price: item.unitPrice,
          platform: item.platform,
          tax_exempt: item.taxExempt,
          license_type: item.licenseType,
          unit_count: item.unitCount,
          is_trial_period: item.isTrialPeriod,
          is_unlimited_users: item.isUnlimitedUsers,
          maintenance_months: item.maintenanceMonths,
          price_adjustment: item.priceAdjustment,
          upgrade_credit: item.upgradeCredit,
          partner_discount_total: item.partnerDiscountTotal,
          loyalty_discount_total: item.loyaltyDiscountTotal,
          total: item.total,
        });
        itemProduct.setOrder(newOrder);

        await matchNAOrders(item, itemProduct, orderJson, logs);

        for (const disscount of item.discounts) {
          const { amount, percentage, reason, type } = disscount;
          const itemDiscount = await order_discount.create({
            amount,
            percentage,
            reason,
            type,
          });
          itemDiscount.setOrder_order_item(itemProduct);
        }

        numberOfNewItems += 1;
      }
    }
    if (numberOfNewItems != 0)
      newData.push(` ${numberOfNewItems} order Item(s)`);
  };

  // Look for all json files in orders directory
  const jsonsInDir = fs
    .readdirSync("./orders")
    .filter((file) => path.extname(file) === ".json");

  for (const file of jsonsInDir) {
    const fileData = await fs.readFileSync(path.join("./orders", file));
    const json = JSON.parse(fileData);
    await writeJsonToDb(json);
  }
  //Send response to endpoint
  res.status(200).json({
    status: "success",
    data: jsonsInDir,
    logs: logs,
    message: "Jsons were succesfuly read, check logs for more info",
  });
});

const getNotMatchedOrderItems = catchAsync(async (req, res, next) => {
  const notMatchedOrderItems = await order_order_item.findAll({
    where: {
      revenue_id: null,
    },
    include: {
      model: order,
      attributes: [
        "id",
        "order_number",
        "created_date",
        "due_date",
        "technical_contact_id",
      ],
      include: { model: technical_contact, attributes: ["company_name"] },
    },
  });

  res.status(200).json({
    status: "success",
    data: notMatchedOrderItems,
  });
});

const getMatchedOrderItems = catchAsync(async (req, res, next) => {
  const matchedOrderItems = await order_order_item.findAll({
    where: {
      revenue_id: {
        [Op.ne]: null,
      },
    },
    include: [
      { model: revenue },
      {
        model: order,
        attributes: [
          "id",
          "order_number",
          "created_date",
          "due_date",
          "technical_contact_id",
        ],
        include: { model: technical_contact, attributes: ["company_name"] },
      },
    ],
  });

  res.status(200).json({
    status: "success",
    data: matchedOrderItems,
  });
});

const manuallyMatchOrders = catchAsync(async (req, res, next) => {
  let data = await parseStream(req.file.originalname);

  let count = 0;

  for (const entry of data) {
    if (entry.id && entry.revenue_id) {
      dbOrder = await order_order_item.findByPk(entry.id);
      dbRevenue = await revenue.findByPk(entry.revenue_id);

      await dbOrder.setRevenue(dbRevenue);
      await dbRevenue.addOrder_order_item(dbOrder);

      count += 1;
    }
  }

  res.status(200).json({
    status: "success",
    message: `${count} orders were manually matched`,
  });
});
module.exports = {
  createOrders,
  getMatchedOrderItems,
  getNotMatchedOrderItems,
  manuallyMatchOrders,
};
