const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const standaloneDir = path.join(rootDir, ".next", "standalone");

if (fs.existsSync(standaloneDir)) {
  // 1. Copy public -> .next/standalone/public
  const publicSrc = path.join(rootDir, "public");
  const publicDest = path.join(standaloneDir, "public");
  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true });
    console.log("> [copy-standalone] Copied public/ to .next/standalone/public");
  }

  // 2. Copy .next/static -> .next/standalone/.next/static
  const staticSrc = path.join(rootDir, ".next", "static");
  const staticDest = path.join(standaloneDir, ".next", "static");
  if (fs.existsSync(staticSrc)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true });
    console.log("> [copy-standalone] Copied .next/static/ to .next/standalone/.next/static");
  }
} else {
  console.log("> [copy-standalone] .next/standalone not found (skipped)");
}
