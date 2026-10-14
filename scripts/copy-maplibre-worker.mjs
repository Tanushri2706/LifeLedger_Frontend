import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const srcDir = path.join(rootDir, "node_modules", "maplibre-gl", "dist");
const targetDir = path.join(rootDir, "public", "maplibre");

const filesToCopy = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

if (!fs.existsSync(srcDir)) {
  console.warn("[copy-maplibre-worker] node_modules/maplibre-gl/dist not found. Skipping copy.");
  process.exit(0);
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

for (const file of filesToCopy) {
  const srcPath = path.join(srcDir, file);
  const targetPath = path.join(targetDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, targetPath);
    console.log(`[copy-maplibre-worker] Copied ${file} -> public/maplibre/${file}`);
  } else {
    console.warn(`[copy-maplibre-worker] File not found: ${srcPath}`);
  }
}
