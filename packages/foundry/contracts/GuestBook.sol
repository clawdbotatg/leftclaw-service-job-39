// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Onchain Guestbook
/// @notice Permissionless, append-only guestbook. Anyone can sign. No owner, no admin.
contract GuestBook {
    struct Entry {
        address signer;
        string message;
        uint256 timestamp;
    }

    /// @notice Known issue: _entries and _entryIndicesBySigner[signer] grow forever — intentional hyperstructure property; getEntries is paginated to mitigate per-call gas
    Entry[] private _entries;
    mapping(address => uint256[]) private _entryIndicesBySigner;

    event Signed(address indexed signer, uint256 indexed index, string message, uint256 timestamp);

    /// @notice Append a message to the guestbook. No restrictions.
    function sign(string calldata _message) external {
        uint256 index = _entries.length;
        _entries.push(Entry({ signer: msg.sender, message: _message, timestamp: block.timestamp }));
        _entryIndicesBySigner[msg.sender].push(index);
        emit Signed(msg.sender, index, _message, block.timestamp);
    }

    /// @notice Read a single entry.
    function getEntry(uint256 _index)
        external
        view
        returns (address signer, string memory message, uint256 timestamp)
    {
        Entry storage e = _entries[_index];
        return (e.signer, e.message, e.timestamp);
    }

    /// @notice Paginated read. Returns up to `_count` entries starting at `_start`.
    /// @dev If `_start` is past the end, returns an empty array. Clamps `_count` to remaining length.
    function getEntries(uint256 _start, uint256 _count) external view returns (Entry[] memory page) {
        uint256 total = _entries.length;
        if (_start >= total) {
            return new Entry[](0);
        }
        uint256 end = _start + _count;
        if (end > total) {
            end = total;
        }
        uint256 size = end - _start;
        page = new Entry[](size);
        for (uint256 i = 0; i < size; i++) {
            page[i] = _entries[_start + i];
        }
    }

    /// @notice Total number of entries.
    function getEntryCount() external view returns (uint256) {
        return _entries.length;
    }

    /// @notice Array of entry indices for a given signer.
    function getEntriesBySigner(address _signer) external view returns (uint256[] memory) {
        return _entryIndicesBySigner[_signer];
    }
}
