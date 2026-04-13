# Build Plan — Job #39

## Client
0x34aA3F359A9D614239015126635CE7732c18fDF3

## Spec
// --- build-plan.md ---
# Build Plan: Onchain Guestbook

## Overview
A public guestbook dApp on Base where anyone can leave a message stored fully onchain in contract storage. No access control, no message limits — a permanent, permissionless record of messages.

## Smart Contracts

### GuestBook.sol
**Storage:**
- `struct Entry { address signer; string message; uint256 timestamp; }`
- `Entry[] public entries` — append-only array of all guestbook entries
- `mapping(address => uint256[]) public entryIndicesBySigner` — lookup entries by address

**Functions:**
- `sign(string calldata _message)` — pushes a new Entry with msg.sender, _message, block.timestamp. No restrictions, no access control. Same address can sign multiple times.
- `getEntry(uint256 _index) public view returns (address signer, string memory message, uint256 timestamp)` — read a single entry
- `getEntries(uint256 _start, uint256 _count) public view returns (Entry[] memory)` — paginated read for the frontend. Prevents unbounded return data.
- `getEntryCount() public view returns (uint256)` — total number of entries
- `getEntriesBySigner(address _signer) public view returns (uint256[] memory)` — returns array of indices for a given signer

**Access Control:** None. No owner, no pause, no admin. Passes the walkaway test — it's a hyperstructure.

## Frontend

### Pages
- **Home / Guestbook:** Scrollable list of all entries (paginated, newest first). Each entry shows ENS name or truncated address, message text, and relative timestamp. "Sign the Guestbook" button at top.
- **Sign Modal/Form:** Text input for message, connect wallet button if not connected, submit button that calls `sign()`. Show gas estimate before confirming. Show loading → success → entry appears in list.
- **Address View:** Click on any signer address to see all their entries filtered via `entryIndicesBySigner`.

### Key UX
- Wallet connection via RainbowKit (SE2 default)
- Resolve ENS names for signers using `useEnsName`
- Paginate entries — load 20 at a time, "Load More" button
- After signing, scroll to the new entry and highlight it briefly
- Show total entry count prominently ("247 people have signed")

## Integrations
- **ENS:** Resolve signer addresses to ENS names for display (via mainnet RPC call)
- **Blockscout (Base):** Link each entry's signer address to Base Blockscout explorer

## Security Notes
- **Unbounded string storage:** No limit by design. Gas cost is the natural rate-limiter — callers pay for their own storage. No risk to the contract itself.
- **No reentrancy risk:** `sign()` only writes to storage, no external calls, no ETH transfers.
- **Array growth:** `entries` array grows forever. `getEntries` uses pagination to prevent out-of-gas on reads. Never return the full array.
- **No upgradability, no owner:** Immutable contract. Once deployed, it runs forever with no admin risk.

## Recommended Stack
- **Contracts:** Solidity + Foundry. Deploy to Base via `forge script`.
- **Frontend:** Scaffold-ETH 2 (Next.js + wagmi + viem + RainbowKit)
- **RPC:** Alchemy (Base)
- **Hosting:** BGIPFS for static frontend, ENS subdomain for production URL
- **L2:** Base

See consultation plan for full scope and requirements.

--- Client Messages (authoritative — may override spec) ---
make this windows 95 themed please!

## Deploy
- Chain: Base (8453)
- RPC: Alchemy (ALCHEMY_API_KEY in .env)
- Deployer: 0x7a8b288AB00F5b469D45A82D4e08198F6Eec651C (DEPLOYER_PRIVATE_KEY in .env)
- All owner/admin/treasury roles transfer to client: 0x34aA3F359A9D614239015126635CE7732c18fDF3
