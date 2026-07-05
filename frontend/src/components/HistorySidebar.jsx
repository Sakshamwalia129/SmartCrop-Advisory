import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}



// ── 3-dot context menu for a single conversation item ────────────────────────
// Dropdown is rendered via createPortal at document.body with fixed positioning
// so it escapes the overflow-y-auto scroll container and the aside's z-30
// stacking context — the real reason clicks fell through to rows beneath it.
function ItemMenu({ item, onRenameStart, onDeleteStart }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const openMenu = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((v) => !v);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close if the sidebar scrolls so the menu doesn't drift from its anchor
  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [open]);

  const dropdown = open && createPortal(
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999, pointerEvents: 'auto' }}
      className="w-36 bg-forest-800 border border-white/10 rounded-lg shadow-xl py-1 overflow-hidden"
      onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
    >
      <button
        onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(false); onRenameStart(); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition-colors"
      >
        {/* Pencil */}
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Rename
      </button>
      <button
        onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(false); onDeleteStart(); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
      >
        {/* Trash */}
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </button>
    </div>,
    document.body
  );

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={btnRef}
        onClick={openMenu}
        className="p-1 rounded text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="More options"
        title="More options"
      >
        {/* Vertical dots */}
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5"  r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {dropdown}
    </div>
  );
}

// ── Delete confirmation dialog ────────────────────────────────────────────────
function DeleteDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-forest-900 border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="text-sm font-semibold text-white mb-2">Delete Conversation</h3>
        <p className="text-xs text-white/55 leading-relaxed mb-5">
          Are you sure you want to delete this conversation? This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-white/10 text-white/70 hover:bg-white/15 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Inline rename input ────────────────────────────────────────────────────────
function RenameInput({ currentTitle, onSave, onCancel }) {
  const [value, setValue] = useState(currentTitle || '');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') onCancel();
  };

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) return; // empty not allowed
    onSave(trimmed);
  };

  return (
    <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, 60))}
        onKeyDown={handleKeyDown}
        maxLength={60}
        placeholder="Enter title…"
        className="flex-1 text-xs bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-white/30 outline-none focus:border-green-400"
      />
      <button
        onClick={handleSave}
        disabled={!value.trim()}
        className="p-1 text-green-400 hover:text-green-300 disabled:opacity-30 transition-colors"
        aria-label="Save"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </button>
      <button
        onClick={onCancel}
        className="p-1 text-white/40 hover:text-white/70 transition-colors"
        aria-label="Cancel"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Main sidebar component ────────────────────────────────────────────────────
export default function HistorySidebar({
  history, historyLoading, onLoadHistory, onSelectItem, isOpen, onClose,
  onRename, onDelete,
}) {
  const [renamingId, setRenamingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Load history on mount — onLoadHistory is stable (useCallback with no deps)
  useEffect(() => {
    onLoadHistory();
  }, [onLoadHistory]);

  const handleRenameSave = useCallback(async (id, newTitle) => {
    setRenamingId(null);
    await onRename(id, newTitle);
  }, [onRename]);

  const handleDeleteConfirm = useCallback(async (id) => {
    setDeletingId(null);
    await onDelete(id);
  }, [onDelete]);

  return (
    <>
      {/* ── Mobile overlay ── */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        className={[
          'flex-shrink-0 bg-forest-900 flex flex-col',
          'transition-all duration-300 ease-in-out',
          'fixed top-0 left-0 h-full z-30 w-72',
          'lg:relative lg:z-auto lg:h-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          isOpen ? 'lg:w-72 lg:opacity-100' : 'lg:w-0 lg:opacity-0 lg:overflow-hidden',
        ].join(' ')}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex-shrink-0 min-w-[18rem]">
          <p className="text-sm font-semibold text-white whitespace-nowrap">Conversation History</p>
          <p className="text-xs text-green-400 mt-0.5 whitespace-nowrap">
            {history.length > 0 ? `${history.length} conversations` : 'No history yet'}
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-sidebar py-2 min-w-[18rem]">
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
            const displayTitle = item.title
              ? item.title
              : item.query.length > 35
                ? item.query.slice(0, 35) + '…'
                : item.query;
            const isRenaming = renamingId === item._id;

            return (
              <div
                key={item._id || idx}
                className="relative border-b border-white/[0.05] last:border-0 group"
              >
                {isRenaming ? (
                  /* ── Inline rename row ── */
                  <div className="px-4 py-3">
                    <RenameInput
                      currentTitle={item.title || ''}
                      onSave={(newTitle) => handleRenameSave(item._id, newTitle)}
                      onCancel={() => setRenamingId(null)}
                    />
                  </div>
                ) : (
                  /* ── Normal row ── */
                  <button
                    onClick={() => { onSelectItem(item); onClose(); }}
                    className="w-full text-left px-4 py-3 hover:bg-white/[0.07] transition-colors pr-10"
                  >
                    {/* Title or fallback */}
                    <p className="text-sm text-white/75 group-hover:text-white line-clamp-2 leading-snug mb-2 transition-colors">
                      {displayTitle}
                    </p>

                    {/* Chips row */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.cropType && (
                        <span className="text-xs bg-white/10 text-white/55 px-2 py-0.5 rounded-full capitalize">
                          {item.cropType}
                        </span>
                      )}
                      <span className="text-xs text-white/25 ml-auto flex-shrink-0">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                  </button>
                )}

                {/* 3-dot menu — absolutely positioned so it doesn't break row layout */}
                {!isRenaming && (
                  <div
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                  >
                    <ItemMenu
                      item={item}
                      onRenameStart={() => setRenamingId(item._id)}
                      onDeleteStart={() => setDeletingId(item._id)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 flex-shrink-0 min-w-[18rem]">
          <p className="text-xs text-white/20 text-center whitespace-nowrap">
            Mandakini Organic Produce Collective
          </p>
        </div>
      </aside>

      {/* ── Delete confirmation dialog (portal-level z-index) ── */}
      {deletingId && (
        <DeleteDialog
          onConfirm={() => handleDeleteConfirm(deletingId)}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </>
  );
}
