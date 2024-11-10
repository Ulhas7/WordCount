import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [url, setUrl] = useState('');
    const [n, setN] = useState(1);
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3000/count-word', {
                url,
                n: parseInt(n)
            });
            setResult(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
            <h1>Word Frequency Finder</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL"
                    required
                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
                <input
                    type="number"
                    value={n}
                    onChange={(e) => setN(e.target.value)}
                    placeholder="Nth frequent word"
                    required
                    min="1"
                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
                <button type="submit" style={{ padding: "8px 16px" }}>Find Word</button>
            </form>
            {result && (
                <div style={{ marginTop: "20px" }}>
                    <h2>Result</h2>
                    <p><strong>Word:</strong> {result.word}</p>
                    <p><strong>Count:</strong> {result.count}</p>
                </div>
            )}
        </div>
    );
}

export default App;
