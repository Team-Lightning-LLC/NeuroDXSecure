import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProfileSelection({ onComplete }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Fetch user profiles on component mount
  useEffect(() => {
    async function fetchProfiles() {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        const response = await fetch('/api/auth/profiles', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message);
        }
        
        setProfiles(data.profiles);
      } catch (err) {
        setError('Failed to load profiles');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfiles();
  }, [router]);

  // Select profile and continue
  function handleProfileSelect(profileId) {
    localStorage.setItem('activeProfile', profileId);
    
    // Redirect to dashboard or call completion handler
    if (onComplete) {
      onComplete(profileId);
    } else {
      router.push('/dashboard');
    }
  }

  // Create new profile
  function handleCreateProfile() {
    router.push('/auth/create-profile');
  }

  if (loading) return <div className="profile-loading">Loading profiles...</div>;

  return (
    <div className="profile-selection">
      <h2>Select Profile</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="profiles-container">
        {profiles.length > 0 ? (
          profiles.map(profile => (
            <div 
              key={profile.id} 
              className="profile-card"
              onClick={() => handleProfileSelect(profile.id)}
            >
              <div className="profile-icon">{profile.name.charAt(0)}</div>
              <div className="profile-info">
                <h3>{profile.name}</h3>
                <p>{profile.role}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-profiles">
            <p>No profiles found. Create your first profile to continue.</p>
          </div>
        )}
        
        <div className="profile-card new-profile" onClick={handleCreateProfile}>
          <div className="profile-icon">+</div>
          <div className="profile-info">
            <h3>Create New Profile</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
