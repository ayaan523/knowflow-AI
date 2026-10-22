import { ArrowUp, Bot, Copy, FileText, Sparkles, User } from "lucide-react";
import { useState } from "react";
export default function Chat({ messages, onSend, busy, selectedSource }) {
  const [input, setInput] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (input.trim() && !busy) {
      onSend(input.trim());
      setInput("");
    }
  };
  return (
    <section className="chat-panel">
      <div className="chat-header">
        <div>
          <p className="kicker">DOCUMENT Q&A</p>
          <h2>Ask your knowledge base</h2>
        </div>
        <span className="powered">
          <Sparkles size={13} /> Grounded answers
        </span>
      </div>
      <div className="messages">
        {!messages.length && (
          <div className="welcome">
            <div className="welcome-icon">
              <Sparkles size={23} />
            </div>
            <h3>Ask anything about your documents</h3>
            <p>
              KnowFlow retrieves the most relevant passages before answering, so
              every response stays connected to your source material.
            </p>
            <div className="suggestions">
              <button
                onClick={() =>
                  setInput("What are the key points in this document?")
                }
              >
                What are the key points?
              </button>
              <button
                onClick={() => setInput("Summarize the main recommendations.")}
              >
                Summarize recommendations
              </button>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            className={`message ${message.role}`}
            key={`${message.createdAt || index}-${index}`}
          >
            <span className="message-avatar">
              {message.role === "user" ? <User size={14} /> : <Bot size={15} />}
            </span>
            <div className="message-body">
              <div className="message-meta">
                {message.role === "user" ? "You" : "KnowFlow"}{" "}
                {message.mode && (
                  <em>
                    {message.mode === "demo"
                      ? "Local extract"
                      : "Provider response"}
                  </em>
                )}
              </div>
              <p>{message.content}</p>
              {message.sources?.length > 0 && (
                <div className="citations">
                  <strong>
                    <FileText size={13} /> Sources
                  </strong>
                  {message.sources.map((source) => (
                    <button
                      key={source.chunkId}
                      onClick={() => selectedSource(source)}
                    >
                      <span>{source.documentName}</span>
                      {source.page && <small>Page {source.page}</small>}
                    </button>
                  ))}
                </div>
              )}
              {message.role === "assistant" && (
                <button
                  className="copy-btn"
                  onClick={() =>
                    navigator.clipboard?.writeText(message.content)
                  }
                >
                  <Copy size={12} /> Copy
                </button>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="message assistant">
            <span className="message-avatar">
              <Bot size={15} />
            </span>
            <div className="typing">
              <i />
              <i />
              <i />
            </div>
          </div>
        )}
      </div>
      <form className="composer" onSubmit={submit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your documents..."
          aria-label="Ask a question"
        />
        <button disabled={!input.trim() || busy} aria-label="Send question">
          <ArrowUp size={17} />
        </button>
      </form>
      <p className="composer-note">
        KnowFlow can make mistakes. Check cited passages before relying on an
        answer.
      </p>
    </section>
  );
}
