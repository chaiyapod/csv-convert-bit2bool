const fs = require("fs");
const csv = require("csv-parser");
require("dotenv").config();

const REGEX = /([a-zA-Z_]+)_\d{12}\.csv$/;

const rawFileName = `${process.env.FILE_NAME}.csv`;
const fileName = rawFileName.replace(REGEX, "$1.csv");

const inputFilePath = `./master/${rawFileName}`;
const outputFilePath = `./output/${fileName}`;

/**
 * This variable defines the character used to quote fields in the input CSV file.
 * @detail If inputQuote is set to `"`, it means that fields are enclosed in double quotes.
 * @example const inputQuote = '"';
 */
const inputQuote = '"';
/**
 * This variable specifies the delimiter used to separate fields in the input CSV file.
 * @detail If inputDelimiter is set to `,`, it means that fields are separated by commas.
 * @example const inputDelimiter = ",";
 */
const inputDelimiter = ",";

/**
 * This variable defines the character used to quote fields in the output CSV file.
 * @detail If outputQuoteChar is set to `"`, it means that fields will be enclosed in double quotes in the output.
 * @example const outputQuoteChar = '"';
 */
const outputQuoteChar = "—";
/**
 * This variable specifies the delimiter to be used in the output CSV file when separating fields.
 * @detail If outputDelimiter is set to `,`, it means that fields will be separated by commas in the output.
 * @example const outputDelimiter = ",";
 */
const outputDelimiter = ";";

/**
 * This array contains a list of column names that are expected to represent boolean values in the input CSV file.
 * @detail  For each column specified in this array, if the corresponding value in a row is "1", it will be converted to the string "true"; otherwise, it will be converted to "false".
 * @example const booleanColumns = ["active","status"];
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
  "require_dosage",
];

/**
 * This variable defines the boolean used to replaces any newline character (\n) in the corresponding value with a space.
 * @detail  If the row object has a property with a value containing newline characters, such as `"123 Main St\nApt 4"`, After process the row object would me modified to `"123 Main St Apt 4"`.
 * @example const sanitizeRowValues = true;
 */
const sanitizeRowValues = false;

const csvRowsData = [];

fs.createReadStream(inputFilePath)
  .pipe(csv({ quote: inputQuote, separator: inputDelimiter }))
  .on("data", (row) => {
    booleanColumns.forEach((column) => {
      if (row[column] !== undefined) {
        row[column] = row[column] == "1" ? "true" : "false";
      }
    });

    if (sanitizeRowValues) {
      Object.keys(row).forEach((key) => {
        row[key] = row[key].replace(/\n/g, " ");
      });
    }

    csvRowsData.push(row);
  })
  .on("end", () => {
    // Write the data to a new CSV file
    const writeStream = fs.createWriteStream(outputFilePath);

    // Write the header to the new CSV file
    const header = Object.keys(csvRowsData[0]);
    writeStream.write(header.map(mapQuoteChar).join(outputDelimiter) + "\n");

    // Write the rows to the new CSV file
    csvRowsData.forEach((row) => {
      const values = header.map((column) => row[column]);

      writeStream.write(values.map(mapQuoteChar).join(outputDelimiter) + "\n");
    });

    console.log("CSV file processing completed.");
  });

const mapQuoteChar = (text) => `${outputQuoteChar}${text}${outputQuoteChar}`;
