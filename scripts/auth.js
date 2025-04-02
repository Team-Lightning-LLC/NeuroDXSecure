// Core authentication functions
const auth = {
  // User registration
  register: async function(username, email, password) {
    // In a real system, this would call an API
    // For now, store user in localStorage
    const user = {
      username,
      email,
      // In production: NEVER store raw passwords
      // This is simplified for demonstration
      password
    };
    
    // Get existing users or create empty array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
      return { success: false, message: 'Email already registered' };
    }
    
    // Add new user
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Create auth token (simplified)
    const token = btoa(`${email}:${Date.now()}`);
    localStorage.setItem('authToken', token);
    
    return { success: true, token };
  },
  
  // User login
  login: function(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find matching user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    // Create auth token (simplified)
    const token = btoa(`${email}:${Date.now()}`);
    localStorage.setItem('authToken', token);
    
    return { success: true, token };
  },
  
  // Logout
  logout: function() {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
  },
  
  // Check if user is authenticated
  isAuthenticated: function() {
    return !!localStorage.getItem('authToken');
  }
};
