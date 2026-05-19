# AI Real Estate Chatbot

An embeddable AI chatbot built for a real estate broker's website. 
Integrates with any site via a single `<script>` tag.

## Technologies

- Node.js + Express server exposing a `/api/chat` endpoint 
  that proxies conversation history to the Claude API with a custom real 
  estate system prompt
- Self-contained vanilla JS file served statically from the 
  same server; injects a floating chat UI into any webpage when loaded, 
  with no external dependencies
- Hosted on Render
