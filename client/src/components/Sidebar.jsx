import {
  BookOpen,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
export default function Sidebar({
  documents,
  conversations,
  onUpload,
  onNewChat,
  onDeleteDocument,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span>
          <Sparkles size={17} />
        </span>
        KnowFlow <b>AI</b>
      </div>
      <p className="sidebar-label">WORKSPACE</p>
      <button className="new-chat" onClick={onNewChat}>
        <Plus size={16} />
        New conversation
      </button>
      <p className="sidebar-label">COLLECTIONS</p>
      <div className="collection">
        <BookOpen size={16} />
        <span>All documents</span>
        <small>{documents.length}</small>
      </div>
      <button className="upload-link" onClick={onUpload}>
        <FileText size={15} />
        Upload document
      </button>
      <p className="sidebar-label recent-label">RECENT CHATS</p>
      <div className="recent-chats">
        {conversations.slice(0, 5).map((chat) => (
          <button key={chat._id}>
            <MessageSquare size={14} />
            <span>{chat.title}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-foot">
        <div className="demo-pill">
          <span />
          Demo mode
        </div>
        <small>
          Answers use local lexical retrieval.
          <br />
          No API key required.
        </small>
      </div>
    </aside>
  );
}
