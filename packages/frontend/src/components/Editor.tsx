import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { BlockNoteSchema, locales } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import {
  withMultiColumn,
  multiColumnDropCursor,
  locales as multiColumnLocales,
  getMultiColumnSlashMenuItems,
} from "@blocknote/xl-multi-column";
import { SuggestionMenuController, getDefaultReactSlashMenuItems } from "@blocknote/react";
import * as Y from "yjs";
import type { WebsocketProvider } from "y-websocket";
import { useMemo } from "react";

const schema = withMultiColumn(BlockNoteSchema.create());

interface EditorProps {
  ydoc: Y.Doc;
  provider: WebsocketProvider;
}

export function Editor({ ydoc, provider }: EditorProps) {
  const editor = useCreateBlockNote({
    schema,
    dropCursor: multiColumnDropCursor,
    dictionary: {
      ...locales.en,
      multi_column: multiColumnLocales.en,
    } as any,
    uploadFile: async (file: File) => {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, imageUrl } = await res.json();
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      return imageUrl;
    },
    collaboration: {
      provider,
      fragment: ydoc.getXmlFragment("document"),
      user: {
        name: provider.awareness.getLocalState()?.user?.name ?? "Anonymous",
        color: provider.awareness.getLocalState()?.user?.color ?? "#888888",
      },
    },
  });

  const slashMenuItems = useMemo(() => {
    return async (query: string) =>
      [
        ...getDefaultReactSlashMenuItems(editor),
        ...getMultiColumnSlashMenuItems(editor),
      ].filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );
  }, [editor]);

  return (
    <>
      <style>{`
        .bn-editor [contenteditable] {
          user-select: text;
          -webkit-user-select: text;
        }
      `}</style>
      <BlockNoteView editor={editor} theme="light" slashMenu={false}>
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={slashMenuItems}
        />
      </BlockNoteView>
    </>
  );
}
