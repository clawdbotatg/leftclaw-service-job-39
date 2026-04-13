// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { GuestBook } from "../contracts/GuestBook.sol";

/**
 * @notice Main deployment script
 * @dev Uses vm.startBroadcast() with no args so forge picks up the --private-key CLI flag at deploy time.
 *      For local runs, the DEPLOYER_PRIVATE_KEY from env is used via the default yarn deploy flow.
 */
contract DeployScript is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        GuestBook guestBook = new GuestBook();

        deployments.push(Deployment({ name: "GuestBook", addr: address(guestBook) }));

        // GuestBook has no owner/admin/treasury roles by design — it is a hyperstructure.
        // Nothing to transfer to the client address.
    }
}
