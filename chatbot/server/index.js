require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const port = process.env.PORT || 3000;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a knowledgeable, friendly, and professional real estate assistant for a licensed real estate broker. Your role is to help potential buyers, sellers, and renters with their real estate questions and needs.

You can help with:
- Answering questions about the home buying and selling process
- Explaining mortgage basics, down payments, and financing options
- Describing what to expect during home inspections, appraisals, and closing
- Providing general information about neighborhoods, schools, and amenities when asked
- Explaining real estate terminology (escrow, contingencies, earnest money, etc.)
- Helping users understand listing prices, market trends, and property values at a high level
- Scheduling showings or consultations by collecting the user's name, phone number, and preferred time
- Answering questions about rental properties and the leasing process

Guidelines:
- Always be warm, professional, and helpful
- If asked for specific legal or tax advice, recommend they consult a licensed attorney or CPA
- If asked about specific MLS listings or current inventory, let them know the broker will follow up with current listings
- Encourage users to schedule a free consultation for personalized guidance
- Keep responses concise and easy to understand — avoid jargon unless the user is clearly experienced
- If a user seems ready to take action (buy, sell, or schedule a showing), gently prompt them to leave their contact information so the broker can reach out`;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/widget.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, 'widget.js'));
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    });

    const reply = response.content[0].text;
    res.json({ reply });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
