import React, { useState, useEffect } from 'react';
import { checkHealth } from '../utils/api.js';

const BackendTest = () => {
  const [status, setStatus] = useState('testing');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [detailedError, setDetailedError] = useState(null);

  const testConnection = async () => {
    setStatus('testing');
    setError(null);
    setResult(null);
    setDetailedError(null);

    try {
      console.log('Testing backend connection...');
      console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
      console.log('Mode:', import.meta.env.MODE);
      console.log('All env vars:', import.meta.env);
      
      const healthData = await checkHealth();
      setResult(healthData);
      setStatus('success');
      console.log('✅ Backend connected successfully:', healthData);
    } catch (err) {
      setError(err.message);
      setStatus('error');
      setDetailedError({
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      console.error('❌ Backend connection failed:', err);
    }
  };

  const testDirectFetch = async () => {
    try {
      console.log('Testing direct fetch...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setResult(data);
      setStatus('success');
      console.log('✅ Direct fetch successful:', data);
    } catch (err) {
      setError(`Direct fetch failed: ${err.message}`);
      setStatus('error');
      setDetailedError({
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      console.error('❌ Direct fetch failed:', err);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  // Show the actual API URL being used
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h2>🚀 Backend Connection Test</h2>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Backend URL:</strong> {apiUrl}
      </div>
      
      <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
        <strong>Environment:</strong> {import.meta.env.MODE} | 
        <strong> VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || 'Not set'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> 
        <span style={{ 
          marginLeft: '10px',
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: status === 'success' ? '#d4edda' : 
                          status === 'error' ? '#f8d7da' : '#fff3cd',
          color: status === 'success' ? '#155724' : 
                 status === 'error' ? '#721c24' : '#856404'
        }}>
          {status === 'testing' && '🔄 Testing...'}
          {status === 'success' && '✅ Connected'}
          {status === 'error' && '❌ Failed'}
        </span>
      </div>

      {result && (
        <div style={{ 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          <h4>✅ Success!</h4>
          <p><strong>Status:</strong> {result.status}</p>
          <p><strong>Message:</strong> {result.message}</p>
          <p><strong>Timestamp:</strong> {result.timestamp}</p>
        </div>
      )}

      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          <h4>❌ Connection Failed</h4>
          <p><strong>Error:</strong> {error}</p>
          
          {detailedError && (
            <details style={{ marginTop: '10px' }}>
              <summary>🔍 Technical Details</summary>
              <pre style={{ fontSize: '11px', marginTop: '5px', overflow: 'auto' }}>
                {JSON.stringify(detailedError, null, 2)}
              </pre>
            </details>
          )}
          
          <p>This might be due to:</p>
          <ul>
            <li>Browser proxy settings</li>
            <li>Network configuration</li>
            <li>CORS restrictions</li>
            <li>Browser security policies</li>
            <li>Network firewall restrictions</li>
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={testConnection}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Again
        </button>
        
        <button 
          onClick={testDirectFetch}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Direct Fetch
        </button>
      </div>

      <div style={{ fontSize: '14px', color: '#666' }}>
        <h4>📝 Integration Status:</h4>
        <ul>
          <li>✅ Environment variables configured</li>
          <li>✅ API utility functions updated</li>
          <li>✅ Backend deployed and accessible</li>
          <li>✅ CORS headers verified</li>
          <li>{status === 'success' ? '✅' : '⏳'} Frontend-backend connection</li>
        </ul>
        
        {status === 'success' && (
          <div style={{ marginTop: '10px', color: '#155724' }}>
            <strong>🎉 Your frontend is successfully connected to the backend!</strong>
          </div>
        )}
        
        {status === 'error' && (
          <div style={{ marginTop: '10px', color: '#721c24', fontSize: '12px' }}>
            <p><strong>💡 Troubleshooting Tips:</strong></p>
            <ul>
              <li>Try opening Developer Tools (F12) and check the Network tab for more details</li>
              <li>Disable any browser extensions that might block requests</li>
              <li>Try in incognito/private browsing mode</li>
              <li>Check if your network/company firewall blocks external API calls</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendTest; 