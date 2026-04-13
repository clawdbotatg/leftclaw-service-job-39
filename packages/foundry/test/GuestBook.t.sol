// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import { GuestBook } from "../contracts/GuestBook.sol";

contract GuestBookTest is Test {
    GuestBook internal guestBook;

    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    event Signed(address indexed signer, uint256 indexed index, string message, uint256 timestamp);

    function setUp() public {
        guestBook = new GuestBook();
    }

    function test_InitialStateIsEmpty() public view {
        assertEq(guestBook.getEntryCount(), 0);
        GuestBook.Entry[] memory page = guestBook.getEntries(0, 10);
        assertEq(page.length, 0);
    }

    function test_Sign_StoresEntry() public {
        vm.warp(1_700_000_000);
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit Signed(alice, 0, "hello world", 1_700_000_000);
        guestBook.sign("hello world");

        assertEq(guestBook.getEntryCount(), 1);
        (address signer, string memory message, uint256 timestamp) = guestBook.getEntry(0);
        assertEq(signer, alice);
        assertEq(message, "hello world");
        assertEq(timestamp, 1_700_000_000);
    }

    function test_Sign_MultipleFromSameAddress() public {
        vm.startPrank(alice);
        guestBook.sign("first");
        guestBook.sign("second");
        guestBook.sign("third");
        vm.stopPrank();

        assertEq(guestBook.getEntryCount(), 3);
        uint256[] memory indices = guestBook.getEntriesBySigner(alice);
        assertEq(indices.length, 3);
        assertEq(indices[0], 0);
        assertEq(indices[1], 1);
        assertEq(indices[2], 2);
    }

    function test_Sign_MultipleSigners() public {
        vm.prank(alice);
        guestBook.sign("from alice");
        vm.prank(bob);
        guestBook.sign("from bob");
        vm.prank(alice);
        guestBook.sign("alice again");

        assertEq(guestBook.getEntryCount(), 3);

        uint256[] memory aliceIdx = guestBook.getEntriesBySigner(alice);
        assertEq(aliceIdx.length, 2);
        assertEq(aliceIdx[0], 0);
        assertEq(aliceIdx[1], 2);

        uint256[] memory bobIdx = guestBook.getEntriesBySigner(bob);
        assertEq(bobIdx.length, 1);
        assertEq(bobIdx[0], 1);
    }

    function test_GetEntries_Pagination() public {
        for (uint256 i = 0; i < 25; i++) {
            vm.prank(alice);
            guestBook.sign(vm.toString(i));
        }

        GuestBook.Entry[] memory page1 = guestBook.getEntries(0, 10);
        assertEq(page1.length, 10);
        assertEq(page1[0].message, "0");
        assertEq(page1[9].message, "9");

        GuestBook.Entry[] memory page2 = guestBook.getEntries(10, 10);
        assertEq(page2.length, 10);
        assertEq(page2[0].message, "10");

        GuestBook.Entry[] memory page3 = guestBook.getEntries(20, 10);
        assertEq(page3.length, 5); // clamped
        assertEq(page3[0].message, "20");
        assertEq(page3[4].message, "24");
    }

    function test_GetEntries_StartBeyondEndReturnsEmpty() public {
        vm.prank(alice);
        guestBook.sign("only");
        GuestBook.Entry[] memory page = guestBook.getEntries(5, 10);
        assertEq(page.length, 0);
    }

    function test_GetEntry_RevertsOnOutOfBounds() public {
        vm.expectRevert();
        guestBook.getEntry(0);
    }

    function test_GetEntriesBySigner_EmptyForUnknownAddress() public view {
        uint256[] memory indices = guestBook.getEntriesBySigner(address(0xdead));
        assertEq(indices.length, 0);
    }

    function testFuzz_Sign_AnyMessage(string calldata message) public {
        vm.prank(alice);
        guestBook.sign(message);
        (, string memory stored,) = guestBook.getEntry(0);
        assertEq(stored, message);
    }
}
