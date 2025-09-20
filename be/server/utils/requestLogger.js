const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../logs/region-access.log");

function logRequest(ip, country, region, isBlacklisted) {
  const logEntry = `${new Date().toISOString()} | IP: ${ip} | Country: ${
    country || "Unknown"
  } | Region: ${region || "Unknown"} | Blacklisted: ${isBlacklisted}\n`;
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error("Failed to write log:", err);
    }
  });
}

module.exports = logRequest;
