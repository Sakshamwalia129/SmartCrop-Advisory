import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import EmptyState from './EmptyState.jsx';

export default function ChatWindow({ messages, isLoading, onSelectExample, language }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new messages or loading state change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <EmptyState onSelectExample={onSelectExample} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-5 space-y-5">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} language={language} />
      ))}

      {isLoading && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}
