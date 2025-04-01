import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function UserProfile() {
  const [profile, setProfile] = useState({
    name: '',
    role: 'student',
    specialty: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);
  const router = useRouter();

  // Check for existing profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 404) {
          // No profile exists yet
          setIsNewUser(true);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message);
        }
        
        // Profile exists
        setProfile(data.profile);
        setIsNewUser(false);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [router]);

  function handleChange(e) {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const method = isNewUser ? 'POST' : 'PUT';
      
      const response = await fetch('/api/auth/profile', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }
      
      // Proceed to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (loading) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="profile-form">
      <h2>{isNewUser ? 'Complete Your Profile' : 'Your Profile'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={profile.role}
            onChange={handleChange}
            required
          >
            <option value="student">Medical Student</option>
            <option value="resident">Resident</option>
            <option value="physician">Physician</option>
            <option value="educator">Educator</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="specialty">Specialty/Interest</label>
          <input
            type="text"
            id="specialty"
            name="specialty"
            value={profile.specialty}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="profile-btn"
        >
          {loading ? 'Saving...' : (isNewUser ? 'Create Profile' : 'Update Profile')}
        </button>
      </form>
    </div>
  );
}
