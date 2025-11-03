import express from "express";
import { exec } from "child_process";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Nuclei API is running on Render 🚀");
});

app.post("/scan", (req, res) => {
  const { target } = req.body;
  if (!target) return res.status(400).json({ error: "target required" });

  console.log(`🚀 Scanning target: ${target}`);

  // Call nuclei directly from /app/bin
  exec(`/app/bin/nuclei -u ${target} -json`, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Scan error:", stderr || err.message);
      return res.status(500).json({ error: stderr || err.message });
    }

    try {
      const results = stdout
        .split("\n")
        .filter(Boolean)
        .map(line => JSON.parse(line));
      res.json({ target, results });
    } catch (e) {
      res.status(200).send(stdout);
    }
  });
});

app.listen(8080, () => console.log("✅ API running on port 8080"));
