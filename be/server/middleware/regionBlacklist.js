const geoip = require("geoip-lite");
const logRequest = require("../utils/requestLogger");

// Add more country codes as needed
const ASIAN_COUNTRIES = [
  "AF",
  "AM",
  "AZ",
  "BH",
  "BD",
  "BT",
  "BN",
  "KH",
  "CN",
  "CY",
  "GE",
  "IN",
  "ID",
  "IR",
  "IQ",
  "IL",
  "JP",
  "JO",
  "KZ",
  "KW",
  "KG",
  "LA",
  "LB",
  "MY",
  "MV",
  "MN",
  "MM",
  "NP",
  "KP",
  "OM",
  "PK",
  "PS",
  "PH",
  "QA",
  "SA",
  "SG",
  "KR",
  "LK",
  "SY",
  "TW",
  "TJ",
  "TH",
  "TL",
  "TR",
  "TM",
  "AE",
  "UZ",
  "VN",
  "YE",
];

module.exports = function regionBlacklist(req, res, next) {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  //   console.log("ip", ip);
  // console.log("headers", req.headers);
  const geo = geoip.lookup(ip);
  //   console.log("geo", geo);

  // Log every request
  logRequest(ip, geo ? geo.country : null, geo ? geo.region : null, false);

  if (geo && ASIAN_COUNTRIES.includes(geo.country)) {
    logRequest(ip, geo ? geo.country : null, geo ? geo.region : null, true);
    console.log(`access from ${geo.country} is not allowed`);
    return res
      .status(403)
      .json({ message: "Access from your region is not allowed." });
  }
  next();
};
