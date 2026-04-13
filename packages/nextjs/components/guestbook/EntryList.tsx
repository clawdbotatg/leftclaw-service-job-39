"use client";

import { useEffect, useMemo, useState } from "react";
import { Entry, EntryRow } from "./EntryRow";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const PAGE = 20;

type Props = {
  refreshKey: number;
  highlightIndex?: number | null;
};

/** Renders newest-first, paginating backwards from the tail of the array. */
export const EntryList = ({ refreshKey, highlightIndex }: Props) => {
  const { data: totalBig, refetch: refetchCount } = useScaffoldReadContract({
    contractName: "GuestBook",
    functionName: "getEntryCount",
  });

  const total = totalBig ? Number(totalBig) : 0;

  const [windowEnd, setWindowEnd] = useState<number | null>(null);

  // When count changes or refreshKey flips, reset the window to the top (newest).
  useEffect(() => {
    setWindowEnd(total);
  }, [total, refreshKey]);

  useEffect(() => {
    refetchCount();
  }, [refreshKey, refetchCount]);

  // Load entries from [start, end) where end = windowEnd (exclusive) and start = max(0, end - loadedCount)
  const [loadedCount, setLoadedCount] = useState(PAGE);

  useEffect(() => {
    setLoadedCount(PAGE);
  }, [refreshKey]);

  const start = useMemo(() => {
    if (windowEnd == null) return 0;
    return Math.max(0, windowEnd - loadedCount);
  }, [windowEnd, loadedCount]);

  const count = useMemo(() => {
    if (windowEnd == null) return 0;
    return windowEnd - start;
  }, [windowEnd, start]);

  const { data: entriesData, isLoading } = useScaffoldReadContract({
    contractName: "GuestBook",
    functionName: "getEntries",
    args: [BigInt(start), BigInt(count)],
  });

  const entries = (entriesData ?? []) as Entry[];
  // Newest first
  const reversed = useMemo(() => {
    if (!entries.length) return [] as { entry: Entry; originalIndex: number }[];
    return entries
      .map((entry, i) => ({ entry, originalIndex: start + i }))
      .slice()
      .reverse();
  }, [entries, start]);

  const canLoadMore = start > 0;

  return (
    <div>
      <div className="win95-inset" style={{ background: "#ffffff", minHeight: 200, padding: 0 }}>
        {total === 0 && !isLoading ? (
          <div style={{ padding: 24, textAlign: "center", color: "#404040" }}>
            No entries yet. Be the first to sign.
          </div>
        ) : null}

        {reversed.map(({ entry, originalIndex }) => (
          <EntryRow
            key={originalIndex}
            index={originalIndex}
            entry={entry}
            highlight={highlightIndex === originalIndex}
          />
        ))}

        {isLoading && total > 0 && reversed.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#404040" }}>Loading entries…</div>
        ) : null}
      </div>

      {canLoadMore ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <button className="win95-btn" onClick={() => setLoadedCount(c => c + PAGE)} disabled={isLoading}>
            {isLoading ? "Loading…" : "Load More"}
          </button>
        </div>
      ) : null}
    </div>
  );
};
