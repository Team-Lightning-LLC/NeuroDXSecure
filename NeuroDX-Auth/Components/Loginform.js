import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginForm() {
  // State management
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle input changes
  function handleChange(e) {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  }

  // Form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-form-container">
      <h2>Login to NeuroDX</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="login-btn"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div className="auth-links">
        <a href="#" onClick={() => router.push('/auth/signup')}>
          Create account
        </a>
        <a href="#" onClick={() => router.push('/auth/reset-password')}>
          Forgot password?
        </a>
      </div>
    </div>
  );
}
