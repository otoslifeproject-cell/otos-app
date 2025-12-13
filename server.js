// FILE: server.js (FULL REPLACEMENT)

import express from "express";
import bodyParser from "body-parser";
import { ingest } from "./feeder.js";

const app = express();
app.use(bodyParser.json());

app.post("/feeder", async (req, res) => {
  try {
    const result = await ingest(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OTOS Feeder running on port ${PORT}`);
});
