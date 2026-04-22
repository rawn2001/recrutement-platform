// src/components/ChatBot/TalentBot.jsx
// Emplacement : recrutement-platform/frontend/src/components/ChatBot/TalentBot.jsx
// Import dans App.js : import TalentBot from './components/ChatBot/TalentBot';
// Utilisation dans App.js : ajoute <TalentBot /> juste avant </SocketContextProvider>

import { useState, useRef, useEffect } from "react";

const API_URL = "http://localhost:5001/api/chat";

const BOT_AVATAR = "🤖";
const USER_AVATAR = "👤";

const SUGGESTIONS = [
  "Comment réussir mon entretien ?",
  "Comment eviter le stress ?",
  "Comment améliorer mon CV ?",
  "Questions fréquentes en entretien",
];

export default function TalentBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Bonjour ! 👋 Je suis **TalentBot**, votre assistant recrutement.\n\nJe peux vous aider sur :\n• La préparation aux entretiens\n• La gestion du stress\n• L'optimisation de votre CV\n• Le processus de recrutement\n\nQue puis-je faire pour vous ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
      scrollToBottom();
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Arrêter le pulse après 6s
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getHistory = () =>
    messages
      .filter((m) => m.role !== "bot" || messages.indexOf(m) !== 0)
      .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content }));

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: getHistory() }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: data.reply || "Désolé, une erreur s'est produite." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "❌ Impossible de contacter le serveur. Vérifiez que le backend Flask est démarré." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .tb-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        /* ── Bouton bulle ── */
        .tb-bubble {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6C63FF 0%, #4f46e5 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(108, 99, 255, 0.45);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
          z-index: 10;
        }
        .tb-bubble:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 28px rgba(108, 99, 255, 0.55);
        }
        .tb-bubble-icon {
          font-size: 26px;
          line-height: 1;
          transition: transform 0.3s;
        }
        .tb-bubble.open .tb-bubble-icon {
          transform: rotate(90deg);
        }
        .tb-pulse-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(108, 99, 255, 0.4);
          animation: tb-pulse 1.8s ease-out infinite;
        }
        @keyframes tb-pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        /* ── Fenêtre chat ── */
        .tb-window {
          position: absolute;
          bottom: 72px;
          right: 0;
          width: 360px;
          height: 520px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform-origin: bottom right;
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s;
        }
        .tb-window.closed {
          transform: scale(0.7);
          opacity: 0;
          pointer-events: none;
        }
        .tb-window.opened {
          transform: scale(1);
          opacity: 1;
        }

        /* ── Header ── */
        .tb-header {
          background: linear-gradient(135deg, #6C63FF 0%, #4f46e5 100%);
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .tb-header-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .tb-header-info h4 {
          margin: 0;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.01em;
        }
        .tb-header-info span {
          font-size: 11px;
          color: rgba(255,255,255,0.75);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .tb-online-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #4ade80;
          display: inline-block;
        }
        .tb-header-close {
          margin-left: auto;
          background: rgba(255,255,255,0.15);
          border: none;
          color: #fff;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .tb-header-close:hover { background: rgba(255,255,255,0.25); }

        /* ── Messages ── */
        .tb-messages {
          flex: 1;
          overflow-y: auto;
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #f8f9ff;
        }
        .tb-messages::-webkit-scrollbar { width: 4px; }
        .tb-messages::-webkit-scrollbar-thumb { background: #d0d0f0; border-radius: 4px; }

        .tb-msg-row {
          display: flex;
          align-items: flex-end;
          gap: 7px;
        }
        .tb-msg-row.user { flex-direction: row-reverse; }

        .tb-msg-ava {
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }
        .tb-msg-row.bot .tb-msg-ava {
          background: linear-gradient(135deg, #6C63FF, #4f46e5);
          color: #fff;
        }
        .tb-msg-row.user .tb-msg-ava {
          background: #e8e8ff;
        }

        .tb-bubble-msg {
          max-width: 78%;
          padding: 10px 13px;
          border-radius: 16px;
          font-size: 13px;
          line-height: 1.55;
          color: #1a1a2e;
        }
        .tb-msg-row.bot .tb-bubble-msg {
          background: #fff;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
        }
        .tb-msg-row.user .tb-bubble-msg {
          background: linear-gradient(135deg, #6C63FF, #4f46e5);
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        /* Typing indicator */
        .tb-typing {
          display: flex;
          gap: 4px;
          padding: 8px 10px;
        }
        .tb-typing span {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #b0b0d0;
          animation: tb-bounce 1.2s ease-in-out infinite;
        }
        .tb-typing span:nth-child(2) { animation-delay: 0.2s; }
        .tb-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes tb-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }

        /* ── Suggestions ── */
        .tb-suggestions {
          padding: 6px 10px 2px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          background: #f8f9ff;
          border-top: 1px solid #eeeeff;
        }
        .tb-sug-btn {
          background: #fff;
          border: 1.5px solid #d0d0f8;
          color: #6C63FF;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 11px;
          font-family: inherit;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .tb-sug-btn:hover {
          background: #6C63FF;
          color: #fff;
          border-color: #6C63FF;
        }

        /* ── Input bar ── */
        .tb-input-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: #fff;
          border-top: 1px solid #eeeeff;
        }
        .tb-input {
          flex: 1;
          border: 1.5px solid #e0e0f5;
          border-radius: 22px;
          padding: 9px 14px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          background: #f8f9ff;
          color: #1a1a2e;
          transition: border 0.2s;
          resize: none;
        }
        .tb-input:focus { border-color: #6C63FF; background: #fff; }
        .tb-input::placeholder { color: #b0b0c8; }

        .tb-send-btn {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6C63FF, #4f46e5);
          border: none;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          flex-shrink: 0;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(108,99,255,0.35);
        }
        .tb-send-btn:hover:not(:disabled) {
          transform: scale(1.08);
          box-shadow: 0 4px 14px rgba(108,99,255,0.45);
        }
        .tb-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="tb-root">
        {/* ── Fenêtre ── */}
        <div className={`tb-window ${open ? "opened" : "closed"}`}>
          {/* Header */}
          <div className="tb-header">
            <div className="tb-header-avatar">🤖</div>
            <div className="tb-header-info">
              <h4>TalentBot</h4>
              <span><span className="tb-online-dot" /> Assistant recrutement</span>
            </div>
            <button className="tb-header-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="tb-messages">
            {messages.map((m, i) => (
              <div key={i} className={`tb-msg-row ${m.role}`}>
                <div className="tb-msg-ava">{m.role === "bot" ? "🤖" : "👤"}</div>
                <div
                  className="tb-bubble-msg"
                  dangerouslySetInnerHTML={{ __html: formatText(m.content) }}
                />
              </div>
            ))}
            {loading && (
              <div className="tb-msg-row bot">
                <div className="tb-msg-ava">🤖</div>
                <div className="tb-bubble-msg">
                  <div className="tb-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="tb-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="tb-sug-btn" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="tb-input-bar">
            <input
              ref={inputRef}
              className="tb-input"
              type="text"
              placeholder="Posez votre question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              className="tb-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              ➤
            </button>
          </div>
        </div>

        {/* ── Bouton bulle ── */}
        <button
          className={`tb-bubble ${open ? "open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          title="Ouvrir TalentBot"
        >
          {pulse && !open && <span className="tb-pulse-ring" />}
          <span className="tb-bubble-icon">{open ? "✕" : "💬"}</span>
        </button>
      </div>
    </>
  );
}
