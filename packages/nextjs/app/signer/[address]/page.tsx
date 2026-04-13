"use client";

import { use } from "react";
import Link from "next/link";
import { isAddress } from "viem";
import { Entry, EntryRow } from "~~/components/guestbook/EntryRow";
import { SignerDisplay } from "~~/components/guestbook/SignerDisplay";
import { Win95Window } from "~~/components/guestbook/Win95Window";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

type Params = { address: string };

const SignerPage = ({ params }: { params: Promise<Params> }) => {
  const { address: raw } = use(params);
  const valid = typeof raw === "string" && isAddress(raw);
  const address = (valid ? (raw as `0x${string}`) : undefined) as `0x${string}` | undefined;

  const { data: indicesData } = useScaffoldReadContract({
    contractName: "GuestBook",
    functionName: "getEntriesBySigner",
    args: [address],
  });

  const indices = ((indicesData ?? []) as readonly bigint[]).map(i => Number(i));

  return (
    <div className="flex flex-col items-center px-4 py-6" style={{ flex: 1, alignSelf: "stretch" }}>
      <div style={{ width: "100%", maxWidth: 820 }}>
        <Win95Window title="👤 Signer Details">
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
              <h1 style={{ fontSize: 18, margin: "0 0 4px" }}>Entries by signer</h1>
              <div style={{ fontSize: 12 }}>
                {address ? <SignerDisplay address={address} asLink={false} /> : <span>Invalid address</span>}
              </div>
              {address ? (
                <div style={{ fontFamily: "Courier New, monospace", fontSize: 11, color: "#404040", marginTop: 2 }}>
                  {address}
                </div>
              ) : null}
            </div>
            <Link href="/" passHref className="win95-btn">
              ← Back to Guestbook
            </Link>
          </div>

          <fieldset className="win95-fieldset">
            <legend>
              {indices.length} {indices.length === 1 ? "entry" : "entries"}
            </legend>
            <div className="win95-inset" style={{ background: "#ffffff", minHeight: 160, padding: 0 }}>
              {!address ? (
                <div style={{ padding: 24, textAlign: "center", color: "#404040" }}>
                  The address in the URL is not valid.
                </div>
              ) : indices.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#404040" }}>
                  This address has not signed the guestbook.
                </div>
              ) : (
                <div>
                  {indices
                    .slice()
                    .reverse()
                    .map(i => (
                      <SignerEntry key={i} index={i} />
                    ))}
                </div>
              )}
            </div>
          </fieldset>
        </Win95Window>
      </div>
    </div>
  );
};

const SignerEntry = ({ index }: { index: number }) => {
  const { data } = useScaffoldReadContract({
    contractName: "GuestBook",
    functionName: "getEntry",
    args: [BigInt(index)],
  });

  if (!data) {
    return <div style={{ padding: 12, color: "#404040" }}>Loading entry #{index}…</div>;
  }

  const [signer, message, timestamp] = data as readonly [`0x${string}`, string, bigint];
  const entry: Entry = { signer, message, timestamp };
  return <EntryRow entry={entry} index={index} />;
};

export default SignerPage;
