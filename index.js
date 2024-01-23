const fs = require("fs");
const csv = require("csv-parser");

// Input and output file paths
const inputFilePath = "../master/medical_supply_202401231755.csv";
const regexPattern = /\.\.\/master\/([a-zA-Z_]+)_\d{12}\.csv/;
const outputFilePath = inputFilePath.replace(regexPattern, "../output/$1.csv");

const delimiter = ",";

const rows = [];

const targets = ["is_active", "active", "alert"];

fs.createReadStream(inputFilePath)
  .pipe(csv({ quote: '"', separator: "," }))
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
    writeStream.write(header.join(delimiter) + "\n");

    // Write the rows to the new CSV file
    rows.forEach((row) => {
      const values = header.map((column) => row[column]);

      writeStream.write(values.map((s) => `"${s}"`).join(delimiter) + "\n");
    });

    console.log("CSV file processing completed.");
  });
