// App.js - Complete Multi-Tenant React Frontend
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import './App.css';

// Enhanced Configuration with fallback
const API_BASE = process.env.REACT_APP_API_URL || 
                 (process.env.NODE_ENV === 'production' 
                   ? 'https://foodguard-backend.onrender.com/api'
                   : 'http://localhost:5000/api');

console.log('🔗 API Base URL:', API_BASE);
console.log('🌍 Environment:', process.env.NODE_ENV);

// Auth Context
const AuthContext = createContext();

// Custom hook for authentication
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Login attempt to:', `${API_BASE}/auth/login`);
      
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Include credentials for CORS
        body: JSON.stringify({ email, password })
      });

      console.log('📡 Login response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        await fetchProfile(data.access_token);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: 'Connection failed' };
    }
  };

  const register = async (userData) => {
    try {
      console.log('🚀 Registration attempt to:', `${API_BASE}/auth/register`);
      console.log('🚀 Registration data:', userData);
      
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Include credentials for CORS
        body: JSON.stringify(userData)
      });

      console.log('📡 Registration response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Registration successful:', data);
        localStorage.setItem('access_token', data.access_token);
        await fetchProfile(data.access_token);
        return { success: true };
      } else {
        const error = await response.json();
        console.error('❌ Registration failed:', error);
        return { success: false, error: error.error };
      }
    } catch (error) {
      console.error('❌ Registration connection error:', error);
      return { success: false, error: 'Connection failed' };
    }
  };

  const fetchProfile = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include' // Include credentials for CORS
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        localStorage.removeItem('access_token');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      localStorage.removeItem('access_token');
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return { user, loading, login, register, logout, setUser };
};

// Login Component
const LoginForm = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-form">
      <h2>🍽️ Sign In to FoodGuard</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <p className="auth-toggle">
        Don't have an account?{' '}
        <button className="link-btn" onClick={onToggleMode}>
          Create Account
        </button>
      </p>
    </div>
  );
};

// Register Component
const RegisterForm = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 Form submission started');
    
    // Validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (!formData.email.trim() || !formData.first_name.trim() || !formData.last_name.trim()) {
      setError('All fields are required');
      return;
    }
    
    setLoading(true);
    setError('');

    console.log('📤 Submitting registration data:', {
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      password: '[hidden]'
    });

    const result = await register(formData);
    
    if (!result.success) {
      console.error('❌ Registration result:', result);
      setError(result.error);
    } else {
      console.log('✅ Registration successful');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-form">
      <h2>🚀 Create Your Account</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password (minimum 6 characters)"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            minLength={6}
            required
          />
        </div>
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <p className="auth-toggle">
        Already have an account?{' '}
        <button className="link-btn" onClick={onToggleMode}>
          Sign In
        </button>
      </p>
    </div>
  );
};

// User Profile Management Component
const UserProfile = ({ user, onProfileUpdate, onBack }) => {
  const [allergies, setAllergies] = useState(user.allergies || []);
  const [newAllergy, setNewAllergy] = useState({ name: '', severity: 'moderate', notes: '' });
  const [loading, setLoading] = useState(false);

  const commonAllergens = [
    'milk', 'eggs', 'peanuts', 'tree nuts', 'almonds', 'walnuts', 'soy', 'wheat', 
    'shellfish', 'shrimp', 'crab', 'fish', 'salmon', 'sesame', 'mustard', 'celery', 
    'lupin', 'sulfites', 'gluten', 'cheese', 'butter', 'lactose'
  ];

  const addAllergy = () => {
    if (newAllergy.name.trim() && !allergies.find(a => a.name.toLowerCase() === newAllergy.name.toLowerCase())) {
      const allergy = {
        name: newAllergy.name.trim().toLowerCase(),
        severity: newAllergy.severity,
        notes: newAllergy.notes.trim()
      };
      setAllergies([...allergies, allergy]);
      setNewAllergy({ name: '', severity: 'moderate', notes: '' });
    }
  };

  const removeAllergy = (name) => {
    setAllergies(allergies.filter(a => a.name !== name));
  };

  const saveAllergies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/profile/allergies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include', // Include credentials for CORS
        body: JSON.stringify({ allergies })
      });

      if (response.ok) {
        onProfileUpdate({ ...user, allergies });
        alert('✅ Allergies updated successfully!');
      } else {
        alert('❌ Error updating allergies');
      }
    } catch (error) {
      alert('❌ Connection error');
    }
    setLoading(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-btn" onClick={onBack}>← Back to Scanner</button>
        <h2>👤 Your Profile</h2>
      </div>

      <div className="profile-content">
        <div className="profile-info">
          <h3>Account Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name</label>
              <span>{user.user.first_name} {user.user.last_name}</span>
            </div>
            <div className="info-item">
              <label>Email</label>
              <span>{user.user.email}</span>
            </div>
            <div className="info-item">
              <label>Total Scans</label>
              <span>{user.total_scans}</span>
            </div>
          </div>
        </div>

        <div className="allergies-section">
          <h3>🚨 Your Allergies ({allergies.length})</h3>
          
          {/* Quick Add Common Allergens */}
          <div className="quick-allergens">
            <h4>Quick Add Common Allergens:</h4>
            <div className="allergen-buttons">
              {commonAllergens.map(allergen => (
                <button
                  key={allergen}
                  className={`allergen-quick-btn ${allergies.find(a => a.name === allergen) ? 'added' : ''}`}
                  onClick={() => {
                    if (!allergies.find(a => a.name === allergen)) {
                      setAllergies([...allergies, { name: allergen, severity: 'moderate', notes: '' }]);
                    }
                  }}
                  disabled={allergies.find(a => a.name === allergen)}
                >
                  {allergen} {allergies.find(a => a.name === allergen) ? '✓' : '+'}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Allergy Input */}
          <div className="custom-allergy">
            <h4>Add Custom Allergy:</h4>
            <div className="allergy-input-group">
              <input
                type="text"
                placeholder="Enter allergy name"
                value={newAllergy.name}
                onChange={(e) => setNewAllergy({...newAllergy, name: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
              />
              <select
                value={newAllergy.severity}
                onChange={(e) => setNewAllergy({...newAllergy, severity: e.target.value})}
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
              <button onClick={addAllergy} disabled={!newAllergy.name.trim()}>
                Add
              </button>
            </div>
          </div>

          {/* Current Allergies */}
          <div className="current-allergies">
            <h4>Current Allergies:</h4>
            {allergies.length === 0 ? (
              <div className="no-allergies">
                <p>No allergies configured yet.</p>
                <p>Add some above to get personalized food safety warnings!</p>
              </div>
            ) : (
              <div className="allergies-list">
                {allergies.map((allergy, index) => (
                  <div key={index} className={`allergy-item severity-${allergy.severity}`}>
                    <div className="allergy-info">
                      <strong>{allergy.name}</strong>
                      <span className={`severity-badge severity-${allergy.severity}`}>
                        {allergy.severity}
                      </span>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeAllergy(allergy.name)}
                      title="Remove allergy"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="save-allergies-btn"
            onClick={saveAllergies}
            disabled={loading}
          >
            {loading ? '💾 Saving...' : '💾 Save Allergies'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Food Scanner Component
const FoodScannerApp = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/scan-history?per_page=5`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include' // Include credentials for CORS
      });

      if (response.ok) {
        const data = await response.json();
        setScanHistory(data.scans || []);
      }
    } catch (error) {
      console.error('Failed to load scan history:', error);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      setScanResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/analyze-food`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - browser will set it
        },
        credentials: 'include', // Include credentials for CORS
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setScanResult(result);
        
        // Update user's total scans count and reload history
        setUser(prev => ({ ...prev, total_scans: (prev.total_scans || 0) + 1 }));
        await loadScanHistory();
      } else {
        const error = await response.json();
        alert(`Analysis failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Analysis error:', error);
      alert(`Connection error: ${error.message}`);
    }
    
    setIsAnalyzing(false);
  };

  if (showProfile) {
    return (
      <UserProfile 
        user={user} 
        onProfileUpdate={setUser} 
        onBack={() => setShowProfile(false)} 
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🍽️ FoodGuard AI</h1>
            <p>Welcome back, {user.user.first_name}!</p>
          </div>
          <div className="header-actions">
            <button 
              className="profile-btn"
              onClick={() => setShowProfile(true)}
            >
              👤 Profile ({user.allergies?.length || 0} allergies)
            </button>
            <button className="logout-btn" onClick={logout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Image Upload Section */}
        <div className="scanner-section">
          <div className="upload-area">
            <div 
              className="image-upload-zone"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Selected food" className="preview-image" />
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">📸</div>
                  <h3>Upload Food Image</h3>
                  <p>Click here or drag & drop your food photo</p>
                  <small>Supports JPG, PNG, WebP up to 10MB</small>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />

            <div className="upload-actions">
              <button 
                className="analyze-btn"
                onClick={analyzeImage}
                disabled={!selectedImage || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>🔍 Analyzing... Please wait</>
                ) : (
                  <>🔍 Analyze for Allergens</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {scanResult && (
          <div className="results-section">
            <div className={`safety-status ${scanResult.is_safe ? 'safe' : 'warning'}`}>
              <div className="status-icon">
                {scanResult.is_safe ? '✅' : '⚠️'}
              </div>
              <div className="status-content">
                <h3>{scanResult.is_safe ? 'SAFE FOR YOU!' : '⚠️ ALLERGEN DETECTED!'}</h3>
                <p>
                  {scanResult.is_safe 
                    ? 'No allergens found based on your profile'
                    : `Found ${scanResult.allergen_warnings.length} potential allergen(s)`
                  }
                </p>
                {scanResult.confidence_score && (
                  <small>Analysis confidence: {(scanResult.confidence_score * 100).toFixed(1)}%</small>
                )}
              </div>
            </div>

            {/* Allergen Warnings */}
            {scanResult.allergen_warnings && scanResult.allergen_warnings.length > 0 && (
              <div className="warnings-section">
                <h4>⚠️ Allergen Warnings:</h4>
                <div className="warnings-list">
                  {scanResult.allergen_warnings.map((warning, index) => (
                    <div key={index} className={`warning-item severity-${warning.severity}`}>
                      <div className="warning-content">
                        <strong>{warning.allergen}</strong> detected in <em>{warning.ingredient}</em>
                        <div className="warning-details">
                          <span className={`severity-badge severity-${warning.severity}`}>
                            {warning.severity} allergy
                          </span>
                          <span className="confidence">
                            {(warning.confidence * 100).toFixed(1)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detected Ingredients */}
            {scanResult.ingredients && scanResult.ingredients.length > 0 && (
              <div className="ingredients-section">
                <h4>🥘 Detected Ingredients ({scanResult.ingredients.length}):</h4>
                <div className="ingredients-grid">
                  {scanResult.ingredients.slice(0, 15).map((ingredient, index) => (
                    <div key={index} className="ingredient-item">
                      <span className="ingredient-name">{ingredient.name}</span>
                      <span className="ingredient-confidence">
                        {(ingredient.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
                {scanResult.ingredients.length > 15 && (
                  <p className="ingredients-note">
                    ...and {scanResult.ingredients.length - 15} more ingredients detected
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recent Scans History */}
        {scanHistory.length > 0 && (
          <div className="history-section">
            <h3>📋 Recent Scans</h3>
            <div className="history-grid">
              {scanHistory.map((scan) => (
                <div key={scan.id} className={`history-card ${scan.is_safe ? 'safe' : 'warning'}`}>
                  <div className="history-status">
                    <span className={`status-badge ${scan.is_safe ? 'safe' : 'warning'}`}>
                      {scan.is_safe ? '✅ Safe' : `⚠️ ${scan.warnings?.length || 0} warnings`}
                    </span>
                    <span className="scan-time">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="history-ingredients">
                    {scan.ingredients?.slice(0, 3).map(ing => ing.name).join(', ')}
                    {scan.ingredients?.length > 3 && '...'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>⚠️ This tool is for informational purposes only. Always verify with food labels and restaurant staff for severe allergies.</p>
      </footer>
    </div>
  );
};

// Auth Wrapper
const AuthWrapper = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  return (
    <div className="auth-container">
      <div className="auth-hero">
        <h1>🍽️ FoodGuard AI</h1>
        <p>AI-Powered Personal Food Allergen Detection</p>
        <div className="hero-features">
          <div className="feature">📸 Scan any food</div>
          <div className="feature">🤖 AI ingredient detection</div>
          <div className="feature">⚠️ Personal allergen alerts</div>
        </div>
      </div>
      
      {isLogin ? (
        <LoginForm onToggleMode={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onToggleMode={() => setIsLogin(true)} />
      )}
    </div>
  );
};

// Main App Component
function App() {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>🍽️ FoodGuard AI</h2>
          <p>Loading your personalized food safety assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      {auth.user ? <FoodScannerApp /> : <AuthWrapper />}
    </AuthContext.Provider>
  );
}

export default App;
