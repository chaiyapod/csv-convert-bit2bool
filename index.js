const fs = require("fs");
const csv = require("csv-parser");

// Input and output file paths
const inputFilePath = "../dispense_unit_202401231632.csv";
const outputFilePath = "../temp/dispense_unit.csv";

const rows = [];

const target = "active";

fs.createReadStream(inputFilePath)
  .pipe(csv({ delimiter: "," }))
  .on("data", (row) => {
    row[target] = row[target] == "1" ? "true" : "false";

    rows.push(row);
  })
  .on("end", () => {
    // Write the data to a new CSV file
    const writeStream = fs.createWriteStream(outputFilePath);

    // Write the header to the new CSV file
    const header = Object.keys(rows[0]);
    writeStream.write(header.join("|") + "\n");

    // Write the rows to the new CSV file
    rows.forEach((row) => {
      const values = header.map((column) => row[column]);
      writeStream.write(values.join("|") + "\n");
    });

    console.log("CSV file processing completed.");
  });
