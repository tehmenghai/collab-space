import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useYjsProvider } from "../hooks/useYjsProvider";
import { usePresence } from "../hooks/usePresence";
import { Editor } from "../components/Editor";
import { Toolbar } from "../components/Toolbar";

export function Document() {
  const { id } = useParams<{ id: string }>();
  const yjsState = useYjsProvider(id!);
  const users = usePresence(yjsState?.provider ?? null);
  const [title, setTitle] = useState("Untitled");

  useEffect(() => {
    if (!yjsState) return;
    const meta = yjsState.ydoc.getMap("meta");

    const updateTitle = () => {
      const t = meta.get("title") as string | undefined;
      setTitle(t ?? "Untitled");
    };

    updateTitle();
    meta.observe(updateTitle);
    return () => {
      meta.unobserve(updateTitle);
    };
  }, [yjsState]);

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      if (!yjsState) return;
      const meta = yjsState.ydoc.getMap("meta");
      meta.set("title", newTitle);
    },
    [yjsState]
  );

  if (!yjsState) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#98a2b3",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        Connecting...
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f7fa",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Toolbar docId={id!} users={users} title={title} />
      <div
        style={{
          padding: "10px 20px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#fff",
        }}
      >
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#1a1a2e",
            padding: "4px 0",
            fontFamily: "inherit",
          }}
        />
      </div>
      <div style={{ flex: 1, overflow: "auto", background: "#fff" }}>
        <Editor ydoc={yjsState.ydoc} provider={yjsState.provider} />
      </div>
    </div>
  );
}
