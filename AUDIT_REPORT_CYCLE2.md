# Audit Report — Cycle 2

## MUST FIX

- [ ] **[HIGH]** `targetNetworks` still points at local Foundry chain, not Base — `packages/nextjs/scaffold.config.ts:20` — `targetNetworks: [chains.foundry]` hard-codes chain 31337. The app is intended for Base (chainId 8453). As configured, every connected user will be shown a wrong-network state, `useScaffoldReadContract` cannot resolve `GuestBook` on Base, and writes silently fail. Change to `[chains.base]` before any production deployment. (Carry from Cycle 1 — requires manual change.)

- [ ] **[HIGH]** GuestBook not deployed to Base — `packages/nextjs/contracts/deployedContracts.ts` — Only the local Anvil deployment exists (chain 31337). No Base (8453) entry is present, so every scaffold-eth read/write hook fails on the production network. Run `yarn deploy --network base` with the funded deployer, commit the regenerated `deployedContracts.ts`, and verify the contract on Basescan. (Carry from Cycle 1 — requires build-worker / deployer action.)

## KNOWN ISSUES

- **[LOW]** SE-2 default Alchemy API key is hardcoded as a fallback — `packages/nextjs/scaffold.config.ts:16,29` — The shared SE-2 template key is in source as `DEFAULT_ALCHEMY_API_KEY`; `NEXT_PUBLIC_ALCHEMY_API_KEY` overrides it at runtime. Confirm this env var is set on the hosting platform before going live.

- **[LOW]** SE-2 default WalletConnect projectId is hardcoded as a fallback — `packages/nextjs/scaffold.config.ts:40` — Same rationale as above: `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` must be set on the deploy target; the in-source default is the public SE-2 template value. Known-issue comment present in source.

- **[LOW]** Bare `http()` fallback precedes Alchemy when using the default Alchemy key — `packages/nextjs/services/web3/wagmiConfig.tsx:21` — When `scaffoldConfig.alchemyApiKey === DEFAULT_ALCHEMY_API_KEY`, the transport array is built as `[http(), alchemyUrl]`, meaning the chain's default public RPC is tried first. With a production-specific `NEXT_PUBLIC_ALCHEMY_API_KEY`, Alchemy moves to position 0 and bare `http()` becomes a last-resort fallback. Acceptable to ship because the env override resolves the priority, but confirms that the env var is required for correct RPC routing.

- **[LOW]** `RelativeTime` initial render uses local-timezone absolute string — `packages/nextjs/components/guestbook/RelativeTime.tsx:28` — `formatAbsolute(ts)` calls `Date#getHours` / `Date#getMonth` which are timezone-dependent. On SSR the output may differ from the hydrated client, producing a React hydration warning. The `useEffect` swaps to relative time after mount; UX is unaffected. Known-issue comment present in source.

- **[INFO]** Signer page fires one `getEntry` RPC call per entry (N+1 reads) — `packages/nextjs/app/signer/[address]/page.tsx:88-102` — Each `<SignerEntry>` mounts a separate `useScaffoldReadContract` call for `getEntry`. For a signer with many entries this issues N parallel RPC calls and N independent loading states. No correctness issue; the contract's `getEntries` with the known indices would batch these into a single call, but the current approach is functionally correct.

- **[INFO]** `useScaffoldReadContract` called with potentially-undefined address on signer page — `packages/nextjs/app/signer/[address]/page.tsx:19-22` — When `isAddress(raw)` is false, `address` is `undefined` and the hook is still invoked (`args: [undefined]`). SE-2's hook returns no data in that case and the UI is gated on `!address`, so there is no correctness or security issue. Known-issue comment present in source.

- **[INFO]** No on-chain message length limit — `packages/foundry/contracts/GuestBook.sol:20-25` — The `sign()` function accepts any `string calldata`, including empty or very long strings. The frontend enforces a 500-character cap, but this is bypassable by calling the contract directly. Since there are no financial consequences and `calldata` cost naturally deters abuse, this is intentional hyperstructure behavior.

- **[INFO]** Unbounded arrays `_entries` and `_entryIndicesBySigner[signer]` grow forever — `packages/foundry/contracts/GuestBook.sol:13-15` — Intentional hyperstructure property documented in NatSpec. `getEntries` is paginated; `getEntriesBySigner` returns a per-signer `uint256[]` index list that an abusive signer could bloat at their own gas cost. The gas cliff for meaningful degradation is in the tens-of-millions-of-entries range. Accept.

- **[INFO]** Submit button uses text state-change instead of spinner component — `packages/nextjs/components/guestbook/SignDialog.tsx:115` — `{isPending ? "Signing…" : "OK"}` swaps the label rather than rendering an inline `<span className="loading loading-spinner loading-sm" />`. The QA framework prefers spinner elements inside buttons. Functional; no regression.

- **[INFO]** `GuestBook` has no privileged roles — `packages/foundry/script/Deploy.s.sol:17-19` — The contract is a no-owner hyperstructure by design. The client address `0x34aA3F359A9D614239015126635CE7732c18fDF3` owning "all privileged roles" is vacuously satisfied. No action required. Known-issue comment present in deploy script.

- **[INFO]** Win95 theme uses hardcoded `#008080` body background — `packages/nextjs/styles/globals.css` — Violates the QA framework's "no hardcoded dark backgrounds" guidance, but is the explicitly requested Windows-95 aesthetic. The DaisyUI `light` theme is remapped to the Win95 palette via CSS variables; this is intentional and in scope.

- **[INFO]** No USD/token value pairing — N/A — The QA framework requires pairing ETH amounts with approximate USD values, but this dApp contains no financial values; gas is handled by the user's wallet. Not applicable.

## Summary
- Must Fix: 2 items (both carry-overs from Cycle 1 requiring manual deploy/config action before production)
- Known Issues: 11 items
- Audit frameworks followed: contract audit (ethskills), QA audit (ethskills)
