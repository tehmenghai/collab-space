import { useNavigate, Link } from "react-router-dom";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

interface DocInfo {
  id: string;
  title: string | null;
  lastModified: string | null;
}

export function Home() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<DocInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  async function fetchDocs() {
    try {
      const res = await fetch(`${API_BASE}/api/docs`);
      if (res.ok) {
        const data: DocInfo[] = await res.json();
        data.sort(
          (a, b) =>
            new Date(b.lastModified || 0).getTime() -
            new Date(a.lastModified || 0).getTime()
        );
        setDocs(data);
      }
    } catch (err) {
      console.error("Failed to fetch docs:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateDoc = () => {
    const id = nanoid(12);
    navigate(`/doc/${id}`);
  };

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this document? This cannot be undone.")) return;

    setDeleting(docId);
    try {
      const res = await fetch(
        `${API_BASE}/api/docs/${encodeURIComponent(docId)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.id !== docId));
      }
    } catch (err) {
      console.error("Failed to delete doc:", err);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 40px" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "#1a1a2e",
            marginBottom: 8,
          }}
        >
          Collab Space
        </h1>
        <p
          style={{
            color: "#64748b",
            marginBottom: 32,
            fontSize: "1.1rem",
            lineHeight: 1.5,
          }}
        >
          Real-time collaborative documents. Create a doc and share the link.
        </p>

        <button
          onClick={handleCreateDoc}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid #2563eb",
            backgroundColor: "#2563eb",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 150ms ease, border-color 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1d4ed8";
            e.currentTarget.style.borderColor = "#1d4ed8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#2563eb";
            e.currentTarget.style.borderColor = "#2563eb";
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Document
        </button>

        {loading && (
          <div
            style={{
              marginTop: 48,
              color: "#667085",
              fontSize: "0.875rem",
            }}
          >
            Loading documents...
          </div>
        )}

        {!loading && docs.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                color: "#667085",
                marginBottom: 12,
              }}
            >
              Documents
            </h2>
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              {docs.map((doc, i) => (
                <Link
                  key={doc.id}
                  to={`/doc/${doc.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 16px",
                    textDecoration: "none",
                    color: "inherit",
                    borderBottom:
                      i < docs.length - 1
                        ? "1px solid #f2f4f7"
                        : "none",
                    transition: "background 150ms ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#667085"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0, marginRight: 12 }}
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#1a1a2e",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {doc.title || "Untitled"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#98a2b3",
                        marginTop: 2,
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                      }}
                    >
                      {doc.id}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#98a2b3",
                      whiteSpace: "nowrap",
                      marginLeft: 16,
                    }}
                  >
                    {formatDate(doc.lastModified)}
                  </div>
                  <button
                    onClick={(e) => handleDelete(doc.id, e)}
                    title="Delete document"
                    disabled={deleting === doc.id}
                    style={{
                      marginLeft: 12,
                      padding: 6,
                      border: "none",
                      background: "none",
                      cursor: deleting === doc.id ? "default" : "pointer",
                      borderRadius: 6,
                      color: "#98a2b3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 150ms ease, color 150ms ease",
                      opacity: deleting === doc.id ? 0.4 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (deleting !== doc.id) {
                        e.currentTarget.style.background = "#fef2f2";
                        e.currentTarget.style.color = "#dc2626";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.color = "#98a2b3";
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && docs.length === 0 && (
          <div
            style={{
              marginTop: 48,
              textAlign: "center",
              color: "#98a2b3",
              fontSize: "0.875rem",
            }}
          >
            No documents yet. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
