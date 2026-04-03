import { useRef, useEffect, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const INACTIVITY_MS = 1 * 60 * 1000; // 1 minute

export function useChatLogger(messages: Message[]) {
  const loggedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesRef = useRef<Message[]>(messages);

  // Keep ref in sync
  messagesRef.current = messages;

  const sendLog = useCallback(() => {
    if (loggedRef.current || messagesRef.current.length === 0) return;
    loggedRef.current = true;

    // Use sendBeacon for reliability on page unload, fetch otherwise
    const payload = JSON.stringify({ messages: messagesRef.current });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/chat-log', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/chat-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  // Reset timer on every new message
  useEffect(() => {
    if (messages.length === 0) return;

    // Reset logged state if new messages come in after logging
    if (loggedRef.current) {
      loggedRef.current = false;
    }

    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new 3-minute inactivity timer
    timerRef.current = setTimeout(() => {
      sendLog();
    }, INACTIVITY_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [messages, sendLog]);

  // Log on page unload / visibility change
  useEffect(() => {
    function handleUnload() {
      sendLog();
    }

    function handleVisibility() {
      if (document.visibilityState === 'hidden') {
        sendLog();
      }
    }

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [sendLog]);
}
