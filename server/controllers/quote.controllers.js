const fs = require("fs");
const path = require("path");

// Models
const { billing_contact } = require("../models/billing_contact.model");
const { technical_contact } = require("../models/technical_contact.model");
const { quote } = require("../models/quote.model");
const { quote_order_item } = require("../models/quote_order_item.model");
const { quote_discount } = require("../models/quote_discount.model");

// // Utils
const { catchAsync } = require("../utils/catchAsync.util");

const getTechnicalContactQuotes = catchAsync(async (req, res, next) => {
  const { technicalContact } = req;

  const quotes = await quote.findAll({
    where: {
      technical_contact_id: technicalContact.id,
    },
    include: [{ model: billing_contact }, { model: quote_order_item }],
  });

  //Send response to endpoint
  res.status(200).json({
    status: "success",
    data: quotes,
  });
});

const getQuotebyId = catchAsync(async (req, res, next) => {
  const { dbQuote } = req;

  //Send response to endpoint
  res.status(200).json({
    status: "success",
    data: dbQuote,
  });
});

const createQuotes = catchAsync(async (req, res, next) => {
  // Create a function to proccess the json files
  const writeJsonToDb = async (invoiceJson) => {
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
        last_nam: lastName,
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
    let billingContact = getContact(invoiceJson, "billing");

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

    if (!dbBillingContact) {
      billingContact = dbBillingContact;
    } else {
      billingContact = await billing_contact.create(billingContact);
      newData.push("Billing Contact");
    }

    // check if technical contact entry is already on db
    let technicalContact = getContact(invoiceJson, "technical");

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

    // Write Quote(AT level information) to db
    const newQuote = {
      order_number: invoiceJson.orderNumber,
      po_number: invoiceJson.poNumber,
      created_date: invoiceJson.createdDate,
      due_date: invoiceJson.dueDate,
      currency: invoiceJson.currency,
      partner_name: invoiceJson.partnerName,
      total_ex_tax: invoiceJson.totalExTax,
      total_inc_tax: invoiceJson.totalIncTax,
      total_tax: invoiceJson.totalTax,
    };

    const dbQuote = await quote.findOne({
      where: {
        order_number: newQuote.order_number,
        po_number: newQuote.po_number,
        created_date: newQuote.created_date,
        due_date: newQuote.due_date,
        currency: newQuote.currency,
        partner_name: newQuote.partner_name,
        total_ex_tax: newQuote.total_ex_tax,
        total_inc_tax: newQuote.total_inc_tax,
        total_tax: newQuote.total_tax,
      },
    });

    if (dbQuote) {
      newQuote = dbQuote;
    } else {
      newQuote = await quote.create({
        order_number: newQuote.order_number,
        po_number: newQuote.po_number,
        created_date: newQuote.created_date,
        due_date: newQuote.due_date,
        currency: newQuote.currency,
        partner_name: newQuote.partner_name,
        total_ex_tax: newQuote.total_ex_tax,
        total_inc_tax: newQuote.total_inc_tax,
        total_tax: newQuote.total_tax,
      });
      newQuote.setBilling_contact(billingContact);
      newQuote.setTechnical_contact(technicalContact);
      newData.push("Quote");
    }
    // Write each product(products/SEN) of the Order to db
    let numberOfNewItems = 0;
    for (const item of invoiceJson.orderItems) {
      let itemProduct = await quote_order_item.findOne({
        where: {
          product_name: item.productName,
          start_date: item.startDate,
          end_date: item.endDate,
          support_entitlement_number: item.supportEntitlementNumber,
        },
      });

      if (!itemProduct) {
        itemProduct = await quote_order_item.create({
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
        itemProduct.setQuote(newQuote);

        for (const disscount of item.discounts) {
          const { amount, percentage, reason, type } = disscount;
          const itemDiscount = await quote_discount.create({
            amount,
            percentage,
            reason,
            type,
          });
          itemDiscount.setQuote_order_item(itemProduct);
        }

        numberOfNewItems += 5;
      }
    }
    if (numberOfNewItems != 0)
      newData.push(`${numberOfNewItems} order Item(s)`);
    if (newData.length != 0)
      console.log(`QUOTE: For ${newQuote.order_number} ${newData} added to db`);
  };

  // Look for all json files in quotes directory
  const jsonsInDir = fs
    .readdirSync("./quotes")
    .filter((file) => path.extname(file) === ".txt");

  for (const file of jsonsInDir) {
    const fileData = await fs.readFileSync(path.join("./quotes", file));
    const json = JSON.parse(fileData);
    await writeJsonToDb(json);
  }

  //Send response to endpoint
  res.status(200).json({
    status: "success",
    data: jsonsInDir,
    message: "Jsons were succesfuly read, check logs for more info",
  });
});

module.exports = {
  getQuotebyId,
  getTechnicalContactQuotes,
  createQuotes,
};
