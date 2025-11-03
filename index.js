import express from "express";
import { exec, execSync } from "child_process";
import fs from "fs";

const app = express();
app.use(express.json());

// ✅ Automatically install Nuclei if not present
try {
  if (!fs.existsSync("/usr/local/bin/nuclei")) {
    console.log("🔧 Installing Nuclei...");
    execSync(`
      apt-get update && apt-get install -y wget unzip &&
      wget https://github.com/projectdiscovery/nuclei/releases/download/v3.2.0/nuclei_3.2.0_linux_amd64.zip &&
      unzip nuclei_3.2.0_linux_amd64.zip -d /usr/local/bin &&
      chmod +x /usr/local/bin/nuclei &&
      rm nuclei_3.2.0_linux_amd64.zip &&
      apt-get remove -y wget unzip && apt-get autoremove -y
    `);
    console.log("✅ Nuclei installed successfully");
  } else {
    console.log("✅ Nuclei already installed");
  }
} catch (err) {
  console.error("❌ Failed to install Nuclei:", err.message);
}

// ✅ Health check endpoint
app.get("/", (req, res) => {
  res.send("Nuclei API is running 🚀");
});

// ✅ Scan endpoint
app.post("/scan", (req, res) => {
  const { target } = req.body;
  if (!target) return res.status(400).json({ error: "target required" });

  console.log(`⚡ Running scan for ${target}`);
  exec(`/usr/local/bin/nuclei -u ${target} -json`, (err, stdout, stderr) => {
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
    } catch (e) {
      res.status(200).send(stdout);
    }
  });
});

app.listen(8080, () => console.log("✅ API running on port 8080"));
