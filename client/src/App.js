import React, { useState } from 'react';
import './App.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

    // Function to download PDF with both List and Graph views
    const downloadPDF = () => {
        const pdf = new jsPDF();

        // 1. Capture List View
        const listView = document.getElementById('listView');
        if (listView) {
            pdf.text("Top Words List View", 10, 10);
            pdf.setFontSize(12);
            listView.querySelectorAll('li').forEach((li, index) => {
                pdf.text(`${index + 1}. ${li.textContent}`, 10, 20 + index * 10);
            });
        }

        // 2. Capture Graph View
        const graphView = document.getElementById('graphView');
        if (graphView) {
            pdf.addPage();  // Start a new page for the graph
            pdf.text("Graph View", 10, 10);

            html2canvas(graphView).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 180;  // Scale image to fit in PDF
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 10, 20, imgWidth, imgHeight);
                pdf.save("word_frequency.pdf");
            });
        } else {
            pdf.save("word_frequency.pdf");
        }
    };

    return (
        <div className="container">
            <h1>Word Frequency Counter</h1>
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
                <button type="button" onClick={downloadPDF} className="download-btn">
                    Download PDF
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
                <div id="listView" className="results">
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
                <div id="graphView" className="graph">
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            plugins: { title: { display: true, text: `Top ${n} Words of ${allWords.length} words` } },
                        }}
                    />
                    {!showAll && n > 10 && (
                        <button onClick={() => setShowAll(true)}>Show All</button>
                    )}
                    {showAll && (
                        <button onClick={() => setShowAll(false)}>Show Less</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
