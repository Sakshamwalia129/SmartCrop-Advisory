import React, { useRef, useEffect } from 'react';
import CropSelector from './CropSelector.jsx';

export default function QueryInput({
  value,
  onChange,
  cropType,
  onCropChange,
  language,
  onLanguageChange,
  onSend,
  isLoading,
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = value.trim().length >= 3 && !isLoading;

  return (
    <div className="flex-shrink-0 border-t border-green-100 bg-white px-4 py-3">
      {/* Crop selector row — now includes language toggle */}
      <div className="flex items-center gap-2 mb-2.5">
        <CropSelector value={cropType} onChange={onCropChange} />

        {/* Language toggle */}
        <div className="flex items-center rounded-lg border border-forest-200 overflow-hidden ml-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            aria-label="Switch to English"
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              language === 'en'
                ? 'bg-forest-700 text-white'
                : 'bg-forest-50 text-forest-700 hover:bg-forest-100'
            }`}
          >
            EN
          </button>
          <div className="w-px h-4 bg-forest-200 flex-shrink-0" />
          <button
            type="button"
            onClick={() => onLanguageChange('hi')}
            aria-label="Switch to Hindi"
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              language === 'hi'
                ? 'bg-forest-700 text-white'
                : 'bg-forest-50 text-forest-700 hover:bg-forest-100'
            }`}
          >
            हिं
          </button>
        </div>

        <span className="text-xs text-gray-400 hidden sm:block">
          Shift+Enter for new line · Enter to send
        </span>
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Describe your crop issue here… e.g. My beans have yellow spots."
            rows={1}
            className="w-full resize-none rounded-xl border border-green-200 bg-green-50/40 px-4 py-3 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all leading-relaxed"
          />
        </div>

        {/* Send button */}
        <button
          onClick={onSend}
          disabled={!canSend}
          aria-label="Send message"
          className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm ${
            canSend
              ? 'bg-forest-700 hover:bg-forest-800 text-white hover:shadow-md active:scale-95'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
