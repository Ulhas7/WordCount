import React, { useState } from 'react';
import './App.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
    const [url, setUrl] = useState('');
    const [n, setN] = useState(1);
    const [allWords, setAllWords] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewType, setViewType] = useState('list');
    const [showAll, setShowAll] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/count-word', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (response.ok) {
                setAllWords(data.topWords);
                setError('');
            } else {
                setError(data.error || 'An error occurred');
                setAllWords([]);
            }
        } catch (err) {
            setError('Network error');
            setAllWords([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setUrl('');
        setN(1);
        setAllWords([]);
        setError('');
        setViewType('list');
        setShowAll(false);
    };

    const handleViewChange = (e) => {
        setViewType(e.target.value);
    };

    // Word list to display based on `showAll` and `n`
    const wordsToDisplay = showAll ? allWords.slice(0, n) : allWords.slice(0, Math.min(n, 10));

    const chartData = {
      labels: wordsToDisplay.map((word, index) => `${index + 1}. ${word.word}`),
      datasets: [
          {
              label: 'Word Count',
              data: wordsToDisplay.map(word => word.count),
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
          },
      ],
  };
  

    return (
        <div className="container">
            <h1>Word Frequency Counter </h1>
            <form onSubmit={handleSubmit} className="form">
                <div className="input-group">
                    <label htmlFor="url">URL:</label>
                    <input
                        type="text"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter a URL"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="n">Top N Words:</label>
                    <input
                        type="number"
                        id="n"
                        value={n}
                        onChange={(e) => setN(Number(e.target.value))}
                        min="1"
                    />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Loading...' : 'Submit'}
                </button>
                <button type="button" onClick={handleClear} className="clear-btn">
                    Clear
                </button>
            </form>

            {loading && <div className="loading">Loading...</div>}

            {error && <p className="error-message">{error}</p>}

            <div>
                <select id="viewSelect" onChange={handleViewChange} value={viewType}>
                    <option value="list">List View</option>
                    <option value="graph">Graph View</option>
                </select>
            </div>

            {viewType === 'list' && allWords.length > 0 && (
                <div className="results">
                    <h2>Top {n} Most Frequent Words of {allWords.length}:</h2>
                    <ul>
                        {wordsToDisplay.map((word, index) => (
                            <li key={index} className="tooltip-container">
                                <strong>{word.word}</strong> ({word.count})
                                <span className="tooltip-text">Rank: {index + 1}</span>
                            </li>
                        ))}
                    </ul>

                    {!showAll && n > 10 && (
                        <button onClick={() => setShowAll(true)}>Show More</button>
                    )}
                    {showAll && (
                        <button onClick={() => setShowAll(false)}>Show Less</button>
                    )}
                </div>
            )}

            {viewType === 'graph' && allWords.length > 0 && (
                <div className="graph">
                  
                    {!showAll && n > 10 && (
                      <button onClick={() => setShowAll(true)}>Show All</button>
                    )}
                    {showAll && (
                      <button onClick={() => setShowAll(false)}>Show Less</button>
                    )}
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            plugins: { title: { display: true, text: `Top ${n} Words of ${allWords.length} words` } },
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default App;
