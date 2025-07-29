import React, { useState, useEffect } from 'react';
import api from '../utils/api'; // Assuming default export from api.ts

function IgcseList() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        // Example: Fetch all IGCSE Physics papers
        // You can make params dynamic based on user input or other state
        // const response = await api.Quizzes.getIgcsePapers({ subject: 'Physics' });
        const response = await api.Quizzes.getIgcsePapers();
        if (response && response.data) {
          setPapers(response.data);
        } else {
          setPapers([]); // Ensure papers is an array even if data is missing
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching IGCSE papers:", err);
        setError(err.message || 'Failed to fetch IGCSE papers.');
        setPapers([]); // Clear papers on error
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <p>Loading IGCSE papers...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (papers.length === 0) {
    return <p>No IGCSE papers found.</p>;
  }

  return (
    <div>
      <h2>IGCSE Papers</h2>
      <ul>
        {papers.map((paper) => (
          <li key={paper._id}>
            <h3>{paper.title}</h3>
            <p><strong>Subject:</strong> {paper.subject}</p>
            {paper.paperCode && <p><strong>Paper Code:</strong> {paper.paperCode}</p>}
            {paper.examSession && <p><strong>Exam Session:</strong> {paper.examSession}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default IgcseList;
