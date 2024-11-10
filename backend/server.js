const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
app.use(express.json());

app.post('/count-word', async (req, res) => {
    const { url, n } = req.body;

    try {
        // Step 1: Fetch the page HTML
        const response = await fetch(url);
        const html = await response.text();

        // Step 2: Extract main text content
        const $ = cheerio.load(html);
        let text = '';
        $('p, h1, h2, h3, span, li').each((i, element) => {
            text += $(element).text() + ' ';
        });

        // Step 3: Count word frequency
        const words = text.replace(/[^a-zA-Z ]/g, '').toLowerCase().split(/\s+/);
        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });

        // Step 4: Sort and find nth most common word
        const sortedWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]);
        const nthMostCommonWord = sortedWords[n - 1];

        res.json({ word: nthMostCommonWord[0], count: nthMostCommonWord[1] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch or process content from URL' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
