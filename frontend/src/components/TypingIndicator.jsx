import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 message-enter">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-sm">🌿</span>
      </div>

      {/* Bubble */}
      <div className="bg-white border border-green-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
        <p className="text-xs text-forest-500 mt-1.5">Analysing your crop issue…</p>
      </div>
    </div>
  );
}
