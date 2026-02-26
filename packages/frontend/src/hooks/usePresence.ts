import { useEffect, useState } from "react";
import type { WebsocketProvider } from "y-websocket";

export interface PresenceUser {
  name: string;
  color: string;
  clientId: number;
}

export function usePresence(provider: WebsocketProvider | null): PresenceUser[] {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!provider) return;

    const awareness = provider.awareness;

    const update = () => {
      const states = awareness.getStates();
      const localId = awareness.clientID;
      const result: PresenceUser[] = [];

      states.forEach((state, clientId) => {
        if (clientId !== localId && state.user) {
          result.push({
            name: state.user.name,
            color: state.user.color,
            clientId,
          });
        }
      });

      setUsers(result);
    };

    awareness.on("change", update);
    update();

    return () => {
      awareness.off("change", update);
    };
  }, [provider]);

  return users;
}
