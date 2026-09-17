const fs = require("fs");
const path = require("path");

const port = process.env.PORT || "3000";
const hostname = "0.0.0.0";

process.env.PORT = port;
process.env.HOSTNAME = hostname;
process.env.NODE_ENV = "production";

console.log(`[Railway] NODE_ENV=${process.env.NODE_ENV}`);
console.log(`[Railway] HOSTNAME=${process.env.HOSTNAME}`);
console.log(`[Railway] PORT=${process.env.PORT}`);

const serverPath = path.join(process.cwd(), ".next", "standalone", "server.js");

if (!fs.existsSync(serverPath)) {
  console.error(`[Railway] Missing standalone server: ${serverPath}`);
  process.exit(1);
}

console.log(`[Railway] Starting ${serverPath}`);

require(serverPath);
