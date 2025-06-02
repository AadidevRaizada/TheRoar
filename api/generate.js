// /api/generate.js
import axios from 'axios';

// In Vercel, process.env.OPENAI_API_KEY is automatically injected from your Project > Environment Variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  // If someone accidentally calls this locally without setting .env, we respond with an error.
  // (On Vercel, OPENAI_API_KEY must be set in the Dashboard under Settings → Environment Variables.)
  console.error("Missing OPENAI_API_KEY in environment");
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { k1, k2, k3 } = req.body || {};
  if (!k1 || !k2 || !k3) {
    return res.status(400).json({ error: "Please supply three keywords: k1, k2, k3." });
  }

  try {
    const prompt = `A high-resolution digital illustration combining: ${k1}, ${k2}, and ${k3}. White background, vector style.`;
    const openaiResp = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',
        prompt,
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

    const imageUrl = openaiResp.data.data[0].url;
    return res.status(200).json({ imageUrl });
  } catch (e) {
    console.error(e?.response?.data || e.message);
    return res.status(500).json({ error: 'Failed to generate image.' });
  }
}
