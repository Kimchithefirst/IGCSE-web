import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import './MockTestList.css';

/**
 * Component to display a list of mock tests
 */
const MockTestList = () => {
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMockTests = async () => {
    setLoading(true);
    setError(null);
    try {
      // First try to get from the API
      const tests = await api.get('/mock-tests');
      setMockTests(tests);
    } catch (err) {
      console.error('Failed to fetch from main API, trying sample endpoint:', err);
      try {
        // If main API fails, try the sample endpoint
        const sampleTests = await api.get('/mock-tests/sample');
        setMockTests(sampleTests);
      } catch (sampleErr) {
        console.error('Failed to fetch sample data:', sampleErr);
        setError('Could not load mock tests. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMockTests();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="mock-test-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading mock tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mock-test-list">
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchMockTests}>Try Again</button>
        </div>
      </div>
    );
  }

  if (mockTests.length === 0) {
    return (
      <div className="mock-test-list">
        <div className="empty-state">
          <h3>No Mock Tests Available</h3>
          <p>There are currently no mock tests available. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mock-test-list">
      <h2>Available Mock Tests</h2>
      <div className="test-grid">
        {mockTests.map((test) => (
          <div key={test._id || test.id} className="test-card">
            <div className="subject-badge">{test.subject}</div>
            <h3>{test.title}</h3>
            <p className="description">{test.description}</p>
            <div className="test-details">
              <span>Time: {test.timeLimit} minutes</span>
              <span>Created: {formatDate(test.createdAt)}</span>
            </div>
            <button className="start-test-btn">Start Test</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MockTestList; 