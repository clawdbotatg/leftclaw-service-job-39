# 📖 Onchain Guestbook — Windows 95 Edition

A permanent, public guestbook that lives entirely on Base. Leave a message and your signature stays on chain forever — no edits, no deletes. The UI is styled as a Windows 95 desktop app, beveled chrome, taskbar, status bar, and all.

- **Live app:** published on IPFS via bgipfs — see the deployment tag / release for the current CID
- **Chain:** Base mainnet (chain id `8453`)
- **Contract:** [`0x118a4335CE160FE1B616368Ee6685aF25224f4Dd`](https://basescan.org/address/0x118a4335CE160FE1B616368Ee6685aF25224f4Dd) — `GuestBook`

## What it does

- Anyone with a wallet on Base can call `sign(string message)` and append a message to the guestbook
- Every entry is stored on chain with `signer`, `message`, and `timestamp`
- The frontend reads `getEntryCount()` + `getEntries(offset, limit)` to paginate the book
- `Signed(address signer, uint256 index, string message, uint256 timestamp)` events are watched live so new signatures appear as soon as they're mined
- Click any signer to see every entry they've ever left (`/signer/<address>`)

## How to sign

1. Open the app on Base mainnet
2. Click **Sign the Guestbook** in the title bar of the window
3. Type a message (1–500 characters)
4. Connect a wallet if you haven't already — MetaMask, WalletConnect, Coinbase Wallet, Rainbow, Ledger, Phantom, and Safe are all wired up
5. Click **OK**, approve the transaction, wait for one block confirmation, done

Gas is a few cents on Base. Your message is public and permanent.

## Windows 95 aesthetic

The Win95 theme is intentional and comprehensive. The desktop background is the classic teal `#008080`; chrome is `#c0c0c0`; the title bar is the classic navy-to-blue gradient; buttons have outset/inset bevels that invert on press; the footer is a status-bar taskbar with a live clock. MS Sans Serif is loaded from `next/font` so it works in static export. Field corners are strictly sharp (`--radius-field: 0`) — no rounded anything, this is 1995.

## Stack

- **Contracts:** Solidity + Foundry (`packages/foundry/contracts/GuestBook.sol`)
- **Frontend:** Next.js App Router + Scaffold-ETH 2, built to static export for IPFS hosting
- **Wallets:** RainbowKit v2 (MetaMask, WalletConnect, Coinbase, Rainbow, Ledger, Phantom, Safe)
- **RPC:** Alchemy (set `NEXT_PUBLIC_ALCHEMY_API_KEY` in the build shell)
- **Hosting:** IPFS via [bgipfs](https://bgipfs.com)

## Running locally

Requires Node 20+, Yarn, and Foundry installed.

```bash
# Install
yarn install

# Start a local Anvil chain + deploy the GuestBook contract
yarn chain              # terminal 1
yarn deploy             # terminal 2 (deploys to localhost)
yarn start              # terminal 3 — http://localhost:3000
```

Point the frontend at Base instead of Anvil by confirming `packages/nextjs/scaffold.config.ts` has `targetNetworks: [chains.base]` (it does by default in this repo).

## Deploying

Contract deployment to Base mainnet (requires a funded deployer):

```bash
yarn deploy --network base
yarn verify --network base      # Basescan verification, no API key needed
```

Frontend static export for IPFS:

```bash
# Set the production URL so the OG image unfurls correctly
echo 'NEXT_PUBLIC_PRODUCTION_URL=https://<CID>.ipfs.community.bgipfs.com' > packages/nextjs/.env.local

# Build (two-pass build — first pass to get a CID, second pass with that CID baked in)
cd packages/nextjs
NEXT_PUBLIC_IPFS_BUILD=true NODE_OPTIONS="--require ./polyfill-localstorage.cjs" yarn build

# Upload
npx bgipfs upload packages/nextjs/out
```

## Contract interface

```solidity
function sign(string calldata message) external;              // append a message
function getEntryCount() external view returns (uint256);      // total entries
function getEntries(uint256 offset, uint256 limit)             // paginated read
  external view returns (Entry[] memory);
function getSignerEntryCount(address signer)                   // per-signer count
  external view returns (uint256);
function getSignerEntries(address signer, uint256 offset, uint256 limit)
  external view returns (Entry[] memory);
```

`Entry` is `struct Entry { address signer; string message; uint256 timestamp; }`.

Messages must be between 1 and 500 bytes. The contract reverts with `"Message empty"` or `"Message too long"` on invalid input. Ownership is transferred to the job client at deployment time; the owner has no special write privileges on the guestbook itself (ownership is there so the project can register/upgrade off-chain integrations without changing the book's contents).

## License

MIT. See `LICENCE`.
