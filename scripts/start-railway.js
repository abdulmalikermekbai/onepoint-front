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

// Catch transient network socket / ETIMEDOUT errors to prevent node process crash
process.on("unhandledRejection", (reason) => {
  const msg = (reason && (reason.message || reason.stack)) || String(reason);
  if (msg.includes("fetch failed") || msg.includes("ETIMEDOUT") || msg.includes("UND_ERR_SOCKET") || msg.includes("SocketError")) {
    console.warn(`[Railway] Handled background fetch error: ${msg}`);
    return;
  }
  console.error("[Railway] Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  const msg = (err && (err.message || err.stack)) || String(err);
  if (msg.includes("fetch failed") || msg.includes("ETIMEDOUT") || msg.includes("UND_ERR_SOCKET") || msg.includes("SocketError")) {
    console.warn(`[Railway] Handled uncaught socket exception: ${msg}`);
    return;
  }
  console.error("[Railway] Uncaught Exception:", err);
});

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
