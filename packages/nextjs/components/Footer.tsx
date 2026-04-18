"use client";

import React, { useEffect, useState } from "react";
import { Address } from "@scaffold-ui/components";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth/useDeployedContractInfo";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

const pad2 = (n: number) => n.toString().padStart(2, "0");

/**
 * Windows 95 style status bar / taskbar footer with live clock.
 */
export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const { data: guestBook } = useDeployedContractInfo({ contractName: "GuestBook" });
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
      <div className="win95-status-field" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span>GuestBook:</span>
        {guestBook?.address ? (
          <Address address={guestBook.address} onlyEnsOrAddress />
        ) : (
          <span style={{ opacity: 0.6 }}>not deployed</span>
        )}
      </div>
      <div className="win95-status-field" style={{ flex: 0, minWidth: 90, textAlign: "center" }}>
        {timeLabel}
      </div>
    </div>
  );
};
