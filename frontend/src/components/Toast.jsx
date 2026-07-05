import React, { useState, useCallback, useRef } from 'react';

/**
 * useToast — lightweight toast manager, no external dependencies.
 *
 * Usage:
 *   const { toasts, showToast } = useToast();
 *   showToast('Renamed successfully.', 'success');
 *   showToast('Failed to delete.', 'error');
 *
 * Render <ToastContainer toasts={toasts} /> near the root.
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timerMap = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timerMap.current[id]);
    delete timerMap.current[id];
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Math.random().toString(36).slice(2, 10);
    setToasts((prev) => [...prev, { id, message, type }]);
    timerMap.current[id] = setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  return { toasts, showToast, dismiss };
}

// ── Individual toast item ────────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }) {
  const isSuccess = toast.type === 'success';

  return (
    <div
      role="alert"
      className={[
        'flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg',
        'text-sm font-medium leading-snug',
        'animate-[slideUp_0.25s_ease-out]',
        'min-w-[260px] max-w-[360px]',
        isSuccess
          ? 'bg-forest-800 border border-forest-600 text-white'
          : 'bg-red-900/90 border border-red-500/50 text-red-100',
      ].join(' ')}
    >
      {/* Icon */}
      <span className="flex-shrink-0 mt-0.5 text-base leading-none">
        {isSuccess ? '✅' : '❌'}
      </span>

      {/* Message */}
      <span className="flex-1">{toast.message}</span>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity ml-1"
        aria-label="Dismiss notification"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Container — fixed bottom-right, stacks toasts ───────────────────────────
export function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
