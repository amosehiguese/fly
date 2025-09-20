// import fs from "fs";

const fs = require("fs");

// Load your JSON file
const jsonData = JSON.parse(fs.readFileSync("./src/messages/en.json", "utf-8"));

// Function to convert all objects with numeric keys to arrays
function convertObjectsToArrays(obj) {
  if (typeof obj !== "object" || obj === null) return obj;

  // Check if the object has numeric keys (like "0", "1", etc.)
  const hasNumericKeys = Object.keys(obj).every((key) => !isNaN(Number(key)));

  if (hasNumericKeys) {
    return Object.keys(obj).map((key) => convertObjectsToArrays(obj[key]));
  }

  // Recursively process other objects
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      convertObjectsToArrays(value),
    ])
  );
}

const fixedData = convertObjectsToArrays(jsonData);
fs.writeFileSync(
  "en-translations-fixed.json",
  JSON.stringify(fixedData, null, 2)
);
