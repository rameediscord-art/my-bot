// Bot-hosting.net entry point
// Installs bot-hosting deps then launches the bot
const { execSync, spawn } = require("child_process");
const path = require("path");

const botDir = path.join(__dirname, "bot-hosting");

console.log("[Startup] Installing bot dependencies...");
execSync("npm install --no-fund --no-audit", { cwd: botDir, stdio: "inherit" });
console.log("[Startup] Starting bot...");

const child = spawn("node", ["index.js"], { cwd: botDir, stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
