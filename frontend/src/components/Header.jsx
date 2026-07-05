import React, { useState, useRef, useEffect } from 'react';

export default function Header({ onToggleSidebar, sidebarOpen, serverOnline, onClearChat }) {
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

      {/* Right — server status + 3-dot overflow menu */}
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
