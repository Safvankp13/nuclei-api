import express from "express";
import { exec, execSync } from "child_process";
import fs from "fs";

const app = express();
app.use(express.json());

const nucleiPath = "/app/bin/nuclei";

// ✅ Auto-install Nuclei if not found (for Render restarts)
try {
  if (!fs.existsSync(nucleiPath)) {
    console.log("🔧 Nuclei not found. Installing...");
    execSync(`
      apt-get update && apt-get install -y wget unzip &&
      wget https://github.com/projectdiscovery/nuclei/releases/download/v3.2.0/nuclei_3.2.0_linux_amd64.zip &&
      unzip nuclei_3.2.0_linux_amd64.zip -d /app/bin &&
      chmod +x /app/bin/nuclei &&
      rm nuclei_3.2.0_linux_amd64.zip &&
      apt-get remove -y wget unzip && apt-get autoremove -y
    `);
    console.log("✅ Nuclei installed successfully");
  } else {
    console.log("✅ Nuclei already installed");
  }

  // Print version to logs
  execSync(`${nucleiPath} -version`, { stdio: "inherit" });
} catch (err) {
  console.error("❌ Failed to install or verify Nuclei:", err.message);
}

// ✅ Health check
app.get("/", (req, res) => {
  res.send("🚀 Nuclei API is running and ready!");
});

// ✅ Scan endpoint
app.post("/scan", (req, res) => {
  const { target } = req.body;
  if (!target) return res.status(400).json({ error: "target required" });

  console.log(`⚡ Running scan for ${target}`);
  exec(`${nucleiPath} -u ${target} -json`, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Nuclei error:", stderr || err.message);
      return res.status(500).json({ error: stderr || err.message });
    }

    try {
      const results = stdout
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line));
      res.json({ target, results });
    } catch {
      res.status(200).send(stdout);
    }
  });
});

app.listen(8080, () => console.log("✅ API running on port 8080"));
