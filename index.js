const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config(); // so you don’t hard-code your API key

const app = express();
app.use(bodyParser.json());
app.use(cors()); // allow cross-origin from your Shopify domain

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env");
  process.exit(1);
}

/**
 * POST /generate
 * Body: { k1: string, k2: string, k3: string }
 * Returns: { imageUrl: string } on success
 */
app.post('/generate', async (req, res) => {
  try {
    const { k1, k2, k3 } = req.body;
    if (!k1 || !k2 || !k3) {
      return res.status(400).json({ error: "Please provide three keywords (k1, k2, k3)." });
    }

    // Build a single DALL·E prompt combining the three keywords:
    // You can tailor this prompt any way you like. For example:
    const prompt = `A high-resolution digital illustration combining: ${k1}, ${k2}, and ${k3}. White background, vector style.`;

    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',           // or whichever DALL·E model you have access to
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // DALL·E returns an array of data objects, each with a URL
    const imageUrl = openaiResponse.data.data[0].url;
    return res.json({ imageUrl });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.status(500).json({ error: "Failed to generate image." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`DALL·E proxy listening on port ${PORT}`);
});
