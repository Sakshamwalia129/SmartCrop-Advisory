import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { loginUser, registerUser } from '../api/authApi.js';

// ── Small sub-components ──────────────────────────────────────────────────────

function InputField({ id, label, type = 'text', value, onChange, error, placeholder, autoComplete, showToggle }) {
  const [visible, setVisible] = React.useState(false);
  const inputType = showToggle ? (visible ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-forest-700 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white text-gray-800 placeholder-gray-400
            outline-none transition-all duration-150
            ${showToggle ? 'pr-10' : ''}
            ${error
              ? 'border-red-400 focus:ring-2 focus:ring-red-200'
              : 'border-gray-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-100'
            }`}
        />
        {showToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? (
              /* Eye icon */
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              /* Eye-off icon */
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.209-3.592M6.53 6.53A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.96 9.96 0 01-4.072 5.354M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function SocialButton({ icon, label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl border border-gray-200
        bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300
        transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

// ── Main AuthModal ─────────────────────────────────────────────────────────────

export default function AuthModal() {
  const { login } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regErrors, setRegErrors] = useState({});

  // Focus first input when tab changes
  const firstInputRef = useRef(null);
  useEffect(() => {
    setApiError('');
    setLoginErrors({});
    setRegErrors({});
    setTimeout(() => firstInputRef.current?.focus(), 50);
  }, [tab]);

  // ── Validation ────────────────────────────────────────────────────────────────

  const validateLogin = () => {
    const errs = {};
    if (!loginEmail.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(loginEmail)) errs.email = 'Enter a valid email.';
    if (!loginPassword) errs.password = 'Password is required.';
    setLoginErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRegister = () => {
    const errs = {};
    if (!regName.trim() || regName.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!regEmail.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(regEmail)) errs.email = 'Enter a valid email.';
    if (!regPassword) errs.password = 'Password is required.';
    else if (regPassword.length < 8) errs.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(regPassword)) errs.password = 'Must include an uppercase letter.';
    else if (!/[a-z]/.test(regPassword)) errs.password = 'Must include a lowercase letter.';
    else if (!/[0-9]/.test(regPassword)) errs.password = 'Must include a number.';
    if (!regConfirm) errs.confirm = 'Please confirm your password.';
    else if (regPassword !== regConfirm) errs.confirm = 'Passwords do not match.';
    setRegErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit handlers ───────────────────────────────────────────────────────────

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setApiError('');
    setIsSubmitting(true);
    try {
      const res = await loginUser(loginEmail, loginPassword);
      if (res.success) {
        login(res.data.token, res.data.user);
      } else {
        setApiError(res.error?.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setApiError(err.response?.data?.error?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginEmail, loginPassword, login]);

  const handleRegister = useCallback(async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setApiError('');
    setIsSubmitting(true);
    try {
      const res = await registerUser(regName, regEmail, regPassword, regConfirm);
      if (res.success) {
        login(res.data.token, res.data.user);
      } else {
        setApiError(res.error?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setApiError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regName, regEmail, regPassword, regConfirm, login]);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    /* Backdrop — blurs the dashboard behind */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="auth-modal-title"
    >
      {/* Modal card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-gradient-to-br from-forest-700 to-forest-900 px-6 pt-7 pb-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <span className="text-2xl leading-none">🌿</span>
            </div>
          </div>
          <h2 id="auth-modal-title" className="text-xl font-bold text-white leading-tight">
            Agri-Allied AI
          </h2>
          <p className="text-forest-200 text-xs mt-1">Uttarakhand Mountain Crop Advisory</p>
        </div>

        {/* ── Tab switcher ── */}
        <div className="flex border-b border-gray-100">
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors duration-150
              ${tab === 'login'
                ? 'text-forest-700 border-b-2 border-forest-600 bg-forest-50/40'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            Log In
          </button>
          <button
            id="auth-tab-register"
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors duration-150
              ${tab === 'register'
                ? 'text-forest-700 border-b-2 border-forest-600 bg-forest-50/40'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            Sign Up
          </button>
        </div>

        {/* ── Form area ── */}
        <div className="px-6 py-5">

          {/* API-level error */}
          {apiError && (
            <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4">
              <InputField
                id="login-email"
                label="Email"
                type="email"
                value={loginEmail}
                onChange={setLoginEmail}
                error={loginErrors.email}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <InputField
                id="login-password"
                label="Password"
                type="password"
                value={loginPassword}
                onChange={setLoginPassword}
                error={loginErrors.password}
                placeholder="••••••••"
                autoComplete="current-password"
                showToggle
              />

              <button
                id="btn-login-submit"
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold
                  text-sm transition-all duration-150 flex items-center justify-center gap-2
                  disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? <><Spinner /> Logging in…</> : 'Log In'}
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} noValidate className="flex flex-col gap-3.5">
              <InputField
                id="reg-name"
                label="Full Name"
                type="text"
                value={regName}
                onChange={setRegName}
                error={regErrors.name}
                placeholder="Your name"
                autoComplete="name"
              />
              <InputField
                id="reg-email"
                label="Email"
                type="email"
                value={regEmail}
                onChange={setRegEmail}
                error={regErrors.email}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <InputField
                id="reg-password"
                label="Password"
                type="password"
                value={regPassword}
                onChange={setRegPassword}
                error={regErrors.password}
                placeholder="Min 8 chars, uppercase, number"
                autoComplete="new-password"
                showToggle
              />
              <InputField
                id="reg-confirm"
                label="Confirm Password"
                type="password"
                value={regConfirm}
                onChange={setRegConfirm}
                error={regErrors.confirm}
                placeholder="Repeat your password"
                autoComplete="new-password"
                showToggle
              />

              <button
                id="btn-register-submit"
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold
                  text-sm transition-all duration-150 flex items-center justify-center gap-2
                  disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? <><Spinner /> Creating account…</> : 'Create Account'}
              </button>
            </form>
          )}

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 my-4">
            <span className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or continue with</span>
            <span className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ── Social buttons ── */}
          <div className="flex flex-col gap-2.5">
            <SocialButton
              label="Continue with Google"
              disabled={isSubmitting}
              onClick={() => { window.location.href = '/api/auth/google'; }}
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              }
            />
            <SocialButton
              label="Continue with GitHub"
              disabled={isSubmitting}
              onClick={() => { window.location.href = '/api/auth/github'; }}
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.1 3.29 9.41 7.86 10.94.57.1.78-.25.78-.55v-1.93c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.72-1.52-2.55-.29-5.23-1.27-5.23-5.67 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.18a10.96 10.96 0 015.74 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.57.23 2.73.11 3.02.74.8 1.18 1.82 1.18 3.07 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.14v3.17c0 .31.21.66.79.55C20.21 21.41 23.5 17.1 23.5 12 23.5 5.73 18.27.5 12 .5z"/>
                </svg>
              }
            />
          </div>

          {/* Tab toggle hint */}
          <p className="text-center text-xs text-gray-500 mt-4">
            {tab === 'login' ? (
              <>No account?{' '}
                <button type="button" onClick={() => setTab('register')}
                  className="text-forest-700 font-semibold hover:underline">Sign up free</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" onClick={() => setTab('login')}
                  className="text-forest-700 font-semibold hover:underline">Log in</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
