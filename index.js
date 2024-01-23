const fs = require("fs");
const csv = require("csv-parser");
require("dotenv").config();

const inputFilePath = `../master/${process.env.FILE_NAME}.csv`;
const regexPattern = /\.\.\/master\/([a-zA-Z_]+)_\d{12}\.csv/;
const outputFilePath = inputFilePath.replace(regexPattern, "../output/$1.csv");

// config input here:
const interQuote = '"';
const inputSeparator = ",";

// config output here:
const outputDelimiter = ";";
const outputQuoteChar = "—";

const rows = [];

const targets = [
  "is_active",
  "active",
  "alert",
  "active_search",
  "enable_privilege",
];

fs.createReadStream(inputFilePath)
  .pipe(csv({ quote: interQuote, separator: inputSeparator }))
  .on("data", (row) => {
    targets.forEach((s) => {
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
