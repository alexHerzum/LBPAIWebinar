const papa = require("papaparse");
const fs = require("fs");
const path = require("path");

const parseStream = async (filename) => {
  let csvData;
  var csvPath = path.join(__dirname, "..", "revenue", filename);
  const csvFile = fs.readFileSync(csvPath, "utf8");
  papa.parse(csvFile, {
    header: true,
    complete: function (results) {
      csvData = results.data;
    },
  });
  fs.unlinkSync(csvPath);
  return csvData;
};

module.exports = { parseStream };
