import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, googleLoginUser } from '../../services/api';
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { normalizeRole } from '../../utils/permission.js';
import logo from '../../assets/infinetra-logo.png';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPasskeyModal, setShowPasskeyModal] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const googleButtonRef = useRef(null);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [googleError, setGoogleError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let checkInterval = null;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID is missing - check client/.env');
      setGoogleLoading(false);
      setGoogleError(true);
      return;
    }

    const initAndRender = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return false;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        });

        const containerWidth =
          googleButtonRef.current.parentElement?.offsetWidth ||
          googleButtonRef.current.offsetWidth ||
          340;
        const buttonWidth = Math.min(Math.max(containerWidth, 200), 400);

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: buttonWidth,
        });

        if (isMounted) {
          setGoogleLoading(false);
          setGoogleError(false);
        }
        return true;
      } catch (err) {
        console.error('Failed to initialize Google Sign-In:', err);
        if (isMounted) {
          setGoogleError(true);
          setGoogleLoading(false);
        }
        return false;
      }
    };

    if (!initAndRender()) {
      let attempts = 0;
      checkInterval = setInterval(() => {
        attempts++;
        if (initAndRender() || attempts > 50) {
          clearInterval(checkInterval);
          if (attempts > 50 && isMounted && !window.google?.accounts?.id) {
            setGoogleLoading(false);
            setGoogleError(true);
          }
        }
      }, 100);
    }

    // Dynamic fallback if gsi script isn't loaded yet
    const scriptId = 'google-identity-script';
    if (!document.getElementById(scriptId) && !window.google?.accounts?.id) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initAndRender();
      script.onerror = () => {
        if (isMounted) {
          setGoogleLoading(false);
          setGoogleError(true);
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      setLoading(true);

      const data = await googleLoginUser(response.credential);

      login({
        user: data.user,
        token: data.token
      });

      showToast('success', 'Google login successful');

      const userRole = normalizeRole(data.user?.role);
      setTimeout(() => {
        if (userRole === 'super_admin') {
          navigate('/super-admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1200);
    } catch (error) {
      console.error('Google login error:', error);

      const errorMessage = error?.message?.toLowerCase() || '';

      if (
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('network error') ||
        errorMessage.includes('networkerror')
      ) {
        showToast('error', 'Unable to connect to server');
      } else {
        showToast('error', error?.message || 'Google login failed');
      }
    } finally {
      setLoading(false);
    }
  };



  const openPasskeyModal = () => {
    setShowPasskeyModal(true);
  };

  const closePasskeyModal = () => {
    setShowPasskeyModal(false);
  };

  const handlePasskeySuccess = () => {
  
    sessionStorage.setItem('passkeyVerified', 'true');

    setShowPasskeyModal(false);
    showToast('success', 'Passkey verified');
    navigate('/register');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      showToast('error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email: email.trim(),
        password
      });

      login({
        user: data.user,
        token: data.token
      });

      showToast('success', 'Login successful');

      const userRole = normalizeRole(data.user?.role);
      setTimeout(() => {
        if (userRole === 'super_admin') {
          navigate('/super-admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1200);
    } catch (error) {
      console.error('Login error:', error);

      const errorMessage = error?.message?.toLowerCase() || '';

      if (
        errorMessage.includes('invalid email or password') ||
        errorMessage.includes('incorrect email or password')
      ) {
        showToast('error', 'Incorrect email or password');
      } else if (
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('network error') ||
        errorMessage.includes('networkerror')
      ) {
        showToast('error', 'Unable to connect to server');
      } else {
        showToast('error', error?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="brand-section">

          <img
            src={logo}
            alt="Infinetra Logo"
            className="logo-image"
          />

          <h1 style={{ color: "#e9ebefff" }}>Infinetra HRMS</h1>

          <p className="brand-description">
            Elevating productivity through intelligent employee management and seamless human resource workflows.
          </p>

          <div className="feature-cards">

            <div className="feature-card">
              <span className="feature-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  width="20"
                  height="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="2" y="2" width="6" height="6" rx="1" />
                  <rect x="12" y="2" width="6" height="6" rx="1" />
                  <rect x="2" y="12" width="6" height="6" rx="1" />
                  <rect x="12" y="12" width="6" height="6" rx="1" />
                </svg>
              </span>

              <h4>Unified Dashboard</h4>
              <p>Real-time metrics at your fingertips.</p>
            </div>

            <div className="feature-card">
              <span className="feature-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  width="20"
                  height="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 2C7.23858 2 5 4.23858 5 7V9C4.44772 9 4 9.44772 4 10V14C4 15.6569 5.34315 17 7 17H13C14.6569 17 16 15.6569 16 14V10C16 9.44772 15.5523 9 15 9V7C15 4.23858 12.7614 2 10 2Z"
                    opacity="0.25"
                  />

                  <path
                    d="M7.75 10.75L9.5 12.5L12.75 9.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <h4>Secure Access</h4>
              <p>Enterprise-grade data protection.</p>
            </div>

          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-box">

          {/* Mobile-only logo header */}
          <div className="mobile-logo-header">
            <img src={logo} alt="Infinetra Logo" className="mobile-logo" />
            <span className="mobile-brand-name">Infinetra HRMS</span>
          </div>

          <h2>Welcome back</h2>

          <p className="subtitle">
            Sign in to continue to your dashboard.
          </p>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="password-wrapper">

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>

              </div>
            </div>


            <div className="form-row">


              <div>
                <Link
                  to="/forgot-password"
                  className="link"
                >
                  Forgot Password?
                </Link>
              </div>

            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="divider">
              <span></span>
              <p>OR</p>
              <span></span>
            </div>

            <div className="google-signin-wrapper">
              {googleLoading && (
                <div className="google-btn-loading">
                  <span className="google-icon">G</span>
                  &nbsp;&nbsp;Loading Google Sign-In...
                </div>
              )}
              {googleError && !googleLoading && (
                <div
                  className="google-btn-error"
                  onClick={() => window.location.reload()}
                  role="button"
                  tabIndex={0}
                  title="Click to retry loading Google Sign-In"
                >
                  <span className="google-icon">⚠️</span>
                  &nbsp;&nbsp;Google Sign-In unavailable (Click to retry)
                </div>
              )}
              <div
                ref={googleButtonRef}
                className={`google-btn-slot ${googleLoading || googleError ? 'google-btn-hidden' : ''}`}
              ></div>
            </div>

          </form>

          <p className="powered-by" style={{ marginTop: '24px' }}>
            POWERED BY INFINETRA TECH
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;