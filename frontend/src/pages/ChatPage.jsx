import React, { useState, useCallback } from 'react';
import { useChat } from '../hooks/useChat.js';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/Header.jsx';
import DisclaimerBanner from '../components/DisclaimerBanner.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import QueryInput from '../components/QueryInput.jsx';
import HistorySidebar from '../components/HistorySidebar.jsx';
import { useToast, ToastContainer } from '../components/Toast.jsx';

export default function ChatPage() {
  const { isAuthenticated, user, logout } = useAuth();

  const {
    messages,
    isLoading,
    history,
    historyLoading,
    serverOnline,
    sendMessage,
    loadHistory,
    loadHistoryItem,
    clearChat,
    renameConversation,
    deleteConversation,
  } = useChat(isAuthenticated);

  const { toasts, showToast, dismiss } = useToast();

  const [query, setQuery] = useState('');
  const [cropType, setCropType] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [language, setLanguage] = useState('en');

  const handleSend = useCallback(() => {
    if (!query.trim() || isLoading || !isAuthenticated) return;
    sendMessage(query, cropType, language);
    setQuery('');
  }, [query, cropType, language, isLoading, isAuthenticated, sendMessage]);

  // Called when user clicks an example in empty state — sends immediately
  const handleSelectExample = useCallback((exampleText, exampleCrop) => {
    if (!isAuthenticated) return;
    if (exampleCrop) setCropType(exampleCrop);
    sendMessage(exampleText, exampleCrop || cropType, language);
  }, [sendMessage, cropType, language, isAuthenticated]);

  // Called when user clicks a history item in the sidebar
  const handleSelectHistoryItem = useCallback((item) => {
    loadHistoryItem(item);
    setSidebarOpen(false);
  }, [loadHistoryItem]);

  // ── Rename handler ─────────────────────────────────────────────────────────
  const handleRename = useCallback(async (id, newTitle) => {
    try {
      await renameConversation(id, newTitle);
      showToast('Conversation renamed successfully.', 'success');
    } catch {
      showToast('Failed to rename conversation.', 'error');
    }
  }, [renameConversation, showToast]);

  // ── Delete handler ─────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id) => {
    try {
      await deleteConversation(id);
      showToast('Conversation deleted successfully.', 'success');
    } catch {
      showToast('Failed to delete conversation.', 'error');
    }
  }, [deleteConversation, showToast]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── History Sidebar ── */}
      <HistorySidebar
        history={history}
        historyLoading={historyLoading}
        onLoadHistory={loadHistory}
        onSelectItem={handleSelectHistoryItem}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onRename={handleRename}
        onDelete={handleDelete}
      />

      {/* ── Main Area ── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
          serverOnline={serverOnline}
          onClearChat={clearChat}
          user={user}
          onLogout={logout}
        />

        {/* Disclaimer */}
        <DisclaimerBanner />

        {/* Chat messages */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSelectExample={handleSelectExample}
          language={language}
        />

        {/* Input area — disabled when not authenticated (modal is showing) */}
        <QueryInput
          value={query}
          onChange={setQuery}
          cropType={cropType}
          onCropChange={setCropType}
          language={language}
          onLanguageChange={setLanguage}
          onSend={handleSend}
          isLoading={isLoading || !isAuthenticated}
        />
      </div>

      {/* ── Toast notifications ── */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
