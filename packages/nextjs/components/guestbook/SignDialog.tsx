"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

type Props = {
  onClose: () => void;
  onSigned: () => void;
};

const MAX_CHARS = 500;

export const SignDialog = ({ onClose, onSigned }: Props) => {
  const { address } = useAccount();
  const [message, setMessage] = useState("");
  const { writeContractAsync, isPending } = useScaffoldWriteContract({ contractName: "GuestBook" });

  const trimmed = message.trim();
  const disabled = !trimmed || isPending;

  const submit = async () => {
    if (!trimmed) return;
    try {
      await writeContractAsync({ functionName: "sign", args: [trimmed] });
      notification.success("Your message was signed onto the chain.");
      setMessage("");
      onSigned();
      onClose();
    } catch (e) {
      // error is already surfaced by SE-2 transactor
      console.error(e);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
    >
      <div className="win95-window" style={{ width: "100%", maxWidth: 520 }}>
        <div className="win95-titlebar">
          <span>📝 Sign the Guestbook</span>
          <div className="win95-title-controls">
            <button className="win95-title-btn" aria-label="Close" onClick={onClose} style={{ fontWeight: 700 }}>
              ×
            </button>
          </div>
        </div>
        <div className="win95-body">
          {!address ? (
            <div className="win95-inset-gray" style={{ padding: 12, textAlign: "center" }}>
              <p style={{ marginTop: 0 }}>Connect your wallet to sign the guestbook.</p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <RainbowKitCustomConnectButton />
              </div>
            </div>
          ) : (
            <>
              <label htmlFor="gb-message" style={{ display: "block", marginBottom: 6 }}>
                Your message:
              </label>
              <textarea
                id="gb-message"
                className="win95-textarea"
                placeholder="Leave a permanent message on the chain…"
                maxLength={MAX_CHARS}
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                autoFocus
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "#404040",
                  marginTop: 4,
                }}
              >
                <span>Permanent. No edits. No deletes.</span>
                <span>
                  {message.length} / {MAX_CHARS}
                </span>
              </div>
            </>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 14 }}>
            <button className="win95-btn" onClick={onClose} disabled={isPending}>
              Cancel
            </button>
            <button className="win95-btn" onClick={submit} disabled={!address || disabled}>
              {isPending ? "Signing…" : "OK"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
