"use client";

import { RelativeTime } from "./RelativeTime";
import { SignerDisplay } from "./SignerDisplay";

export type Entry = {
  signer: `0x${string}`;
  message: string;
  timestamp: bigint;
};

type Props = {
  entry: Entry;
  index: number;
  highlight?: boolean;
};

export const EntryRow = ({ entry, index, highlight }: Props) => {
  return (
    <div className={`win95-entry ${highlight ? "highlight" : ""}`}>
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span style={{ color: "#808080", fontSize: 11 }}>#{index}</span>
          <SignerDisplay address={entry.signer} />
          <span style={{ color: "#404040" }}>wrote:</span>
        </div>
        <RelativeTime timestamp={entry.timestamp} />
      </div>
      <p
        style={{
          margin: "6px 0 0",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          color: "#000",
          lineHeight: 1.45,
        }}
      >
        {entry.message}
      </p>
    </div>
  );
};
