import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import * as Y from "yjs";
import type { WebsocketProvider } from "y-websocket";

interface EditorProps {
  ydoc: Y.Doc;
  provider: WebsocketProvider;
}

export function Editor({ ydoc, provider }: EditorProps) {
  const editor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: ydoc.getXmlFragment("document"),
      user: {
        name: provider.awareness.getLocalState()?.user?.name ?? "Anonymous",
        color: provider.awareness.getLocalState()?.user?.color ?? "#888888",
      },
    },
  });

  return <BlockNoteView editor={editor} theme="light" />;
}
