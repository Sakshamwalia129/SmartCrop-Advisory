import React, { useState, useCallback } from 'react';
import { useChat } from '../hooks/useChat.js';
import Header from '../components/Header.jsx';
import DisclaimerBanner from '../components/DisclaimerBanner.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import QueryInput from '../components/QueryInput.jsx';
import HistorySidebar from '../components/HistorySidebar.jsx';

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
  } = useChat();

  const [query, setQuery] = useState('');
  const [cropType, setCropType] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSend = useCallback(() => {
    if (!query.trim() || isLoading) return;
    sendMessage(query, cropType);
    setQuery('');
  }, [query, cropType, isLoading, sendMessage]);

  // Called when user clicks an example in empty state — sends immediately
  const handleSelectExample = useCallback((exampleText, exampleCrop) => {
    if (exampleCrop) setCropType(exampleCrop);
    sendMessage(exampleText, exampleCrop || cropType);
  }, [sendMessage, cropType]);

  // Called when user clicks a history item in the sidebar
  const handleSelectHistoryItem = useCallback((item) => {
    loadHistoryItem(item);
    setSidebarOpen(false);
  }, [loadHistoryItem]);

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
      />

      {/* ── Main Area ── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
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
        />

        {/* Input area */}
        <QueryInput
          value={query}
          onChange={setQuery}
          cropType={cropType}
          onCropChange={setCropType}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
