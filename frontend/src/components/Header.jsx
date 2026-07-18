import React, { useState, useRef, useEffect } from 'react';

/** Returns up to 2 uppercase initials from a name string */
function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function Header({ onToggleSidebar, sidebarOpen, serverOnline, onClearChat, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-green-100 shadow-sm flex-shrink-0">
      {/* Left — hamburger toggle + brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-forest-700 hover:bg-forest-50 transition-colors"
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {/* Always shows hamburger — clean single icon like ChatGPT */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-lg leading-none">🌿</span>
          </div>
          <div>
            <h1 className="text-base font-700 text-forest-900 leading-tight font-semibold">
              Agri-Allied AI
            </h1>
            <p className="text-xs text-forest-600 leading-tight hidden sm:block">
              Uttarakhand Mountain Crop Advisory
            </p>
          </div>
        </div>
      </div>

      {/* Right — server status + user info + avatar + 3-dot overflow menu */}
      <div className="flex items-center gap-2">
        {/* Server status pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-50 border border-forest-100">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              serverOnline ? 'bg-green-500 animate-pulse' : 'bg-red-400'
            }`}
          />
          <span className="text-xs font-medium text-forest-700 hidden sm:block">
            {serverOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* User name + email + clickable avatar with profile card */}
        {user && <UserProfile user={user} />}

        {/* 3-dot overflow menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More options"
            className="p-2 rounded-lg text-forest-500 hover:bg-forest-50 hover:text-forest-700 transition-colors"
          >
            {/* Vertical three-dot icon */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5"  r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-green-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
              <button
                onClick={() => { onClearChat(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                {/* Trash icon */}
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Chat
              </button>

              {/* Logout — only shown when logged in */}
              {user && onLogout && (
                <>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    id="btn-logout"
                    onClick={() => { onLogout(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {/* Logout icon */}
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log Out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ── UserProfile: avatar button + name/email text + profile card dropdown ──────

function UserProfile({ user }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile card when clicking outside
  useEffect(() => {
    if (!profileOpen) return;
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileOpen]);

  const initials = getInitials(user.name || user.email);

  return (
    <div className="relative flex items-center" ref={profileRef}>
      {/* Clickable avatar */}
      <button
        id="btn-user-avatar"
        onClick={() => setProfileOpen((v) => !v)}
        aria-label="View profile"
        aria-expanded={profileOpen}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center text-white text-xs font-bold select-none shadow-sm flex-shrink-0 hover:ring-2 hover:ring-forest-300 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-forest-400"
      >
        {initials}
      </button>

      {/* Profile card dropdown */}
      {profileOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Card header */}
          <div className="bg-gradient-to-br from-forest-600 to-forest-800 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate leading-tight">
                {user.name || '—'}
              </p>
              <p className="text-forest-200 text-[11px] truncate leading-tight mt-0.5">
                {user.email}
              </p>
            </div>
          </div>

          {/* Card body */}
          <div className="px-4 py-3 flex flex-col gap-2">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Full Name</p>
              <p className="text-sm text-gray-800 font-medium truncate">{user.name || '—'}</p>
            </div>
            <div className="border-t border-gray-100 pt-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Email Address</p>
              <p className="text-sm text-gray-800 font-medium truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
