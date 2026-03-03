import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

function parseMd(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => "<ul>" + m + "</ul>")
    .replace(/\n{2,}/g, "\n")
    .split("\n")
    .filter((l) => l.trim())
    .join("\n");
}

interface ChangelogModalProps {
  onClose: () => void;
}

export function ChangelogModal({ onClose }: ChangelogModalProps) {
  const [html, setHtml] = useState("<p>Loading...</p>");

  useEffect(() => {
    fetch(`${API_BASE}/api/changelog`)
      .then((r) => r.json())
      .then((d) => setHtml(parseMd(d.changelog)))
      .catch(() => setHtml("<p>Failed to load changelog.</p>"));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          maxWidth: 560,
          width: "90%",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid #e5e7eb",
            fontWeight: 600,
            fontSize: "0.95rem",
            color: "#1a1a2e",
          }}
        >
          Changelog
        </div>
        <div
          className="changelog-body"
          style={{
            padding: "1.25rem",
            overflowY: "auto",
            flex: 1,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div
          style={{
            padding: "0.75rem 1.25rem",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              background: "#fff",
              color: "#374151",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        .changelog-body h1 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.75rem; color: #1a1a2e; }
        .changelog-body h2 { font-size: 0.95rem; font-weight: 700; margin: 1rem 0 0.4rem; color: #1a1a2e; border-bottom: 1px solid #f2f4f7; padding-bottom: 0.3rem; }
        .changelog-body h3 { font-size: 0.8rem; font-weight: 600; margin: 0.6rem 0 0.25rem; color: #2563eb; }
        .changelog-body p { font-size: 0.8rem; color: #667085; margin-bottom: 0.4rem; line-height: 1.5; }
        .changelog-body ul { padding-left: 1.25rem; margin-bottom: 0.5rem; }
        .changelog-body li { font-size: 0.8rem; color: #667085; line-height: 1.6; }
        .changelog-body code { background: #f5f7fa; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.75rem; }
        .changelog-body a { color: #2563eb; text-decoration: none; }
        .changelog-body a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
