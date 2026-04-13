import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center" style={{ flex: 1, padding: 24, minHeight: "60vh" }}>
      <div className="win95-window" style={{ width: "100%", maxWidth: 420 }}>
        <div className="win95-titlebar">
          <span>⚠ Guestbook Error</span>
        </div>
        <div className="win95-body" style={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div
              style={{
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                color: "#ffff00",
                background: "#000080",
                flexShrink: 0,
              }}
            >
              !
            </div>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 14 }}>404 — Page Not Found</h2>
              <p style={{ margin: 0, fontSize: 12 }}>The page you&apos;re looking for does not exist on this server.</p>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Link href="/" className="win95-btn">
              OK
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
