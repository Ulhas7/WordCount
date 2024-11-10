// Backend (server.js)
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.post('/count-word', async (req, res) => {
    const { url } = req.body;

    try {
        const response = await fetch(url);
        const html = await response.text();

        const cleanedHtml = html
            .replace(/<script[^>]*>([\S\s]*?)<\/script>/g, '')
            .replace(/<style[^>]*>([\S\s]*?)<\/style>/g, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/<[^>]+>/g, '');

        const text = cleanedHtml.trim();
        const words = text.toLowerCase().match(/\b[a-zA-Z\-]{2,}\b/g) || [];

        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });

        const sortedWords = Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .map(entry => ({
                word: entry[0],
                count: entry[1],
            }));

        res.json({
            topWords: sortedWords, // Send all sorted words to frontend
        });

    } catch (error) {
        console.error('Error processing the request:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
});

app.listen(5000, () => console.log('Server running on port 5000'));
