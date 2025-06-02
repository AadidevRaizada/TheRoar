// api/generate.js
import express from "express";
import axios from "axios";
import cors from "cors";
import bodyParser from "body-parser";

// If you use CommonJS, you can replace the above imports with:
// const express   = require("express");
// const axios     = require("axios");
// const cors      = require("cors");
// const bodyParser = require("body-parser");

const app = express();
app.use(cors()); 
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("🔴 Missing OPENAI_API_KEY in environment");
  process.exit(1);
}

app.post("/generate", async (req, res) => {
  try {
    const { k1, k2, k3 } = req.body || {};
    if (!k1 || !k2 || !k3) {
      return res.status(400).json({ error: "Please provide k1, k2, k3." });
    }

    // Build a single DALL·E prompt:
    const prompt = `A high-resolution vector illustration combining: ${k1}, ${k2}, and ${k3}. White background.`;

    const aiResp = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const imageUrl = aiResp.data.data[0].url;
    return res.status(200).json({ imageUrl });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.status(500).json({ error: "Image generation failed." });
  }
});

// Fallback for “root” just so Railway doesn’t crash on GET /
app.get("/", (req, res) => {
  res.send("⚡️ DALL·E proxy is up. POST to /generate with {k1,k2,k3}");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 DALL·E proxy listening on port ${PORT}`);
});
