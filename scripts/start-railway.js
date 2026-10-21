process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || "") + " --max-old-space-size=384";

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

const mem = process.memoryUsage();
console.log(`[Railway] Heap limit: 384MB | Initial RSS: ${Math.round(mem.rss / 1024 / 1024)}MB`);

// Periodic lightweight unreferenced memory check (every 15 min)
const memTimer = setInterval(() => {
  const current = process.memoryUsage();
  console.log(`[Railway] Heartbeat: RSS=${Math.round(current.rss / 1024 / 1024)}MB HeapUsed=${Math.round(current.heapUsed / 1024 / 1024)}MB`);
}, 15 * 60 * 1000);
if (memTimer.unref) memTimer.unref();

const serverPath = path.join(process.cwd(), ".next", "standalone", "server.js");

if (!fs.existsSync(serverPath)) {
  console.error(`[Railway] Missing standalone server: ${serverPath}`);
  process.exit(1);
}

console.log(`[Railway] Starting ${serverPath}`);

require(serverPath);
