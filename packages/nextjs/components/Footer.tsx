"use client";

import React, { useEffect, useState } from "react";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

const pad2 = (n: number) => n.toString().padStart(2, "0");

/**
 * Windows 95 style status bar / taskbar footer with live clock.
 */
export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  const timeLabel = now
    ? `${pad2(((now.getHours() + 11) % 12) + 1)}:${pad2(now.getMinutes())} ${now.getHours() < 12 ? "AM" : "PM"}`
    : "--:-- --";

  return (
    <div className="win95-taskbar" style={{ borderTop: "2px solid #ffffff", marginTop: 0 }}>
      <div className="win95-status-field" style={{ flex: 0, minWidth: 160 }}>
        <span>Network: </span>
        <strong>{targetNetwork.name}</strong>
      </div>
      <div className="win95-status-field">Onchain Guestbook — C:\\GUESTBOOK\\INDEX.HTM</div>
      <div className="win95-status-field" style={{ flex: 0, minWidth: 90, textAlign: "center" }}>
        {timeLabel}
      </div>
    </div>
  );
};
