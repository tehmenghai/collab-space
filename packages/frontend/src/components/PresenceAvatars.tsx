import type { PresenceUser } from "../hooks/usePresence";

interface PresenceAvatarsProps {
  users: PresenceUser[];
}

export function PresenceAvatars({ users }: PresenceAvatarsProps) {
  if (users.length === 0) return null;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", marginRight: 8 }}>
        {users.slice(0, 5).map((user, i) => (
          <div
            key={user.clientId}
            title={user.name}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: user.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "0.6875rem",
              fontWeight: 600,
              border: "2px solid #fff",
              marginLeft: i > 0 ? -6 : 0,
              zIndex: users.length - i,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
      <span style={{ fontSize: "0.75rem", color: "#667085" }}>
        {users.length} online
      </span>
    </div>
  );
}
