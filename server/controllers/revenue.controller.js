const papa = require("papaparse");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const winston = require("winston");

// Models
const { revenue } = require("../models/Revenue.model");
const { order_order_item } = require("../models/order_order_item.model");
const { order } = require("../models/order.model");

// // Utils
const { catchAsync } = require("../utils/catchAsync.util");
const { parseStream } = require("../utils/parseStream.util");
const e = require("express");

const logFile = path.join("./logs/logfile.log");
const senErrorlog = path.join("./logs/senError.log");
const atErrorlog = path.join("./logs/atError.log");

try {
  fs.unlinkSync(logFile);
  fs.unlinkSync(senErrorlog);
  fs.unlinkSync(atErrorlog);
} catch (ex) {}

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: logFile }),
  ],
});

const senErrorlogger = winston.createLogger({
  transports: [new winston.transports.File({ filename: senErrorlog })],
});

const atErrorlogger = winston.createLogger({
  transports: [new winston.transports.File({ filename: atErrorlog })],
});

const extractsSen = (str) => {
  if (str == null) return null;
  const startIndex = str.search(/(SEN-|HEN-)/);
  if (startIndex !== -1) {
    const endIndex = str.indexOf(" ", startIndex);
    const extractedSection =
      endIndex !== -1
        ? str.substring(startIndex, endIndex)
        : str.substring(startIndex);
    return extractedSection.replace(/\D+/g, "");
  }
  return null; // Return null if no matching section is found
};

function extractDates(inputString) {
  const regex =
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2},\s\d{4}/g;
  const matches = inputString.match(regex);

  if (!matches || matches.length < 2) {
    return null;
  }

  const startDate = matches[0];
  return startDate;
}

function extractATNumbers(inputString) {
  if (!inputString || typeof inputString !== "string") {
    return null;
  }

  const pattern = /AT-\d+/g;
  const matches = inputString.match(pattern);

  if (!matches) {
    return null;
  }

  return matches;
}

function calculateWordOverlapPercentage(revenueMemo, OrderItemDescription) {
  // Split the revenueMemo string into an array of words before the newline character
  const revenueMemoWords = revenueMemo.split("\n")[0].split(" ");
  const OrderItemDescriptionWords = OrderItemDescription.split(" ");

  // Calculate the percentage of words in OrderItemDescription included in revenueMemo
  const overlapCount1 = OrderItemDescriptionWords.filter((word) =>
    revenueMemoWords.includes(word)
  ).length;
  const percentage1 = (overlapCount1 / OrderItemDescriptionWords.length) * 100;

  // Calculate the percentage of words in revenueMemo included in OrderItemDescription
  const overlapCount2 = revenueMemoWords.filter((word) =>
    OrderItemDescriptionWords.includes(word)
  ).length;
  const percentage2 = (overlapCount2 / revenueMemoWords.length) * 100;

  // Check if both percentages are more than 75%
  return percentage1 > 75 && percentage2 > 75;
}

const matchRevenueEntriesByAT = async (entry) => {
  let atNumbers = extractATNumbers(entry.at_number);

  if (atNumbers) {
    let orders = await order.findAll({
      where: {
        order_number: {
          [Op.in]: atNumbers,
        },
      },
      include: { model: order_order_item },
    });
    if (orders.length !== 0) {
      let internalLog = null;
      for (const order of orders) {
        for (const item of order.order_order_items) {
          if (calculateWordOverlapPercentage(entry.memo, item.description)) {
            let credit =
              entry.currency === "EURO" ? entry.credit * 1.06 : entry.credit;
            let percentageDiference = ((credit - item.total) / credit) * 100;
            if (percentageDiference > 0 && percentageDiference < 20) {
              let matchedOrderItem = await order_order_item.findByPk(item.id);
              let matchedRevenue = await matchedOrderItem.getRevenue();
              if (!matchedRevenue) {
                await matchedOrderItem.setRevenue(entry);
                await entry.addOrder_order_item(matchedOrderItem);
                internalLog = {
                  code: "SB1",
                  message: `SUCCES SB1: REVENUE ITEM ID: ${entry.id} MATCHED FOR: ORDER ITEM ${item.id} ${item.support_entitlement_number}  ${item.product_name}  `,
                };
                break;
              } else {
                internalLog = {
                  code: "EB4",
                  message: `ERROR EB4: REVENUE ITEM ID: ${entry.id}  MATCHED WITH ITEM ID: ${item.id} BUT ITEM ID: ${item.id} IS ALREADY MATCHED WITH REVENUE ENTRY ${item.revenue_id} PLEASE VERIFY THE MATCH`,
                };
                break;
              }
            } else {
              internalLog = {
                code: "EB3",
                message: `ERROR EB3: REVENUE ITEM ID: ${entry.id} DID NOT MATCH ON PRICE % (MATCHED FOR ORDER ITEM ${item.id} on product name)  `,
              };
            }
          }
        }
      }
      if (!internalLog) {
        internalLog = {
          code: "EB2",
          message: `ERROR EB2: NO PRODUCT MATCHING REVENUE ENTRY: ${entry.id} MATCHED ON AT NUMBER WITH ORDER ${orders[0].id}`,
        };
        atErrorlogger.info(
          "************************************************************************************"
        );
        atErrorlogger.info(internalLog.message);
        atErrorlogger.info(entry);
        atErrorlogger.info(orders);
        atErrorlogger.info(
          "************************************************************************************"
        );
      } else if (internalLog?.message.includes("ERROR")) {
        atErrorlogger.info(
          "************************************************************************************"
        );
        atErrorlogger.info(internalLog.message);
        atErrorlogger.info(entry);
        atErrorlogger.info(orders);
        atErrorlogger.info(
          "************************************************************************************"
        );
      }
      return internalLog;
    } else {
      return {
        code: "EB1",
        message: `ERROR EB1: NO MATCHING SEN AND NO MATCHING AT NUMBER FOR: ENTRY ${entry.id}`,
      };
    }
  } else {
    return {
      code: "EC1",
      message: `ERROR EC1: NO MATCHING SEN AND NO AT NUMBER AVIABLE FOR REVENUE ENTRY ${entry.id}`,
    };
  }
};

const matchRevenueEntriesBySEN = async (entry, logs, log) => {
  let orderItems = await order_order_item.findAll({
    where: {
      support_entitlement_number: `SEN-${entry.sen_hen}`,
    },
    include: { model: order },
  });
  if (orderItems.length !== 0) {
    let isMatched = false;
    for (const item of orderItems) {
      let thirtyDaysAfterOrder = new Date(item.order.due_date);
      thirtyDaysAfterOrder.setDate(
        new Date(item.order.due_date).getDate() + 30
      );
      let sixtyDaysBeforeOrder = new Date(item.order.due_date);
      sixtyDaysBeforeOrder.setDate(
        new Date(item.order.due_date).getDate() - 60
      );
      if (
        entry.date <= thirtyDaysAfterOrder &&
        entry.date >= sixtyDaysBeforeOrder &&
        item.unit_count > 0
      ) {
        if (
          entry.origin === "HNA"
            ? true
            : calculateWordOverlapPercentage(entry.memo, item.description)
        ) {
          let matchedRevenue = await item.getRevenue();
          if (!matchedRevenue) {
            await item.setRevenue(entry);
            await entry.addOrder_order_item(item);
            log = {
              message: `SUCCES SA1: REVENUE ITEM ID: ${entry.id} MATCHED FOR: ORDER ITEM ${item.id} ${item.support_entitlement_number}  ${item.product_name} `,
            };
            isMatched = true;
            await entry.update({
              code: "SA1",
              code_description: `SUCCES SA1: REVENUE ITEM ID: ${entry.id} MATCHED FOR: ORDER ITEM ${item.id} ${item.support_entitlement_number}  ${item.product_name} `,
            });
          } else {
            isMatched = true;
            await entry.update({
              code: "EA2",
              code_description: `ERROR EA2: REVENUE ITEM ID: ${entry.id}  MATCHED WITH ITEM ID: ${item.id} BUT ITEM ID: ${item.id} IS ALREADY MATCHED WITH REVENUE ENTRY: ${item.revenue_id} PLEASE VERIFY THE MATCH`,
            });
            log = {
              message: `ERROR EA2: REVENUE ITEM ID: ${entry.id}  MATCHED WITH ITEM ID: ${item.id} BUT ITEM ID: ${item.id} IS ALREADY MATCHED WITH REVENUE ENTRY: ${item.revenue_id} PLEASE VERIFY THE MATCH`,
            };
            senErrorlogger.info(
              "************************************************************************************"
            );
            senErrorlogger.info(
              `ERROR EA2: REVENUE ITEM ID: ${entry.id}  MATCHED WITH ITEM ID: ${item.id} BUT ITEM ID: ${item.id} IS ALREADY MATCHED WITH REVENUE ENTRY: ${item.revenue_id} PLEASE VERIFY THE MATCH`
            );
            senErrorlogger.info(entry);
            senErrorlogger.info(orderItems);
            senErrorlogger.info(
              "************************************************************************************"
            );
          }
        }
      }
    }
    if (!isMatched) {
      let atNumbers = extractATNumbers(entry.at_number);
      if (atNumbers) {
        log = await matchRevenueEntriesByAT(entry);
      } else {
        log = {
          code: "EA1",
          message: `ERROR EA1: NO MATCHING DATE OR PRODUCT NAME AND NO AVAILABLE AT NUMBER FOR: REVENUE ENTRY ${entry.id} (MATCHED ON SEN ${entry.sen_hen} WITH ${orderItems.length} order Items) `,
        };

        senErrorlogger.info(
          "************************************************************************************"
        );
        senErrorlogger.info(
          `ERROR EA1: NO MATCHING DATE OR PRODUCT NAME AND NO AVAILABLE AT NUMBER FOR: REVENUE ENTRY ${entry.id} (MATCHED ON SEN ${entry.sen_hen} WITH ${orderItems.length} order Items) `
        );
        senErrorlogger.info(entry);
        senErrorlogger.info(orderItems);
        senErrorlogger.info(
          "************************************************************************************"
        );
      }
    }
  } else {
    log = await matchRevenueEntriesByAT(entry);
  }
  await entry.update({
    code: log.code,
    code_description: log.message,
  });
  logs.push(log.message);
  logger.log("info", log.message);
};

const createITEntry = async (data, logs, line) => {
  let log;
  for (const entry of data) {
    line += 1;
    if (entry["ITEM_DESCRIPTION"] != null) {
      entry.sen_hen = extractsSen(entry["SEN_NUMBER"]);
      entry.date = extractDates(entry["ITEM_DESCRIPTION"]);
      let dbRevenue = await revenue.findOne({
        where: {
          date: entry.date ? new Date(entry.date) : null,
          num: entry["ACCOUNT"],
          name: entry["CUSTOMER_COMPANYNAME"],
          memo: entry["ITEM_DESCRIPTION"],
          sen_hen: entry.sen_hen,
          credit: entry["EUR_REVENUES"],
        },
      });
      if (dbRevenue) {
        log = `ERROR Line ${line}: ${entry.date} ${entry["ACCOUNT"]}  ${entry["CUSTOMER_COMPANYNAME"]} ${entry["ITEM_CODE"]}  ${entry.sen_hen}  currency: EURO credit: ${entry["EUR_REVENUES"]} was already on db`;
        console.log(log);
        logs.push(log);
      }
      // if (!entry.sen_hen) {
      //   log = `ERROR Line ${line}: ${entry.date} ${entry["ACCOUNT"]}  ${entry["CUSTOMER_COMPANYNAME"]} ${entry["ITEM_CODE"]}   currency: EURO credit: ${entry["EUR_REVENUES"]} Did not have SEN`;
      //   console.log(log);
      //   logs.push(log);
      // }
      if (!dbRevenue) {
        let newEntry = await revenue.create({
          date: entry.date ? new Date(entry.date) : null,
          at_number: entry["AT_NUMBER"],
          num: entry["ACCOUNT"],
          name: entry["CUSTOMER_COMPANYNAME"],
          memo: entry["ITEM_DESCRIPTION"],
          sen_hen: entry.sen_hen,
          credit: entry["EUR_REVENUES"],
          origin: "HIT",
          currency: "EURO",
        });
        log = `SUCCES Line ${line}: ${entry.date} ${entry["ACCOUNT"]}  ${entry["CUSTOMER_COMPANYNAME"]}  ${entry.sen_hen}  currency: EURO credit: ${entry["EUR_REVENUES"]}  was added to revenue table`;
        console.log(log);
        logs.push(log);
        matchRevenueEntriesBySEN(newEntry, logs, log);
      }
    } else {
      log = `ERROR Line ${line} NO DATA TO WRITE `;
      console.log(log);
      logs.push(log);
    }
  }
};

const createNAEntry = async (data, logs, line) => {
  let log;
  for (const entry of data) {
    line += 1;
    if (!entry.Credit && !entry.Memo) {
      log = `ERROR Line ${line} NO DATA TO WRITE `;
      console.log(log);
      logs.push(log);
    } else {
      entry.sen_hen = extractsSen(entry.Memo);
      let dbRevenue = await revenue.findOne({
        where: {
          date: new Date(entry.Date),
          num: entry.Num,
          name: entry.Name,
          memo: entry.Memo,
          sen_hen: entry.sen_hen,
          debit: entry.Debit,
          credit: entry.Credit,
        },
      });
      if (dbRevenue) {
        log = `ERROR Line ${line}: ${entry.Date} ${entry.Num}  ${entry.Name}  SEN-${entry.sen_hen} ${entry.Memo} debit:  ${entry.Debit} credit: ${entry.Credit} was already on db`;
        console.log(log);
        logs.push(log);
      }
      if (!entry.sen_hen) {
        log = `ERROR Line ${line}:${entry.Date} ${entry.Num}  ${entry.Name}  ${entry.Memo} debit:  ${entry.Debit} credit: ${entry.Credit} Did not have SEN`;
        console.log(log);
        logs.push(log);
      }
      if (!dbRevenue && entry.sen_hen) {
        let newEntry = await revenue.create({
          date: new Date(entry.Date),
          num: entry.Num,
          name: entry.Name,
          memo: entry.Memo,
          sen_hen: entry.sen_hen,
          debit: entry.Debit,
          credit: entry.Credit,
          origin: "HNA",
          currency: "USD",
        });
        log = `SUCCES Line ${line}: ${entry.Date} ${entry.Num}  ${entry.Name}  SEN-${entry.sen_hen} ${entry.Memo} debit:  ${entry.Debit} credit: ${entry.Credit}  was added to revenue table`;
        console.log(log);
        logs.push(log);
        matchRevenueEntriesBySEN(newEntry, logs, log);
      }
    }
  }
};

const createRevenueEntry = catchAsync(async (req, res, next) => {
  let data = await parseStream(req.file.originalname);

  let logs = ["Line 1: Headers"];

  let line = 1;

  if (data[0].Credit || data[1].Credit) {
    await createNAEntry(data, logs, line);
  } else if (data[0]["ITEM_DESCRIPTION"] || data[1]["ITEM_DESCRIPTION"]) {
    await createITEntry(data, logs, line);
  }

  //Send response to endpoint
  res.status(200).json({
    status: "success",
    message: "CSV were succesfuly read, check logs for more info",
    logs: logs,
  });
});

const getUnmatchedRevenueItems = catchAsync(async (req, res, next) => {
  const matchedOrderItems = await order_order_item.findAll({
    where: {
      revenue_id: {
        [Op.ne]: null,
      },
    },
  });

  matchedRevenueIds = [];

  matchedOrderItems.map((item) => matchedRevenueIds.push(item.revenue_id));

  const unmatchedRevenueItems = await revenue.findAll({
    where: {
      id: {
        [Op.notIn]: matchedRevenueIds,
      },
    },
  });

  res.status(200).json({
    status: "success",
    data: unmatchedRevenueItems,
  });
});

// const getMatchedRevenueItems = catchAsync(async (req, res, next) => {
//   const matchedOrderItems = await order_order_item.findAll({
//     where: {
//       revenue_id: {
//         [Op.ne]: null,
//       },
//     },
//     include: { model: revenue },
//   });

//   res.status(200).json({
//     status: "success",
//     data: matchedOrderItems,
//   });
// });

module.exports = {
  createRevenueEntry,
  getUnmatchedRevenueItems,
};
