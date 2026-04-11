"use client";

import { useState, useRef, useEffect } from "react";
import { useChatLogger } from "@/lib/useChatLogger";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function formatMessage(text: string) {
  // Split by URLs and **bold** markers
  const parts = text.split(/(https?:\/\/[^\s)]+|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.match(/^https?:\/\//)) {
      // Make URLs clickable
      const label = part.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').split('/').slice(0, 2).join('/');
      return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">{label}</a>;
    }
    return part;
  });
}

const QUICK_REPLIES = [
  "Welche Touren gibt es?",
  "Preise & Tickets",
  "Abfahrtszeiten heute",
  "Wo ist die Abfahrt?",
  "Kann mein Hund mit?",
  "Stornierung",
];

export default function InlineChat() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useChatLogger(messages);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll within the chat container only, not the whole page
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (started && inputRef.current) {
      inputRef.current.focus();
    }
  }, [started]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || data.error || "Entschuldigung, ein Fehler ist aufgetreten." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!started) {
    return (
      <section id="kontakt" className="px-5 md:px-10 lg:px-20 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[28px] md:text-[40px] font-bold text-dark mb-4">
            Fragen? Wir helfen sofort.
          </h2>
          <p className="text-dark/60 text-base md:text-lg mb-8 max-w-xl mx-auto">
            Touren, Preise, Abfahrtszeiten, Helgoland-Tipps - unser KI-Assistent beantwortet
            Ihre Fragen rund um die Uhr.
          </p>
          <button
            onClick={() => setStarted(true)}
            className="bg-primary text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-primary/90 transition-colors mb-4"
          >
            Chat starten
          </button>
          <p className="text-dark/40 text-xs max-w-md mx-auto">
            Mit dem Start des Chats akzeptieren Sie unsere{" "}
            <a href="/datenschutz" className="underline hover:text-dark/60">
              Datenschutzerklärung
            </a>
            . Dieser Chat wird von KI betrieben. Es werden keine Gesprächsdaten gespeichert.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="kontakt" className="px-5 md:px-10 lg:px-20 py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-[24px] md:text-[32px] font-bold text-dark mb-6 text-center">
          Inselbahn Assistent
        </h2>

        {/* Chat container */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          {/* Messages */}
          <div ref={chatContainerRef} className="h-[400px] md:h-[480px] overflow-y-auto p-5 md:p-8 space-y-4">
            {/* Welcome */}
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F24444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="bg-gray-50 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                <p className="text-[15px] text-dark leading-relaxed">
                  Welkoam iip Lun! Ich bin der Inselbahn-Assistent und helfe Ihnen gerne bei
                  Fragen zu unseren Touren, Abfahrtszeiten, Tickets und allem rund um Helgoland.
                </p>
                <p className="text-[11px] text-gray-400 mt-1">KI-generierte Antwort</p>
              </div>
            </div>

            {/* Quick replies (only show if no messages yet) */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 pl-11">
                {QUICK_REPLIES.map((text) => (
                  <button
                    key={text}
                    onClick={() => sendMessage(text)}
                    className="text-[13px] px-3.5 py-2 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 items-start ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F24444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-md"
                      : "bg-gray-50 text-dark rounded-tl-md"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{formatMessage(msg.content)}</p>
                  {msg.role === "assistant" && (
                    <p className="text-[11px] text-gray-400 mt-1">KI-generierte Antwort</p>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F24444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-md px-5 py-4">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-dark/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-dark/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-dark/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Privacy banner + Input */}
          <div className="border-t border-gray-100 px-4 md:px-8 pt-2 pb-1">
            <p className="text-[10px] text-gray-400 text-center">
              Ihre Eingaben werden an OpenAI zur Verarbeitung übermittelt.{" "}
              <a href="/datenschutz" className="underline hover:text-gray-500">Mehr erfahren</a>
            </p>
          </div>
          <div className="px-4 md:px-8 pb-4 flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ihre Frage..."
              className="flex-1 bg-gray-50 rounded-full px-5 py-3 text-[15px] text-dark placeholder:text-dark/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 md:px-8 pb-3 flex justify-between items-center">
            <span className="text-[11px] text-dark/30">
              KI-Assistent &middot; Keine Daten gespeichert
            </span>
            <a href="/datenschutz" className="text-[11px] text-dark/30 hover:text-dark/50 underline">
              Datenschutz
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
