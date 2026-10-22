import { useEffect, useRef, useState } from "react";
import { AlertCircle, Menu, PanelRightClose, Search, X } from "lucide-react";
import Sidebar from "./components/Sidebar";
import DocumentPanel from "./components/DocumentPanel";
import Chat from "./components/Chat";
import { api, loadWorkspace, sendQuestion } from "./services/api";
import "./styles/app.css";
export default function App() {
  const [documents, setDocuments] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState();
  const [mobile, setMobile] = useState(false);
  const inputRef = useRef();
  useEffect(() => {
    loadWorkspace()
      .then(([docs, chats]) => {
        setDocuments(docs.data);
        setConversations(chats.data);
      })
      .catch((e) => setError(e.message));
  }, []);
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const result = await api("/documents", { method: "POST", body: form });
      setDocuments((docs) => [result.data, ...docs]);
    } catch (err) {
      setError(err.message);
    }
    e.target.value = "";
  };
  const ask = async (question) => {
    setMessages((m) => [
      ...m,
      { role: "user", content: question, createdAt: Date.now() },
    ]);
    setBusy(true);
    try {
      const result = await sendQuestion(question, conversationId);
      setConversationId(result.data.conversationId);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: result.data.answer,
          sources: result.data.sources,
          mode: result.data.mode,
          createdAt: Date.now(),
        },
      ]);
      const chats = await api("/conversations");
      setConversations(chats.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const deleteDoc = async (id) => {
    try {
      await api(`/documents/${id}`, { method: "DELETE" });
      setDocuments((docs) => docs.filter((doc) => doc._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div className="app">
      <Sidebar
        documents={documents}
        conversations={conversations}
        onUpload={() => inputRef.current?.click()}
        onNewChat={() => {
          setMessages([]);
          setConversationId(undefined);
        }}
        onDeleteDocument={deleteDoc}
      />
      <main>
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobile(!mobile)}>
            <Menu />
          </button>
          <div className="top-title">
            <span className="crumb">WORKSPACE /</span>
            <h1>Document workspace</h1>
          </div>
          <div className="top-tools">
            <span className="mode-dot" />
            Demo mode{" "}
            <button className="top-icon">
              <Search size={17} />
            </button>
            <button className="top-icon" onClick={() => setSource(undefined)}>
              <PanelRightClose size={17} />
            </button>
          </div>
        </header>
        {mobile && (
          <div className="mobile-sidebar">
            <button onClick={() => setMobile(false)}>
              <X />
            </button>
            <Sidebar
              documents={documents}
              conversations={conversations}
              onUpload={() => inputRef.current?.click()}
              onNewChat={() => setMessages([])}
              onDeleteDocument={deleteDoc}
            />
          </div>
        )}
        {error && (
          <div className="error-bar">
            <AlertCircle size={16} />
            {error}
            <button onClick={() => setError("")}>
              <X size={14} />
            </button>
          </div>
        )}
        <div className="workspace">
          <DocumentPanel
            documents={documents}
            inputRef={inputRef}
            onUpload={upload}
            onDelete={deleteDoc}
          />
          <Chat
            messages={messages}
            onSend={ask}
            busy={busy}
            selectedSource={setSource}
          />
          {source && (
            <aside className="source-drawer">
              <div className="drawer-header">
                <div>
                  <p className="kicker">SOURCE PASSAGE</p>
                  <strong>{source.documentName}</strong>
                </div>
                <button onClick={() => setSource(undefined)}>
                  <X size={17} />
                </button>
              </div>
              {source.page && (
                <span className="page-label">Page {source.page}</span>
              )}
              <blockquote>{source.passage}</blockquote>
              <small>
                This passage was retrieved from your uploaded document and
                included as evidence for the answer.
              </small>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
