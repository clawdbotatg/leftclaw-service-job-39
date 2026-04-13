"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

/**
 * Windows 95 styled taskbar-header.
 */
export const Header = () => {
  const pathname = usePathname();

  return (
    <div className="win95-taskbar sticky top-0 z-20 shadow-md">
      <Link
        href="/"
        passHref
        className="win95-btn"
        style={{ gap: 6, minWidth: 0, padding: "2px 8px", fontWeight: 700 }}
      >
        <span aria-hidden className="inline-block" style={{ width: 16, height: 16 }}>
          <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
            <rect x="1" y="1" width="6" height="6" fill="#ff0000" />
            <rect x="9" y="1" width="6" height="6" fill="#00a800" />
            <rect x="1" y="9" width="6" height="6" fill="#0000ff" />
            <rect x="9" y="9" width="6" height="6" fill="#ffff00" />
          </svg>
        </span>
        <span>Start</span>
      </Link>
      <div
        style={{
          width: 2,
          alignSelf: "stretch",
          background: "#808080",
          boxShadow: "1px 0 0 #ffffff",
          margin: "2px 4px",
        }}
      />
      <Link
        href="/"
        passHref
        className="win95-btn"
        style={{
          minWidth: 0,
          padding: "2px 10px",
          fontWeight: pathname === "/" ? 700 : 400,
        }}
      >
        Guestbook
      </Link>
      <div className="ml-auto flex items-center gap-2 pr-1">
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
