# CalSnap

A beautiful, interactive concept for a calorie and fitness assistant that lets users snap a meal photo and instantly see estimated calories and macros.

## Gemini-powered analysis

The dashboard now streams meal insights from Google Gemini. Upload a JPG/PNG under 10&nbsp;MB and the inline Gemini call will return per-item calories, protein, carbs and fat. The default API key lives in `app.js` (`GEMINI_API_KEY`); replace it with your own for production use.

## Getting started

Open `index.html` in your favourite browser to explore the mock experience. All data is stored locally via `localStorage`.
