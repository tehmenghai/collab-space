import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { getRandomColor } from "./colors";
import { getRandomName } from "./names";

const WS_URL =
  import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws`;

const USER_KEY = "collab-space-user";

interface UserInfo {
  name: string;
  color: string;
}

function getOrCreateUser(): UserInfo {
  const stored = localStorage.getItem(USER_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  const user: UserInfo = {
    name: getRandomName(),
    color: getRandomColor(),
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function createYjsProvider(docId: string) {
  const ydoc = new Y.Doc();
  const provider = new WebsocketProvider(WS_URL, docId, ydoc);

  const user = getOrCreateUser();
  provider.awareness.setLocalStateField("user", user);

  return { ydoc, provider, user };
}
