import { useState } from "react";
import { Link } from "react-router-dom";
import type { PresenceUser } from "../hooks/usePresence";
import { PresenceAvatars } from "./PresenceAvatars";

interface ToolbarProps {
  docId: string;
  users: PresenceUser[];
  title?: string;
}

export function Toolbar({ docId, users, title }: ToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayTitle =
    title != null && title !== "" ? title : `${docId.slice(0, 8)}...`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        height: 48,
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#fff",
        position: "sticky",
        top: 40,
        zIndex: 10,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
            color: "#1a1a2e",
            fontWeight: 700,
            fontSize: "0.9375rem",
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
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Collab Space
        </Link>
        <span style={{ color: "#d0d5dd", fontSize: 14 }}>/</span>
        <span
          style={{
            color: "#667085",
            fontSize: "0.8125rem",
            maxWidth: 200,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {displayTitle}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <PresenceAvatars users={users} />
        <button
          onClick={handleCopyLink}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            backgroundColor: copied ? "#16a34a" : "#fff",
            color: copied ? "#fff" : "#374151",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: 500,
            transition: "all 150ms ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#d0d5dd";
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "#d1d5db";
            }
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {copied ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </>
            )}
          </svg>
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
