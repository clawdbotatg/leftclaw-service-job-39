# Stage 7 — Frontend QA Audit (Read-Only)

- **Job:** #39 — Onchain Guestbook (Windows 95 themed)
- **Repo:** https://github.com/clawdbotatg/leftclaw-service-job-39
- **Contract:** GuestBook @ `0x118a4335ce160fe1b616368ee6685af25224f4dd` (Base mainnet, chain 8453)
- **Owner (set from constructor to job.client):** `0x34aA3F359A9D614239015126635CE7732c18fDF3`
- **Auditor:** clawdbotatg
- **Mode:** read-only — no file modifications performed

## Summary verdict

**BLOCKERS REMAIN — NOT ready for Stage 8.**

Three ship-blockers fail:
1. `targetNetworks` is `[chains.foundry]` — frontend can never talk to the deployed Base contract (confirmed outstanding from Audit Cycle 2).
2. Contract is **not verified** on Basescan (Basescan reports "Contract: Unverified").
3. SE2 README is still in place (`README.md` is the stock Scaffold-ETH 2 template text).

Several should-fix items also fail (see below), but the above three fully block production.

`packages/nextjs/out/` does not exist — no production build has been run in the current working tree, so this audit is necessarily source-only. That's acceptable for Stage 7 (the source is the source of truth), but note it when checking "build output" items.

---

## Ship-Blocker Checklist

### 1. Wallet connect shows a BUTTON, not text — **PASS**
- `packages/nextjs/components/Header.tsx:54` renders `<RainbowKitCustomConnectButton />` in the header's right slot.
- `packages/nextjs/components/guestbook/SignDialog.tsx:66–72` — when not connected inside the Sign dialog, it renders `<RainbowKitCustomConnectButton />` inside a styled panel (there is a helper sentence above it, but the button is the obvious primary UI element, not a bare `<p>Please connect</p>`).

### 2. Wrong-network shows a Switch button in the primary CTA slot — **PASS**
- `packages/nextjs/components/guestbook/SignDialog.tsx:109–112`: if `isWrongNetwork`, the submit button slot renders a `Switch to {targetNetwork.name}` button wired to `switchChain?.({ chainId: targetNetwork.id })`. The sign "OK" button is branched away by a ternary, so only one of the two is on screen at a time.
- `isWrongNetwork` computed at `SignDialog.tsx:23` as `address !== undefined && chain?.id !== targetNetwork.id` — this is the right check.

### 3. `targetNetworks` set to `[chains.base]` — **FAIL** (known)
- `packages/nextjs/scaffold.config.ts:19` — `targetNetworks: [chains.foundry]`.
- Impact: the UI treats Base mainnet as "wrong network", `useScaffoldReadContract`/`useScaffoldWriteContract` will look up the `GuestBook` contract under chain id `31337` (foundry) and not find it (the real entry is under `8453` in `deployedContracts.ts:8`). The app will silently have no data and cannot submit signatures.
- Fix: `targetNetworks: [chains.base]`.

### 4. Approve flow traced end-to-end — **N/A**
- Guestbook has no token / no `approve()` path. The only write is `sign(string)` on the GuestBook contract (`SignDialog.tsx:30`). The button uses `useScaffoldWriteContract` which waits for block confirmation via the internal `useTransactor` (`hooks/scaffold-eth/useScaffoldWriteContract.ts:78,138`; `hooks/scaffold-eth/useTransactor.tsx:78–81` — `publicClient.waitForTransactionReceipt`). No double-submit window.
- Note: `SignDialog.tsx:25` disables the button via `!trimmed || isPending`; `isPending` comes from the scaffold hook's `isMining` (via `useScaffoldWriteContract`), which is set true before the write and only cleared in `finally {}` after receipt (`useScaffoldWriteContract.ts:109,143`). For a no-approval single-call flow this is correct.

### 5. Contract verified on Basescan — **FAIL**
- `https://basescan.org/address/0x118a4335ce160fe1b616368ee6685af25224f4dd` returns page metadata `Contract: Unverified`. Bytecode exists (confirmed with `eth_getCode` via Alchemy), so the address is correct — verification was never submitted.
- Fix: `yarn verify --network base` from `packages/foundry/` (SE2 built-in; no Basescan API key needed).

### 6. SE2 footer branding removed — **PASS**
- `packages/nextjs/components/Footer.tsx` is a fully custom Windows 95 taskbar. No `BuidlGuidl`, `Fork me`, `SpeedRun`, or `nativeCurrencyPrice` references anywhere in the file. A repo-wide grep for `Fork|SpeedRun|buidlguidl` returns only `mainnet.rpc.buidlguidl.com` in `wagmiConfig.tsx:21` (RPC URL — not branding) and a commented-out example in `scaffold.config.ts:31`.

### 7. SE2 tab title template removed — **PASS** (with caveat)
- `packages/nextjs/utils/scaffold-eth/getMetadata.ts:6` — `titleTemplate = "%s | Onchain Guestbook"`. Not `"%s | Scaffold-ETH 2"`.
- Root layout passes `title: "Onchain Guestbook"` at `app/layout.tsx:9`. On the root path the tab title becomes `Onchain Guestbook`; on child routes (e.g. `/signer/...`) it becomes `<subtitle> | Onchain Guestbook`. Acceptable.

### 8. SE2 README replaced — **FAIL**
- `README.md:1` begins `# 🏗 Scaffold-ETH 2` and the whole file is the stock SE2 template (docs link, "Quickstart", etc.). No project content.
- Fix: replace with a README describing the Onchain Guestbook (what it is, live URL, contract address, how to run).

### 9. Favicon replaced — **PASS** (appears custom; cannot fully verify without visual)
- `packages/nextjs/public/favicon.png` is a PNG 256x256 RGBA, 5745 bytes, modified in this repo's working tree on Apr 18 (same day as guestbook commits). This is not the SE2 default `favicon.ico` template. `getMetadata.ts:47–52` wires `/favicon.png` as the icon. Marked PASS on file evidence; visual confirmation would require a browser render which is out of scope for this read-only audit.

---

## Should-Fix Checklist

### 10. Contract address displayed with `<Address/>` — **FAIL**
- Repo-wide search found no user-facing render of the deployed GuestBook address. It appears only in the auto-generated `packages/nextjs/contracts/deployedContracts.ts:10`. The home page (`app/page.tsx`) and the signer page (`app/signer/[address]/page.tsx`) never display the contract address.
- Fix: add `<Address address={guestBookContract.address} />` (from `@scaffold-ui/components`) somewhere visible (footer, about section, header, or status bar). `useDeployedContractInfo({ contractName: "GuestBook" })` gives you the address.

### 11. OG image uses absolute URL via `NEXT_PUBLIC_PRODUCTION_URL` — **FAIL**
- `packages/nextjs/utils/scaffold-eth/getMetadata.ts:3–5` builds `baseUrl` from `VERCEL_PROJECT_PRODUCTION_URL` or falls back to `http://localhost:3000`. Repo-wide grep for `NEXT_PUBLIC_PRODUCTION_URL` returns zero matches — the SE2-only Vercel pattern is still in place.
- Impact: OG image URL on an IPFS build will be `http://localhost:3000/thumbnail.jpg`, which will not unfurl anywhere. This is a Stage 9 ship-blocker for social sharing even though the QA framework tags it "should-fix".
- Fix: update `getMetadata.ts` to prefer `process.env.NEXT_PUBLIC_PRODUCTION_URL` before the Vercel fallback, and set `NEXT_PUBLIC_PRODUCTION_URL` to the bgipfs URL at build time.

### 12. `--radius-field: 0.5rem` in both theme blocks — **PASS** (intentional Win95 variant)
- `packages/nextjs/styles/globals.css:38` and `:63` — both theme blocks set `--radius-field: 0;` and `--radius-box: 0;` (zero, not 9999rem). Windows 95 is strictly sharp-cornered so `0` is intentional and correct. Not `0.5rem` literally, but the spec ("changed from `9999rem`") is satisfied — no pill-shaped fields.

### 13. All token amounts have USD context — **N/A**
- No tokens. No ETH amounts shown. Only on-chain entry counts and strings.

### 14. Errors mapped to human-readable messages — **PASS** (with caveat)
- `hooks/scaffold-eth/useTransactor.tsx:99` calls `getParsedErrorWithAllAbis(error, chainId)` and surfaces the result via `notification.error`. Revert reason decoding path is in place.
- Trace: the only write is `sign(string)` which reverts with `"Message empty"` / `"Message too long"` string reverts (standard `require` revert reasons). Those decode without any custom-error ABI entries via `viem`'s built-in string revert parsing. Custom errors from `GuestBook.sol` are not used.
- `SignDialog.tsx:35–37` silently `console.error`'s after `writeContractAsync` — but this is fine, because `useTransactor` already fired `notification.error` with the parsed message before rejecting. PASS.

### 15. Phantom wallet in RainbowKit wallet list — **FAIL**
- `packages/nextjs/services/web3/wagmiConnectors.tsx:2–9` imports `metaMaskWallet, walletConnectWallet, ledgerWallet, baseAccount, rainbowWallet, safeWallet`. No `phantomWallet`.
- Repo-wide grep for `phantomWallet|phantom` returns zero matches.
- Fix: add `phantomWallet` to the imports from `@rainbow-me/rainbowkit/wallets` and into the `wallets` array at `wagmiConnectors.tsx:20–28`.

### 16. Mobile deep linking: `writeAndOpen` pattern — **FAIL**
- Repo-wide grep for `writeAndOpen|openWallet` returns zero matches. No mobile deep-link helper exists. Every write call (just `sign()` in this app) goes through `writeContractAsync` directly with no post-TX `setTimeout(openWallet, 2000)`.
- Impact: on mobile WalletConnect connections, tapping "OK" fires the TX over WC relay but does not switch the user to their wallet app. User sits on a loading UI and has to manually swap apps to sign.
- Fix: implement the `writeAndOpen` helper and wrap the `sign()` call in `SignDialog.submit`.

### 17. `appName` in `wagmiConnectors.tsx` — **PASS**
- `packages/nextjs/services/web3/wagmiConnectors.tsx:49` — `appName: "Onchain Guestbook"`. Not `"scaffold-eth-2"`. Good — this is the label users see in the WalletConnect modal.

---

## Additional Checks

### 18. `pollingInterval: 3000` — **PASS**
- `packages/nextjs/scaffold.config.ts:21` — `pollingInterval: 3000`.

### 19. RPC override uses Alchemy — **FAIL (subtle)**
- `scaffold.config.ts:15` defines `DEFAULT_ALCHEMY_API_KEY = "cR4WnXePioePZ5fFrnSiR"` — the shared SE2 template key. In-code comment flags this.
- `scaffold.config.ts:26` reads `process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || DEFAULT_ALCHEMY_API_KEY`.
- `services/web3/wagmiConfig.tsx:19–32` has a branch: if using `DEFAULT_ALCHEMY_API_KEY`, Alchemy is appended to the END of the fallback transport list behind bare `http()` (viem's public RPC); if a non-default key is set, Alchemy goes to position 0.
- **Concrete risk:** if the IPFS build is produced without `NEXT_PUBLIC_ALCHEMY_API_KEY` set in the build environment, `scaffoldConfig.alchemyApiKey` resolves to `DEFAULT_ALCHEMY_API_KEY` at build time (Next.js inlines `process.env.NEXT_PUBLIC_*` at build, not at runtime) — the transport then silently hits Base's default public RPC first and is rate-limited.
- Fix: ensure `NEXT_PUBLIC_ALCHEMY_API_KEY` is exported in the build shell before `yarn build` in Stage 8. (Not a source-code fix — a build-process fix — but Stage 8 must verify it.) Also consider removing the bare `http()` fallback per the QA skill's guidance ("Bare http() fallback removed; only intended configured transports remain").

### 20. Blockexplorer disabled for IPFS build — **PASS**
- `packages/nextjs/app/` contains only `layout.tsx`, `not-found.tsx`, `page.tsx`, and `signer/`. Neither `app/blockexplorer/` nor `app/_blockexplorer-disabled/` exist — the route was deleted outright. Static export will not crash on localStorage-at-import from SE2's block explorer.
- Note: the `packages/nextjs/` directory also has no `polyfill-localstorage.cjs` — if Stage 8's build ever hits a localStorage-at-import elsewhere, the `NODE_OPTIONS` polyfill trick from the Known Footguns section is not armed. For this app (no block explorer, no debug-contracts tab visible, no RainbowKit storage-at-import that I saw in the rendered routes) that should be fine, but Stage 8 must run `yarn build` with `NEXT_PUBLIC_IPFS_BUILD=true` and confirm success.

### 21. Build output exists at `packages/nextjs/out/` — **FAIL (not built)**
- `packages/nextjs/out/` does not exist in the current working tree. No production static export has been produced. Stage 8 will have to run `NEXT_PUBLIC_IPFS_BUILD=true yarn build` to generate it.

### 22. Windows 95 theme looks intentional — **PASS**
- `packages/nextjs/styles/globals.css` implements a complete Win95 design system: teal `#008080` desktop background (`:78–86`, `:113–116`), `#c0c0c0` chrome gray, `#000080` title-bar navy, `.win95-outset` / `.win95-inset` / `.win95-inset-gray` beveled-border primitives, `.win95-btn` with active-press inverted borders, `.win95-taskbar`, `.win95-titlebar` gradient, MS Sans Serif font stack (`--font-win95` at `:8`).
- Components consume it consistently: `Win95Window`, `Header` (Start button + taskbar), `Footer` (status-bar with live clock + network name), `SignDialog` (modal window + title-bar controls), `EntryList` (inset white pane), `EntryRow` (entry rows with dotted separator and highlight flash), `SignerDisplay` (navy underlined links). Tab title includes `📖 Onchain Guestbook — [Read Only]` emulating Win95 window title text (`page.tsx:51`). The theme is intentional, coherent, and comprehensive.

---

## Summary — what must change before Stage 8 / Stage 9

### Ship-blockers (must pass before Stage 8 fixes begin)
1. **[#3] `targetNetworks`** — change `[chains.foundry]` → `[chains.base]` in `packages/nextjs/scaffold.config.ts:19`.
2. **[#5] Contract verification** — run `yarn verify --network base` from `packages/foundry/` for the GuestBook deployment. Basescan currently reports "Contract: Unverified".
3. **[#8] README** — replace the stock SE2 template with Onchain Guestbook content (what it is, live URL, contract address, how to contribute).

### Should-fix (must pass before Stage 9 / job completion)
4. **[#10] `<Address/>` display** — show the GuestBook contract address somewhere in the UI using `@scaffold-ui/components`'s `<Address/>`.
5. **[#11] OG image absolute URL** — prefer `NEXT_PUBLIC_PRODUCTION_URL` in `utils/scaffold-eth/getMetadata.ts` so social unfurls work on the bgipfs URL.
6. **[#15] Phantom wallet** — add `phantomWallet` to `services/web3/wagmiConnectors.tsx`.
7. **[#16] Mobile deep linking** — add a `writeAndOpen`/`openWallet` helper and wrap the `sign()` write call in `SignDialog.tsx`.
8. **[#19] RPC** — verify `NEXT_PUBLIC_ALCHEMY_API_KEY` is exported in the build shell in Stage 8 so Alchemy is prioritized over the bare `http()` public fallback at build-inline time.

### Tracking
- **PASS:** 1, 2, 6, 7, 9, 12, 14, 17, 18, 20, 22 (11 items)
- **FAIL:** 3, 5, 8, 10, 11, 15, 16, 19, 21 (9 items — #21 is "build not run yet", not a defect)
- **N/A:** 4, 13 (2 items)

**Verdict: NOT ready for Stage 8 — proceed to Stage 8 to fix the items above.**
