// auth.js - Enhanced authentication module
class AuthService {
  constructor() {
    this.SESSION_KEY = 'neurodx_session';
    this.USERS_KEY = 'neurodx_users';
    this.TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Generate secure token
  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Hash password (use bcrypt in production)
  hashPassword(password) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
      .then(hash => Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''));
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password) {
    return {
      isValid: password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password),
      length: password.length >= 8,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /\d/.test(password),
      strength: this.calculatePasswordStrength(password)
    };
  }

  // Calculate password strength
  calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength; // 0-5 scale
  }

  // Register new user
  async register(userData) {
    const { name, email, password } = userData;

    // Validate input
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }

    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error('Password must be at least 8 characters with letters and numbers');
    }

    // Check if user exists
    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const hashedPassword = await this.hashPassword(password);
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      createdAt: Date.now(),
      settings: {
        theme: 'light',
        autoSave: true,
        notifications: true
      }
    };

    // Save user
    users.push(newUser);
    this.saveUsers(users);

    return {
      success: true,
      user: this.sanitizeUser(newUser)
    };
  }

  // Login user
  async login(email, password, rememberMe = false) {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user
    const users = this.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const hashedPassword = await this.hashPassword(password);
    if (user.password !== hashedPassword) {
      throw new Error('Invalid email or password');
    }

    // Create session
    const session = {
      userId: user.id,
      token: this.generateToken(),
      email: user.email,
      name: user.name,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.TOKEN_EXPIRY,
      rememberMe
    };

    // Save session
    this.saveSession(session, rememberMe);

    return {
      success: true,
      user: this.sanitizeUser(user),
      token: session.token
    };
  }

  // Logout user
  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.SESSION_KEY);
    window.location.href = '/login';
  }

  // Check if user is authenticated
  isAuthenticated() {
    const session = this.getSession();
    if (!session) return false;

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      this.logout();
      return false;
    }

    return true;
  }

  // Get current user
  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;

    const users = this.getUsers();
    const user = users.find(u => u.id === session.userId);
    
    return user ? this.sanitizeUser(user) : null;
  }

  // Update user settings
  updateUserSettings(settings) {
    const session = this.getSession();
    if (!session) throw new Error('Not authenticated');

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === session.userId);
    
    if (userIndex === -1) throw new Error('User not found');

    users[userIndex].settings = { ...users[userIndex].settings, ...settings };
    this.saveUsers(users);

    return { success: true };
  }

  // Helper methods
  getSession() {
    const localSession = localStorage.getItem(this.SESSION_KEY);
    const sessionSession = sessionStorage.getItem(this.SESSION_KEY);
    
    const sessionStr = localSession || sessionSession;
    if (!sessionStr) return null;

    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  }

  saveSession(session, rememberMe) {
    const sessionStr = JSON.stringify(session);
    if (rememberMe) {
      localStorage.setItem(this.SESSION_KEY, sessionStr);
    } else {
      sessionStorage.setItem(this.SESSION_KEY, sessionStr);
    }
  }

  getUsers() {
    const usersStr = localStorage.getItem(this.USERS_KEY);
    if (!usersStr) return [];

    try {
      return JSON.parse(usersStr);
    } catch {
      return [];
    }
  }

  saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  // Middleware for protected routes
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login';
      return false;
    }
    return true;
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
