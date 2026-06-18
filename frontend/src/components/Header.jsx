import React from 'react';

export default function Header({ onToggleSidebar, serverOnline, onClearChat }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-green-100 shadow-sm flex-shrink-0">
      {/* Left — hamburger (mobile) + brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-forest-700 hover:bg-forest-50 transition-colors"
          aria-label="Toggle history sidebar"
        >
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

      {/* Right — status + clear */}
      <div className="flex items-center gap-2">
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

        <button
          onClick={onClearChat}
          title="Clear chat"
          className="p-2 rounded-lg text-forest-500 hover:bg-forest-50 hover:text-forest-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
