const fs = require("fs");
const csv = require("csv-parser");
require("dotenv").config();

const inputFilePath = `../master/${process.env.FILE_NAME}.csv`;
const regexPattern = /\.\.\/master\/([a-zA-Z_]+)_\d{12}\.csv/;
const outputFilePath = inputFilePath.replace(regexPattern, "../output/$1.csv");

/* 
  @Description 
    config input
  @Example
    const inputQuote = '"';
    const inputDelimiter = ",";
*/
const inputQuote = '"';
const inputDelimiter = ",";

/* 
  @Description 
    config output
  @Example
    const outputDelimiter = ':';
    const outputQuoteChar = ",";
*/
const outputDelimiter = ";";
const outputQuoteChar = "—";

/* 
  @Description 
    config boolean column
  @Example 
    const booleanColumns [ "active", "status"];
*/
const booleanColumns = [
  "is_active",
  "active",
  "alert",
  "active_search",
  "enable_privilege",
  "breastfeeding_risk",
  "pregnancy_risk",
  "fractional",
  "dispense_round_up",
  "compound",
  "reimburse_active",
  "require_ned_reason",
  "require_payer_condition",
];

const rows = [];

fs.createReadStream(inputFilePath)
  .pipe(csv({ quote: inputQuote, separator: inputDelimiter }))
  .on("data", (row) => {
    booleanColumns.forEach((s) => {
      if (row[s] !== undefined) {
        row[s] = row[s] == "1" ? "true" : "false";
      }
    });

    Object.keys(row).forEach((s) => {
      row[s] = row[s].replace(/\n/g, " ");
    });

    rows.push(row);
  })
  .on("end", () => {
    // Write the data to a new CSV file
    const writeStream = fs.createWriteStream(outputFilePath);

    // Write the header to the new CSV file
    const header = Object.keys(rows[0]);
    writeStream.write(
      header
        .map((s) => `${outputQuoteChar}${s}${outputQuoteChar}`)
        .join(outputDelimiter) + "\n"
    );

    // Write the rows to the new CSV file
    rows.forEach((row) => {
      const values = header.map((column) => row[column]);

      writeStream.write(
        values
          .map((s) => `${outputQuoteChar}${s}${outputQuoteChar}`)
          .join(outputDelimiter) + "\n"
      );
    });

    console.log("CSV file processing completed.");
  });
