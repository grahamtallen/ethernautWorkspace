// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GatekeeperOne {
    address public entrant;
    uint256 public gasRemaining;

    modifier gateOne() {
        require(msg.sender != tx.origin, "failed gate 1");
        _;
    }

    modifier gateTwo() {
        require(gasleft() % 8191 == 0, "failed gate 2");
        _;
    }

    function gateTwoFn() public gateOne returns (bool) {
        // return true;
        gasRemaining = gasleft();
        // require(gasleft() % 8191 == 0, "failed gate 2");
        return gasleft() % 8191 == 0;
    }



    modifier gateThree(bytes8 _gateKey) {
        require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)), "GatekeeperOne: invalid gateThree part one");
        require(uint32(uint64(_gateKey)) != uint64(_gateKey), "GatekeeperOne: invalid gateThree part two");
        require(uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)), "GatekeeperOne: invalid gateThree part three");
        _;
    }

    function enter() public gateOne gateTwo returns (bool) {
        entrant = tx.origin;
        return true;
    }
}