"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  width?: string | number;
};

export const Win95Window = ({ title, icon, children, className = "", width }: Props) => {
  return (
    <div className={`win95-window ${className}`} style={width ? { maxWidth: width, width: "100%" } : undefined}>
      <div className="win95-titlebar">
        <div className="flex items-center gap-1 truncate">
          {icon}
          <span className="truncate">{title}</span>
        </div>
        <div className="win95-title-controls">
          <div className="win95-title-btn" aria-hidden>
            _
          </div>
          <div className="win95-title-btn" aria-hidden>
            ▢
          </div>
          <div className="win95-title-btn" aria-hidden>
            ×
          </div>
        </div>
      </div>
      <div className="win95-body">{children}</div>
    </div>
  );
};
