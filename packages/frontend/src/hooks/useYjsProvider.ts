import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { createYjsProvider } from "../lib/yjs";

interface YjsState {
  ydoc: Y.Doc;
  provider: WebsocketProvider;
}

export function useYjsProvider(docId: string): YjsState | null {
  const [state, setState] = useState<YjsState | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const docRef = useRef<Y.Doc | null>(null);

  useEffect(() => {
    const { ydoc, provider } = createYjsProvider(docId);
    providerRef.current = provider;
    docRef.current = ydoc;
    setState({ ydoc, provider });

    return () => {
      provider.destroy();
      ydoc.destroy();
      providerRef.current = null;
      docRef.current = null;
      setState(null);
    };
  }, [docId]);

  return state;
}
