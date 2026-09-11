import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './SignIn.css'; // This now contains all the styles

const EyeIcon = ({ visible }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {visible ? (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
    )}
  </svg>
);

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div 
      className="signin-page" 
      // style={{ backgroundImage: "url('https://i.ibb.co/6PDeY28/mountain-background.jpg')" }}
    >
      <div className="signin-card">
        <Link to="/" className="flex justify-center mb-4">
          <img src={logo} alt="FinAuditX" className="h-12 w-12 object-contain hover:scale-105 transition-transform" />
        </Link>
        <h2 className="signin-title">Have an account?</h2>
        
        <form onSubmit={handleSignIn} className="signin-form">
          <input 
            type="text" 
            placeholder="Username"
            required
            className="signin-input"
          />
          
          <div className="password-wrapper">
            <input 
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              required
              className="signin-input"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle-btn"
              aria-label="Toggle password visibility"
            >
              <EyeIcon visible={showPassword} />
            </button>
          </div>

          <button type="submit" className="signin-btn-primary">
            SIGN IN
          </button>

          <div className="options-container">
            <label className="remember-me">
              <input type="checkbox" className="form-checkbox" />
              <span>Remember Me</span>
            </label>
            <Link to="/forgot-password" className="forgot-password-link">Forgot Password</Link>
          </div>

          <div className="divider-container">
            <hr className="divider-line" />
            <span className="divider-text">Or Sign In With</span>
            <hr className="divider-line" />
          </div>

          <div className="social-buttons-container">
            <button type="button" className="social-btn">Facebook</button>
            <button type="button" className="social-btn">Twitter</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
