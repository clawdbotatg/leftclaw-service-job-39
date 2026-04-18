"use client";

import { useCallback } from "react";

/**
 * Mobile wallet deep-link helper.
 *
 * RainbowKit v2 / WalletConnect v2 does NOT auto-deep-link back to the wallet app
 * after a write call — users sit on the dApp UI waiting while the TX sits in the
 * wallet app. Every onchain button must fire the TX first, then deep link the user
 * back to their wallet.
 *
 * Pattern:
 *   const { writeAndOpen } = useWriteAndOpen();
 *   await writeAndOpen(() => writeContractAsync({ ... }));
 */
export const useWriteAndOpen = () => {
  const openWallet = useCallback(() => {
    if (typeof window === "undefined") return;
    // Skip on desktop or when we're inside a wallet's in-app browser (window.ethereum present).
    if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (window as any).ethereum) return;

    // Detect the connected wallet from WalletConnect session or wagmi storage.
    let wcWallet = "";
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("wc@2:client") || key.startsWith("wagmi")) {
          const val = (localStorage.getItem(key) || "").toLowerCase();
          if (
            val.includes("metamask") ||
            val.includes("rainbow") ||
            val.includes("coinbase") ||
            val.includes("trust") ||
            val.includes("phantom") ||
            val.includes("walletconnect")
          ) {
            wcWallet = val;
            break;
          }
        }
      }
    } catch {
      // localStorage may be unavailable — fall through and do nothing.
    }

    const schemes: [string[], string][] = [
      [["metamask"], "https://metamask.app.link/"],
      [["coinbase", "cbwallet"], "https://go.cb-w.com/"],
      [["rainbow"], "https://rnbwapp.com/"],
      [["trust"], "https://link.trustwallet.com/"],
      [["phantom"], "https://phantom.app/ul/"],
    ];
    for (const [kws, scheme] of schemes) {
      if (kws.some(k => wcWallet.includes(k))) {
        window.location.href = scheme;
        return;
      }
    }
    // Fallback: assume MetaMask if we saw any WC session at all.
    if (wcWallet) window.location.href = "https://metamask.app.link/";
  }, []);

  // Fire the write call FIRST — this triggers gas estimation + WC relay.
  // Then after ~2 seconds, switch to the wallet app so the user lands on the signing screen.
  // 2s is the tested sweet spot: shorter and the wallet hasn't received the request yet.
  const writeAndOpen = useCallback(
    <T>(fn: () => Promise<T>): Promise<T> => {
      const p = fn();
      setTimeout(openWallet, 2000);
      return p;
    },
    [openWallet],
  );

  return { writeAndOpen, openWallet };
};
