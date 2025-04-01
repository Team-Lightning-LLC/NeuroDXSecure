import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LoginForm() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check for existing session
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) router.push('/dashboard');
  }, [router]);

  function handleChange(e) {
    setCredentials({...credentials, [e.target.name]: e.target.value});
  }

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
      
      if (!response.ok) throw new Error(data.message || 'Login failed');
      
      // Store authentication token
      localStorage.setItem('authToken', data.token);
      
      // Set user data if available
      if (data.user) localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="auth-form">
      <h2>Sign in to NeuroDX</h2>
      
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
            autoComplete="email"
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
            autoComplete="current-password"
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
        <a href="/auth/signup" onClick={(e) => {
          e.preventDefault();
          router.push('/auth/signup');
        }}>
          Create account
        </a>
        <a href="/auth/reset" onClick={(e) => {
          e.preventDefault();
          router.push('/auth/reset');
        }}>
          Forgot password?
        </a>
      </div>
    </div>
  );
}
