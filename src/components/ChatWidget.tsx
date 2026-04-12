"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/plausible";

function formatChatMessage(text: string): ReactNode[] {
  const parts = text.split(/(https?:\/\/[^\s)]+|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.match(/^https?:\/\//)) {
      const label = part.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').split('/').slice(0, 2).join('/');
      return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{label}</a>;
    }
    return part;
  });
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_REPLIES = [
  "Welche Touren gibt es?",
  "Preise",
  "Abfahrtszeiten",
  "Wo ist die Abfahrt?",
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check sessionStorage for existing consent on mount
  useEffect(() => {
    const consent = sessionStorage.getItem("chatbot-consent");
    if (consent === "true") {
      setHasConsented(true);
    }
  }, []);

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has updated before scrolling
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && hasConsented && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, hasConsented]);

  const handleConsent = () => {
    setHasConsented(true);
    sessionStorage.setItem("chatbot-consent", "true");
    trackEvent("Chat Consent Accepted");
  };

  const messageCountRef = useRef(0);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !hasConsented) return;

    messageCountRef.current += 1;
    trackEvent("Chat Message Sent", { message_number: String(messageCountRef.current) });

    const userMessage: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Entschuldigung, es gab ein technisches Problem. Bitte versuchen Sie es erneut.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Chat bubble button */}
      <button
        onClick={() => { if (!isOpen) trackEvent("Chat Opened"); setIsOpen(!isOpen); }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        aria-label="Chat öffnen"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-screen h-screen sm:w-[400px] sm:h-[500px] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-primary px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  Inselbahn Assistent
                </h3>
                <p className="text-white/70 text-xs">Immer f&uuml;r Sie da</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Chat schließen"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Consent Screen — shown before chat starts */}
          {!hasConsented ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 bg-gray-50/50">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F24444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-dark mb-3">
                KI-Assistent
              </h3>
              <p className="text-sm text-dark/70 leading-relaxed text-center mb-6">
                Dieser Chat wird von einer K&uuml;nstlichen Intelligenz (OpenAI) betrieben.
                Ihre Nachrichten werden zur Beantwortung an OpenAI &uuml;bermittelt. OpenAI
                nutzt API-Daten gem&auml;&szlig; ihrem Data Processing Agreement nicht f&uuml;r
                Modelltraining. Es werden keine vollst&auml;ndigen Gespr&auml;chsverl&auml;ufe
                gespeichert &mdash; lediglich anonymisierte Themenzusammenfassungen zur
                Verbesserung unseres Service.
              </p>
              <button
                onClick={handleConsent}
                className="w-full max-w-[240px] bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-full transition-colors text-sm"
              >
                Einverstanden
              </button>
              <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
                Mit Klick stimmen Sie der Verarbeitung gem&auml;&szlig; unserer{" "}
                <Link
                  href="/datenschutz"
                  className="underline hover:text-gray-600 transition-colors"
                >
                  Datenschutzerkl&auml;rung
                </Link>{" "}
                zu.
              </p>
            </div>
          ) : (
            <>
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50">
                {/* Welcome message */}
                {messages.length === 0 && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#F24444"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 max-w-[85%]">
                      <p className="text-sm text-dark leading-relaxed">
                        Hallo! &#128075; Ich bin der Inselbahn-Assistent. Fragen Sie
                        mich zu Touren, Preisen oder Abfahrtszeiten!
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        KI-generierte Antwort
                      </p>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${
                      msg.role === "user" ? "justify-end" : ""
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#F24444"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-tr-sm"
                          : "bg-white text-dark shadow-sm border border-gray-100 rounded-tl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {formatChatMessage(msg.content)}
                      </p>
                      {/* KI-Kennzeichnung for bot responses */}
                      {msg.role === "assistant" && (
                        <p className="text-[11px] text-gray-400 mt-1">
                          KI-generierte Antwort
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#F24444"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                      <div className="flex gap-1.5 items-center h-5">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies */}
              {messages.length === 0 && (
                <div className="px-4 py-2 flex flex-wrap gap-2 bg-white border-t border-gray-100">
                  {QUICK_REPLIES.map((text) => (
                    <button
                      key={text}
                      onClick={() => sendMessage(text)}
                      className="text-xs px-3 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10 transition-colors font-medium"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              )}

              {/* Input area */}
              <div className="border-t border-gray-200 bg-white px-4 py-3 shrink-0">
                {/* Privacy banner */}
                <p className="text-[11px] text-gray-400 text-center mb-2">
                  Ihre Eingaben werden an OpenAI zur Verarbeitung &uuml;bermittelt.{" "}
                  <Link
                    href="/datenschutz"
                    className="underline hover:text-gray-600 transition-colors"
                  >
                    Mehr erfahren
                  </Link>
                </p>
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ihre Frage..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    disabled={isLoading}
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    aria-label="Nachricht senden"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </form>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  KI-Assistent &middot;{" "}
                  <Link
                    href="/datenschutz"
                    className="underline hover:text-gray-600 transition-colors"
                  >
                    Datenschutz
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
