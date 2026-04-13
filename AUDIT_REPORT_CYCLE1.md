# Audit Report — Cycle 1

## MUST FIX

- [ ] **[HIGH]** Frontend `targetNetworks` points at local Foundry, not Base — `packages/nextjs/scaffold.config.ts:20-22` — `targetNetworks: [chains.foundry]` hard-codes chain 31337. The build plan ships on Base (chainId 8453). As configured, the deployed frontend will render the `WrongNetworkDropdown` forever: `enabledChains` will contain only `foundry` + `mainnet` (via `wagmiConfig.tsx:12-14`), so there is no connector path a user can take to reach Base, `useScaffoldReadContract` cannot resolve `GuestBook` on Base, and writes will silently fail. Replace with `chains.base` (and add a Base entry to `packages/nextjs/contracts/deployedContracts.ts` once deployed).

- [ ] **[HIGH]** GuestBook contract has not been deployed to Base — `packages/foundry/deployments/31337.json`, `packages/nextjs/contracts/deployedContracts.ts` — Only the local Anvil deployment is recorded (chain 31337, `0x5FbD…0aa3`). No Base (8453) entry exists in `deployedContracts.ts`, so on production the scaffold-eth hooks will fail to resolve `GuestBook` and every read/write path dies. Run `yarn deploy --network base` with the deployer funded, then commit the regenerated `deployedContracts.ts` and verify on Basescan (per QA framework's "contract verification is non-negotiable" rule).

- [ ] **[HIGH]** Sign dialog does not expose a network-switch affordance in the action slot — `packages/nextjs/components/guestbook/SignDialog.tsx:70-109` — When a user is connected but on the wrong chain, the dialog shows only the "OK" button, which attempts `writeContractAsync` and errors out. The QA framework explicitly requires a network-switch button in the action slot itself (not only in the header). Add a chain check (`useAccount().chain?.id !== targetNetwork.id`) and render a "Switch Network" button instead of "OK" in that state, mirroring the `WrongNetworkDropdown` pattern.

## KNOWN ISSUES

- **[LOW]** SE-2 default Alchemy API key is baked into source as a fallback — `packages/nextjs/scaffold.config.ts:16,29` — The hard-coded `DEFAULT_ALCHEMY_API_KEY` [REDACTED] is the shared public SE-2 template key; production should set `NEXT_PUBLIC_ALCHEMY_API_KEY` on Vercel. Acceptable to ship because the env override takes precedence, but confirm the env var is set on the hosting platform (per QA framework).

- **[LOW]** SE-2 default WalletConnect projectId is baked into source as a fallback — `packages/nextjs/scaffold.config.ts:40` — Same rationale as above: template default [REDACTED] is in the source; `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` overrides at runtime. Verify the env var is configured on the deploy target.

- **[LOW]** `RelativeTime` initial render uses local-timezone absolute string — `packages/nextjs/components/guestbook/RelativeTime.tsx:28` — `formatAbsolute(ts)` uses `Date#getHours/getMonth` etc. which depend on the runtime timezone. On SSR vs. hydrate this can produce a React hydration mismatch warning. The component swaps to relative time after the `useEffect` fires, so UX is unaffected; ship-acceptable.

- **[INFO]** `useScaffoldReadContract` on signer page is called with a potentially-undefined `address` arg — `packages/nextjs/app/signer/[address]/page.tsx:18-22` — When `isAddress(raw)` is false, `address` is `undefined` and the hook is still invoked (`args: [undefined]`). SE-2's hook returns no data in that case and the UI is gated on `!address` anyway, but the call is wasted. Not a correctness issue.

- **[INFO]** Unbounded arrays `_entries` and `_entryIndicesBySigner[signer]` grow forever — `packages/foundry/contracts/GuestBook.sol:13-14` — Documented in the plan as an intentional hyperstructure property. `getEntries` is paginated; `getEntriesBySigner` returns the full per-signer index list, which an abusive signer could bloat. Because callers pay for their own storage and the return is only a `uint256[]` of indices (not the full entries), the gas cliff is pushed into the tens-of-millions of signatures range. Accept.

- **[INFO]** Global hardcoded teal background color — `packages/nextjs/styles/globals.css:84` — `background: #008080` on `body` violates the QA framework's "no hardcoded dark backgrounds, use DaisyUI semantic classes" rule, but it is the requested Windows-95 theme (client message: "make this windows 95 themed please!"). The DaisyUI `light` theme is also remapped to the Win95 palette, so this is intentional and in scope.

- **[INFO]** No on-page USD / token-value pairing — N/A — QA framework normally requires pairing ETH amounts with USD, but this dApp has no financial values; only gas cost at send time (handled by the wallet). Not applicable.

- **[INFO]** `Deploy.s.sol` performs no role transfer to the client address — `packages/foundry/script/Deploy.s.sol:17-19` — `GuestBook` has no `owner`/`admin`/`treasury` by design. The script's comment is explicit. Client address `0x34aA…DF33` owning "all privileged roles" is vacuously satisfied because the contract has zero privileged roles. No action required.

- **[INFO]** `.env` present under `packages/foundry/.env` and correctly gitignored — variables referenced by name only (`DEPLOYER_PRIVATE_KEY`, `ALCHEMY_API_KEY`, `ETHERSCAN_API_KEY`) in `foundry.toml`. No secrets are inlined in tracked source files. Contents intentionally not read during this audit.

## Summary
- Must Fix: 3 items
- Known Issues: 8 items
- Audit frameworks followed: contract audit (ethskills), QA audit (ethskills)
