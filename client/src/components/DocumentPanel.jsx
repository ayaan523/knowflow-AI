import {
  CheckCircle2,
  FileText,
  LoaderCircle,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";
export default function DocumentPanel({
  documents,
  inputRef,
  onUpload,
  onDelete,
}) {
  return (
    <section className="doc-panel">
      <div className="section-title">
        <div>
          <p className="kicker">YOUR KNOWLEDGE BASE</p>
          <h2>Documents</h2>
        </div>
        <button
          className="outline-btn"
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud size={15} /> Add document
        </button>
      </div>
      <input
        ref={inputRef}
        hidden
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        onChange={onUpload}
      />
      <div className="dropzone" onClick={() => inputRef.current?.click()}>
        <UploadCloud size={24} />
        <strong>
          Drop files here or <u>browse</u>
        </strong>
        <span>PDF or TXT · up to 10 MB</span>
      </div>
      <div className="documents">
        {documents.map((doc) => (
          <div className="document" key={doc._id}>
            <span className="file-icon">
              <FileText size={17} />
            </span>
            <div className="document-info">
              <strong>{doc.name}</strong>
              <small>
                {formatBytes(doc.size)}{" "}
                {doc.pageCount ? `· ${doc.pageCount} pages` : ""}
              </small>
            </div>
            <span className={`doc-status ${doc.status}`}>
              {doc.status === "ready" ? (
                <CheckCircle2 size={14} />
              ) : doc.status === "processing" ? (
                <LoaderCircle className="spin" size={14} />
              ) : (
                <XCircle size={14} />
              )}{" "}
              {doc.status}
            </span>
            <button
              className="icon-btn"
              onClick={() => onDelete(doc._id)}
              aria-label={`Delete ${doc.name}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      {!documents.length && (
        <div className="empty-docs">
          <FileText size={25} />
          <strong>Your knowledge base is empty</strong>
          <span>Upload a document to start asking questions.</span>
        </div>
      )}
    </section>
  );
}
function formatBytes(bytes = 0) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
