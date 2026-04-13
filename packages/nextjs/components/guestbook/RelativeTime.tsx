"use client";

import { useEffect, useState } from "react";

type Props = {
  timestamp: bigint | number;
};

function formatRelative(ts: number) {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - ts);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

function formatAbsolute(ts: number) {
  const d = new Date(ts * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const RelativeTime = ({ timestamp }: Props) => {
  const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  const [label, setLabel] = useState(formatAbsolute(ts));

  useEffect(() => {
    const update = () => setLabel(formatRelative(ts));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [ts]);

  return (
    <span title={formatAbsolute(ts)} style={{ color: "#404040", fontSize: 11 }}>
      {label}
    </span>
  );
};
