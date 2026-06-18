import { useState, useCallback, useRef } from 'react';
import { sendChatMessage, fetchHistory } from '../api/chatApi.js';

const makeId = () => Math.random().toString(36).slice(2, 10);

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  // Ref so callbacks always see the latest isLoading without needing it as a dep
  const isLoadingRef = useRef(false);

  const addMessage = useCallback((msg) =>
    setMessages((prev) => [...prev, { id: makeId(), timestamp: new Date(), ...msg }]),
  []);

  // ── loadHistory ────────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
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
  const sendMessage = useCallback(async (query, cropType) => {
    const trimmed = query.trim();
    if (!trimmed || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    // Optimistic user message
    addMessage({ type: 'user', content: trimmed, cropType: cropType || null });

    try {
      const res = await sendChatMessage(trimmed, cropType || null);

      if (res.success && res.data) {
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
  }, []);

  return {
    messages,
    isLoading,
    history,
    historyLoading,
    serverOnline,
    sendMessage,
    loadHistory,
    loadHistoryItem,
    clearChat,
  };
}
