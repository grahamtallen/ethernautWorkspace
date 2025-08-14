import { network } from "hardhat";
const { ethers } = await network.connect();
async function main() {
    const GatekeeperOneHacker = await ethers.getContractFactory("GatekeeperOneHacker");
    const gatekeeperAddress = "0x..."; // existing GatekeeperOne on Sepolia
    const hacker = await GatekeeperOneHacker.deploy(gatekeeperAddress);

    console.log("Hacker deployed at:", hacker.getAddress());
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
