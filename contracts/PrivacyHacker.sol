// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Privacy.sol";

contract PrivacyHacker {
    Privacy privacy;
    address txOrigin;
    constructor(address privacyAddress, address _txOrigin) {
        privacy = Privacy(privacyAddress);
        txOrigin = _txOrigin;
    
    }

    function getKey() public view returns (bytes16) {
        // _key == bytes16(data[2])
        bytes16 key = bytes16(keccak256(abi.encodePacked(txOrigin, "2")));
        return key;
    }
    
}