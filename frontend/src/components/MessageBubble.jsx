import React from 'react';
import AdvisoryCard from './AdvisoryCard.jsx';

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

const CROP_LABELS = {
  beans: '🫘 Beans',
  potato: '🥔 Potato',
  wheat: '🌾 Wheat',
  millet: '🌿 Millet',
  tomato: '🍅 Tomato',
  peas: '🫛 Peas',
  ginger: '🌱 Ginger',
  turmeric: '🌿 Turmeric',
  other: '🪴 Other',
};

// ── User message ─────────────────────────────────────────────────────────────
function UserBubble({ content, cropType, timestamp }) {
  return (
    <div className="flex flex-col items-end gap-1 message-enter">
      <div className="flex items-end gap-2 max-w-[80%]">
        <div className="flex flex-col items-end gap-1">
          {cropType && (
            <span className="text-xs bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full font-medium">
              {CROP_LABELS[cropType] || cropType}
            </span>
          )}
          <div className="bg-forest-700 text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm">
            <p className="text-sm leading-relaxed">{content}</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-forest-200 flex items-center justify-center flex-shrink-0 mb-0.5">
          <svg className="w-4 h-4 text-forest-700" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <span className="text-xs text-gray-400 mr-10">{formatTime(timestamp)}</span>
    </div>
  );
}

// ── AI message ────────────────────────────────────────────────────────────────
function AIBubble({ content, isWithinDomain, timestamp }) {
  // Only treat as refusal when backend explicitly sets isWithinDomain: false
  const isRefusal = isWithinDomain === false;

  return (
    <div className="flex flex-col items-start gap-1 message-enter">
      <div className="flex items-start gap-3 w-full">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
          <span className="text-sm leading-none">🌿</span>
        </div>

        {/* Card */}
        <div className="flex-1 bg-white border border-green-100 rounded-2xl rounded-tl-sm p-4 shadow-sm">
          {isRefusal ? (
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd" />
              </svg>
              <p className="text-sm text-gray-700 leading-relaxed">{content?.immediateAction}</p>
            </div>
          ) : (
            <AdvisoryCard data={content} />
          )}
        </div>
      </div>
      <span className="text-xs text-gray-400 ml-11">{formatTime(timestamp)}</span>
    </div>
  );
}

// ── Error message ─────────────────────────────────────────────────────────────
function ErrorBubble({ content, timestamp }) {
  return (
    <div className="flex flex-col items-start gap-1 message-enter">
      <div className="flex items-start gap-3 max-w-[85%]">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd" />
          </svg>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm px-4 py-3">
          <p className="text-sm text-red-700 leading-relaxed">{content}</p>
        </div>
      </div>
      <span className="text-xs text-gray-400 ml-11">{formatTime(timestamp)}</span>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function MessageBubble({ message }) {
  if (message.type === 'user') return <UserBubble {...message} />;
  if (message.type === 'ai') return <AIBubble {...message} />;
  if (message.type === 'error') return <ErrorBubble {...message} />;
  return null;
}
