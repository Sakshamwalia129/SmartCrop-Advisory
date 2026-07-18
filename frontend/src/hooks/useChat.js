import { useState, useCallback, useRef, useEffect } from 'react';
import { sendChatMessage, fetchHistory, renameConversationApi, deleteConversationApi } from '../api/chatApi.js';

const makeId = () => Math.random().toString(36).slice(2, 10);

export function useChat(isAuthenticated = false) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  // ID of the conversation currently displayed in the chat pane (null = new chat)
  const [activeConversationId, setActiveConversationId] = useState(null);

  // Ref so callbacks always see the latest isLoading without needing it as a dep
  const isLoadingRef = useRef(false);

  const addMessage = useCallback((msg) =>
    setMessages((prev) => [...prev, { id: makeId(), timestamp: new Date(), ...msg }]),
  []);

  // ── Auto-load history when user authenticates; clear on logout ──────────────
  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    } else {
      // User logged out — clear everything
      setMessages([]);
      setHistory([]);
      setActiveConversationId(null);
    }
  // loadHistory is stable (useCallback with no deps that change), so this is safe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── loadHistory ────────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    // Guard: never fire an unauthenticated request.
    // HistorySidebar calls this on mount (even before auth state is known),
    // so we read the token directly from localStorage as the source of truth.
    // If no token is present, the request would 401 and incorrectly dispatch
    // auth:unauthorized, which would clear a concurrently-restoring valid session.
    if (!localStorage.getItem('agri_token')) return;

    setHistoryLoading(true);
    try {
      const res = await fetchHistory(1, 30);
      if (res.success && Array.isArray(res.data?.conversations)) {
        setHistory(res.data.conversations);
      }
    } catch {
      // History is non-critical — swallow silently
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // ── sendMessage ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (query, cropType, language = 'en') => {
    const trimmed = query.trim();
    if (!trimmed || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    // Optimistic user message
    addMessage({ type: 'user', content: trimmed, cropType: cropType || null });

    try {
      const res = await sendChatMessage(trimmed, cropType || null, language);

      if (res.success && res.data) {
        setActiveConversationId(res.data.conversationId || null);
        addMessage({
          type: 'ai',
          // res.data contains: conversationId + all advisory fields flat
          content: res.data,
          isWithinDomain: res.meta?.isWithinDomain ?? true,
        });
        setServerOnline(true);
        // Refresh history after successful message (fire-and-forget)
        loadHistory();
      } else {
        addMessage({
          type: 'error',
          content: 'Unexpected response from the server. Please try again.',
        });
      }
    } catch (err) {
      const status = err.response?.status;
      let msg;

      if (status === 429) {
        msg = 'Too many requests. Please wait a minute before trying again.';
      } else if (status === 503) {
        msg = 'Advisory service is temporarily unavailable. Please try again shortly.';
      } else if (status === 400) {
        msg = err.response?.data?.error?.message || 'Invalid request. Please check your input.';
      } else if (!err.response) {
        msg = 'Cannot connect to server. Please ensure the backend is running on port 5000.';
        setServerOnline(false);
      } else {
        msg = err.response?.data?.error?.message || 'Something went wrong. Please try again.';
      }

      addMessage({ type: 'error', content: msg });
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [addMessage, loadHistory]);

  // ── loadHistoryItem ────────────────────────────────────────────────────────
  // History API returns: { query, cropType, response: { riskLevel, ... }, isWithinDomain, createdAt }
  // AdvisoryCard expects the response object directly as `content`
  const loadHistoryItem = useCallback((item) => {
    setActiveConversationId(item._id || null);
    setMessages([
      {
        id: makeId(),
        type: 'user',
        content: item.query,
        cropType: item.cropType || null,
        timestamp: new Date(item.createdAt),
      },
      {
        id: makeId(),
        type: 'ai',
        content: item.response,           // nested { riskLevel, possibleCause, ... }
        isWithinDomain: item.isWithinDomain,
        timestamp: new Date(item.createdAt),
      },
    ]);
  }, []);

  // ── clearChat ──────────────────────────────────────────────────────────────
  const clearChat = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
  }, []);

  // ── renameConversation ─────────────────────────────────────────────────────
  /**
   * Renames a conversation in MongoDB and updates the local history state
   * immediately (no full reload needed).
   * Returns the new title on success, throws on failure.
   */
  const renameConversation = useCallback(async (id, newTitle) => {
    const res = await renameConversationApi(id, newTitle);
    if (res.success && res.data?.title) {
      // Optimistic update: patch just the title in local state
      setHistory((prev) =>
        prev.map((item) => (item._id === id ? { ...item, title: res.data.title } : item))
      );
      return res.data.title;
    }
    throw new Error('Rename failed');
  }, []);

  // ── deleteConversation ─────────────────────────────────────────────────────
  /**
   * Deletes a conversation from MongoDB, removes it from local history,
   * and clears the chat pane if that conversation is currently open.
   */
  const deleteConversation = useCallback(async (id) => {
    await deleteConversationApi(id);
    setHistory((prev) => prev.filter((item) => item._id !== id));
    // If the deleted conversation is currently displayed, start a new chat
    setActiveConversationId((current) => {
      if (current === id) {
        setMessages([]);
        return null;
      }
      return current;
    });
  }, []);

  return {
    messages,
    isLoading,
    history,
    historyLoading,
    serverOnline,
    activeConversationId,
    sendMessage,
    loadHistory,
    loadHistoryItem,
    clearChat,
    renameConversation,
    deleteConversation,
  };
}
