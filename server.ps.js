// ==============================================================================
// OnePoint.kz - Entrypoint для Node.js в cPanel / Passenger на ps.kz
// ==============================================================================

const http = require("http");
const path = require("path");
const fs = require("fs");

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";

// Если приложение собрано через `output: 'standalone'`
const standaloneServerPath = path.join(__dirname, ".next", "standalone", "server.js");

if (fs.existsSync(standaloneServerPath)) {
  // Запуск standalone сервера Next.js
  process.env.NODE_ENV = process.env.NODE_ENV || "production";
  process.env.PORT = port;
  process.env.HOSTNAME = hostname;
  require(standaloneServerPath);
} else {
  // Запуск стандартного Next.js через next module
  const next = require("next");
  const dev = process.env.NODE_ENV !== "production";
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    http.createServer((req, res) => {
      handle(req, res);
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> OnePoint Next.js server ready on port ${port}`);
    });
  });
}
