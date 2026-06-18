import React, { useEffect } from 'react';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const RISK_CHIP = {
  Low:     'bg-green-500/20 text-green-200',
  Medium:  'bg-amber-500/20 text-amber-200',
  High:    'bg-red-500/20 text-red-300',
  Unknown: 'bg-white/10 text-white/40',
  'N/A':   'bg-white/10 text-white/40',
};

export default function HistorySidebar({ history, historyLoading, onLoadHistory, onSelectItem, isOpen, onClose }) {
  // Load history on mount — onLoadHistory is stable (useCallback with no deps)
  useEffect(() => {
    onLoadHistory();
  }, [onLoadHistory]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full z-30 lg:z-auto
          w-72 flex-shrink-0 bg-forest-900 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <p className="text-sm font-semibold text-white">Conversation History</p>
            <p className="text-xs text-green-400 mt-0.5">
              {history.length > 0 ? `${history.length} conversations` : 'No history yet'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-white/50 hover:text-white transition-colors rounded"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-sidebar py-2">
          {historyLoading && (
            <div className="flex items-center justify-center py-10">
              <svg className="w-5 h-5 animate-spin text-green-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          )}

          {!historyLoading && history.length === 0 && (
            <div className="text-center py-12 px-5">
              <span className="text-3xl block mb-3">🌱</span>
              <p className="text-sm text-white/40 leading-relaxed">
                Your conversations will appear here after your first query.
              </p>
            </div>
          )}

          {!historyLoading && history.map((item, idx) => {
            const risk = item.response?.riskLevel;
            return (
              <button
                key={item._id || idx}
                onClick={() => { onSelectItem(item); onClose(); }}
                className="w-full text-left px-4 py-3 hover:bg-white/[0.07] transition-colors border-b border-white/[0.05] last:border-0 group"
              >
                {/* Query preview */}
                <p className="text-sm text-white/75 group-hover:text-white line-clamp-2 leading-snug mb-2 transition-colors">
                  {item.query}
                </p>

                {/* Chips row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.cropType && (
                    <span className="text-xs bg-white/10 text-white/55 px-2 py-0.5 rounded-full capitalize">
                      {item.cropType}
                    </span>
                  )}
                  {risk && risk !== 'N/A' && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${RISK_CHIP[risk] || RISK_CHIP['Unknown']}`}>
                      {risk}
                    </span>
                  )}
                  <span className="text-xs text-white/25 ml-auto flex-shrink-0">
                    {timeAgo(item.createdAt)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10">
          <p className="text-xs text-white/20 text-center">
            Mandakini Organic Produce Collective
          </p>
        </div>
      </aside>
    </>
  );
}
