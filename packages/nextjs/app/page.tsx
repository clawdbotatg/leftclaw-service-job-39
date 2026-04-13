"use client";

import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import { EntryList } from "~~/components/guestbook/EntryList";
import { SignDialog } from "~~/components/guestbook/SignDialog";
import { Win95Window } from "~~/components/guestbook/Win95Window";
import { useScaffoldReadContract, useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);

  const { data: totalBig, refetch: refetchCount } = useScaffoldReadContract({
    contractName: "GuestBook",
    functionName: "getEntryCount",
  });
  const total = totalBig ? Number(totalBig) : 0;

  const onSigned = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  // Watch for new Signed events (from anyone) to keep the list live.
  useScaffoldWatchContractEvent({
    contractName: "GuestBook",
    eventName: "Signed",
    onLogs: logs => {
      if (logs.length === 0) return;
      const last = logs[logs.length - 1];
      const index = last.args?.index;
      if (typeof index === "bigint") {
        setHighlightIndex(Number(index));
      }
      setRefreshKey(k => k + 1);
      refetchCount();
    },
  });

  // Clear the highlight after a few seconds.
  useEffect(() => {
    if (highlightIndex == null) return;
    const id = setTimeout(() => setHighlightIndex(null), 4000);
    return () => clearTimeout(id);
  }, [highlightIndex]);

  return (
    <div className="flex flex-col items-center px-4 py-6" style={{ flex: 1, alignSelf: "stretch" }}>
      <div style={{ width: "100%", maxWidth: 820 }}>
        <Win95Window title="📖 Onchain Guestbook — [Read Only]">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <h1 style={{ fontSize: 18, margin: "0 0 2px" }}>The Onchain Guestbook</h1>
              <div style={{ fontSize: 12, color: "#202020" }}>
                <span className="win95-badge">{total.toLocaleString()}</span>{" "}
                {total === 1 ? "person has" : "people have"} signed. Add yours — it lives forever.
              </div>
            </div>
            <button className="win95-btn" onClick={() => setOpen(true)} style={{ fontWeight: 700 }}>
              ✎ Sign the Guestbook
            </button>
          </div>

          <fieldset className="win95-fieldset">
            <legend>Entries</legend>
            <EntryList refreshKey={refreshKey} highlightIndex={highlightIndex} />
          </fieldset>

          <div className="win95-statusbar" style={{ marginTop: 10, padding: 0 }}>
            <div className="win95-status-field">Tip: click any signer to see every message they&apos;ve left.</div>
            <div className="win95-status-field" style={{ flex: 0, minWidth: 140, textAlign: "right" }}>
              {total.toLocaleString()} total
            </div>
          </div>
        </Win95Window>
      </div>

      {open ? <SignDialog onClose={() => setOpen(false)} onSigned={onSigned} /> : null}
    </div>
  );
};

export default Home;
