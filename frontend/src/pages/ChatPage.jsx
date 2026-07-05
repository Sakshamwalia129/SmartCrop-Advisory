import React, { useState, useCallback } from 'react';
import { useChat } from '../hooks/useChat.js';
import Header from '../components/Header.jsx';
import DisclaimerBanner from '../components/DisclaimerBanner.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import QueryInput from '../components/QueryInput.jsx';
import HistorySidebar from '../components/HistorySidebar.jsx';
import { useToast, ToastContainer } from '../components/Toast.jsx';

export default function ChatPage() {
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
  } = useChat();

  const { toasts, showToast, dismiss } = useToast();

  const [query, setQuery] = useState('');
  const [cropType, setCropType] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [language, setLanguage] = useState('en');

  const handleSend = useCallback(() => {
    if (!query.trim() || isLoading) return;
    sendMessage(query, cropType, language);
    setQuery('');
  }, [query, cropType, language, isLoading, sendMessage]);

  // Called when user clicks an example in empty state — sends immediately
  const handleSelectExample = useCallback((exampleText, exampleCrop) => {
    if (exampleCrop) setCropType(exampleCrop);
    sendMessage(exampleText, exampleCrop || cropType, language);
  }, [sendMessage, cropType, language]);

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

        {/* Input area */}
        <QueryInput
          value={query}
          onChange={setQuery}
          cropType={cropType}
          onCropChange={setCropType}
          language={language}
          onLanguageChange={setLanguage}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>

      {/* ── Toast notifications ── */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
